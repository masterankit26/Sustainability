from flask import Flask, request, jsonify
from datetime import datetime
from flask_cors import CORS
import requests


app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return jsonify({"status": "Backend is running"})


# 🌍 Weather + location data route
@app.route('/api/location-data', methods=['GET'])
def location_data():
    try:
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))

        url = (
            f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}'
            f'&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,precipitation,soil_moisture_0_1cm'
            f'&current_weather=true&timezone=auto'
        )

        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        hourly = data.get('hourly', {})

        def get_latest(series):
            values = hourly.get(series, [])
            for v in reversed(values):
                if isinstance(v, (int, float)):
                    return v
            return None

        def get_forecast(series, hours=1):
            values = hourly.get(series, [])
            return sum(values[:hours]) if values else None

        return jsonify({
            'temp_max': max(hourly.get("temperature_2m", []), default=None),
            'temp_min': min(hourly.get("temperature_2m", []), default=None),
            'humidity': get_latest("relative_humidity_2m"),
            'wind_speed': get_latest("windspeed_10m"),
            'rainfall': get_forecast("precipitation", hours=1),
            'soil_moisture': get_latest("soil_moisture_0_1cm"),
            'temperature': get_latest("temperature_2m"),
            'history': hourly
        })

    except Exception as e:
        print("❌ Backend error:", str(e))
        return jsonify({'error': 'Failed to fetch weather data'}), 500




@app.route('/api/energy', methods=['GET'])
def energy_dashboard():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)

    # Optional system parameters
    panel_size = request.args.get('panel_size', default=10.0, type=float)  # m²
    efficiency = request.args.get('efficiency', default=0.20, type=float)  # 20%
    usage_pct = request.args.get('usage_pct', default=0.60, type=float)    # 60%
    co2_factor = request.args.get('co2_factor', default=0.85, type=float)  # kg CO₂/kWh

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and Longitude required"}), 400

    today = datetime.utcnow().strftime('%Y%m%d')

    # 🌞 NASA POWER API (hourly data for today)
    url = (
        f"https://power.larc.nasa.gov/api/temporal/hourly/point"
        f"?start={today}&end={today}"
        f"&latitude={lat}&longitude={lon}"
        f"&parameters=ALLSKY_SFC_SW_DWN&format=JSON"
    )

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        irradiance_data = (
            data.get('properties', {})
                .get('parameter', {})
                .get('ALLSKY_SFC_SW_DWN', {})
        )

        if not irradiance_data:
            raise ValueError("Missing irradiance data")

        # ✅ Use the latest non-zero value if available
        latest_hour = None
        solar_irradiance = 0
        for hour in sorted(irradiance_data.keys(), reverse=True):
            if irradiance_data[hour] and irradiance_data[hour] > 0:
                latest_hour = hour
                solar_irradiance = irradiance_data[hour]
                break

        if latest_hour is None:
            raise ValueError("No valid irradiance values found")

        solar_irradiance_kwh = solar_irradiance / 1000.0  # Wh → kWh

        # ⚡ Estimate generation
        solar_kw = round(solar_irradiance_kwh * panel_size * efficiency, 3)
        usage_kw = round(solar_kw * usage_pct, 3)
        co2_saved = round((solar_kw - usage_kw) * co2_factor, 3)

        return jsonify({
            "timestamp": latest_hour,
            "solar_kw": solar_kw,
            "usage_kw": usage_kw,
            "co2_saved": max(co2_saved, 0),
            "params": {
                "panel_size_m2": panel_size,
                "efficiency": efficiency,
                "usage_pct": usage_pct,
                "co2_factor": co2_factor
            }
        })

    except Exception as e:
        print("❌ NASA API error:", str(e))
        return jsonify({
            "solar_kw": 0,
            "usage_kw": 0,
            "co2_saved": 0,
            "note": "Fallback data used due to NASA API error"
        })


# 🌱 Simulation route with accurate Indian crop data
@app.route('/api/simulation', methods=['POST'])
def simulation_tool():
    try:
        data = request.get_json(force=True)
        area = float(data.get('area', 1))   # farmland area in acres
        crop = data.get('crop', 'maize').lower()
        rate = float(data.get('rate', 6.5))  # ₹ per electricity unit

        crop_water_req = {
            "rice": 45987, "wheat": 15176, "maize": 18395, "sorghum": 19271,
            "millet": 17986, "barley": 14000, "sugarcane": 24731, "cotton": 17986,
            "jute": 20000, "tobacco": 21000, "pulses": 16187, "gram": 12000,
            "lentil": 12500, "pigeonpea": 15000, "mungbean": 14000, "groundnut": 19656,
            "soybean": 15176, "mustard": 11803, "sunflower": 13490, "sesame": 13000,
            "castor": 16000, "vegetables": 17986, "potato": 22483, "onion": 20000,
            "tomato": 18000, "cabbage": 16000, "cauliflower": 16500, "brinjal": 17000,
            "okra": 15000, "banana": 25000, "mango": 12000, "citrus": 15000,
            "papaya": 20000, "pomegranate": 14000, "apple": 10000, "grapes": 18000,
            "guava": 12000, "tea": 20000, "coffee": 17000, "coconut": 25000, "arecanut": 22000
        }

        base_req = crop_water_req.get(crop, 18000)

        water_saved = round(area * base_req * 0.3, 2)  # liters/day
        cost_saved = round((water_saved / 1000) * rate, 2)
        investment = area * 5000  # ₹5000/acre baseline
        roi = round((cost_saved * 365 / investment) * 100, 2)

        return jsonify({
            "crop": crop,
            "area_acres": area,
            "water_saved_liters_per_day": water_saved,
            "cost_saved_inr_per_day": cost_saved,
            "roi_percent_per_year": roi,
            "note": "Values are averages. Actual needs vary with soil, region, and climate."
        })

    except Exception as e:
        print("❌ Simulation error:", str(e))
        return jsonify({'error': 'Failed to run simulation'}), 500



if __name__ == '__main__':
    print("✅ Backend running...")
    app.run(debug=True)
