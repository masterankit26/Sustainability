from flask import Flask, request, jsonify
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

        response = requests.get(url)
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
            return sum(values[:hours]) if all(isinstance(v, (int, float)) for v in values[:hours]) else None

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



# 🌱 Simulation route with accurate Indian crop data
@app.route('/api/simulation', methods=['POST'])
def simulation_tool():
    try:
        data = request.get_json(force=True)
        area = float(data.get('area', 1))   # farmland area in acres
        crop = data.get('crop', 'maize').lower()
        rate = float(data.get('rate', 6.5))  # ₹ per electricity unit

        # 🌾 Crop-specific water requirements (liters/acre/day)
        # Approximate averages for Indian conditions
        crop_water_req = {
            # Cereals
            "rice": 45987,
            "wheat": 15176,
            "maize": 18395,
            "sorghum": 19271,   # jowar
            "millet": 17986,    # bajra & others
            "barley": 14000,

            # Cash crops
            "sugarcane": 24731,
            "cotton": 17986,
            "jute": 20000,
            "tobacco": 21000,

            # Pulses
            "pulses": 16187,
            "gram": 12000,
            "lentil": 12500,
            "pigeonpea": 15000,
            "mungbean": 14000,

            # Oilseeds
            "groundnut": 19656,
            "soybean": 15176,
            "mustard": 11803,
            "sunflower": 13490,
            "sesame": 13000,
            "castor": 16000,

            # Vegetables
            "vegetables": 17986,  # average
            "potato": 22483,
            "onion": 20000,
            "tomato": 18000,
            "cabbage": 16000,
            "cauliflower": 16500,
            "brinjal": 17000,
            "okra": 15000,

            # Fruits
            "banana": 25000,
            "mango": 12000,
            "citrus": 15000,
            "papaya": 20000,
            "pomegranate": 14000,
            "apple": 10000,
            "grapes": 18000,
            "guava": 12000,

            # Plantation crops
            "tea": 20000,
            "coffee": 17000,
            "coconut": 25000,
            "arecanut": 22000
        }

        # Default if crop not listed
        base_req = crop_water_req.get(crop, 18000)  # fallback average

        # ✅ Smart irrigation assumption: saves 30% water
        water_saved = round(area * base_req * 0.3, 2)  # liters/day

        # ✅ Electricity cost saved
        # Assumption: 1 unit electricity = 1000 liters pumped
        cost_saved = round((water_saved / 1000) * rate, 2)

        # ✅ ROI calculation
        investment = area * 5000  # ₹5000/acre baseline investment
        roi = round((cost_saved * 365 / investment) * 100, 2)  # yearly ROI %

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
    app.run(debug=True)
