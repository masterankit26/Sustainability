from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import pytz
import math

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


# 🌞 Energy route using Open-Meteo solar radiation
@app.route('/api/energy', methods=['GET'])
def energy_dashboard():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)

    panel_size = request.args.get('panel_size', default=10.0, type=float)
    efficiency = request.args.get('efficiency', default=0.20, type=float)
    usage_pct = request.args.get('usage_pct', default=0.60, type=float)
    co2_factor = request.args.get('co2_factor', default=0.85, type=float)

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and Longitude required"}), 400

    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&daily=shortwave_radiation_sum"
        f"&timezone=auto"
    )

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        daily = data.get("daily", {})
        daily_times = daily.get("time", [])
        daily_radiation = daily.get("shortwave_radiation_sum", [])

        if not daily_times or not daily_radiation:
            raise ValueError("No solar radiation data found")

        # Local timezone
        tz = data.get("timezone", "UTC")
        now = datetime.now(pytz.timezone(tz))
        today_str = now.strftime("%Y-%m-%d")

        if today_str in daily_times:
            d_idx = daily_times.index(today_str)
            daily_val_wh = daily_radiation[d_idx]        # Wh/m²
            daily_val_kwh = daily_val_wh / 1000.0        # convert to kWh/m²

            # Total daily generation
            solar_kw = round(daily_val_kwh * panel_size * efficiency, 3)
            usage_kw = round(solar_kw * usage_pct, 3)
            co2_saved = round(max(solar_kw - usage_kw, 0) * co2_factor, 3)
        else:
            solar_kw = usage_kw = co2_saved = 0

        return jsonify({
            "date": today_str,
            "solar_kw": solar_kw,
            "usage_kw": usage_kw,
            "co2_saved": co2_saved,
            "params": {
                "panel_size_m2": panel_size,
                "efficiency": efficiency,
                "usage_pct": usage_pct,
                "co2_factor": co2_factor
            },
            "note": "Daily energy total (kWh) shown instead of real-time"
        })

    except Exception as e:
        print("❌ Open-Meteo API error:", str(e))
        return jsonify({
            "solar_kw": 0,
            "usage_kw": 0,
            "co2_saved": 0,
            "note": "Fallback data used due to API error"
        })


# 🌱 Simulation route
@app.route('/api/simulation', methods=['POST'])
def simulation_tool():
    try:
        data = request.get_json(force=True)
        area = float(data.get('area', 1))
        crop = data.get('crop', 'maize').lower()
        rate = float(data.get('rate', 6.5))

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
        water_saved = round(area * base_req * 0.3, 2)
        cost_saved = round((water_saved / 1000) * rate, 2)
        investment = area * 5000
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
    # For deployment, use host='0.0.0.0' so Render or other hosts can access
    app.run(debug=True, host='0.0.0.0', port=5000)
