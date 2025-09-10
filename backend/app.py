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


# 🌱 Simulation route
@app.route('/api/simulation', methods=['POST'])
def simulation_tool():
    try:
        data = request.get_json(force=True)
        area = float(data.get('area', 1))
        crop = data.get('crop', 'maize').lower()
        rate = float(data.get('rate', 6.5))  # ₹/unit

        # Crop-specific water requirements (liters/acre/day)
        crop_water_req = {
            "wheat": 3500,
            "rice": 6000,
            "maize": 4000,
            "sugarcane": 5500,
            "cotton": 4500,
            "vegetables": 3000
        }

        # Default if crop not listed
        base_req = crop_water_req.get(crop, 4000)

        # Assume smart irrigation saves 30% water
        water_saved = round(area * base_req * 0.3, 2)  # liters/day

        # Electricity cost saved
        # Assume 1 unit of electricity = 1000 liters pumped
        cost_saved = round((water_saved / 1000) * rate, 2)

        # ROI calculation: Assume ₹5000/acre investment
        investment = area * 5000
        roi = round((cost_saved * 365 / investment) * 100, 2)  # yearly ROI %

        return jsonify({
            "water_saved": water_saved,
            "cost_saved": cost_saved,
            "roi": roi
        })

    except Exception as e:
        print("❌ Simulation error:", str(e))
        return jsonify({'error': 'Failed to run simulation'}), 500


if __name__ == '__main__':
    app.run(debug=True)
