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


# ----------------- ENERGY DASHBOARD -----------------
@app.route('/api/energy', methods=['GET'])
def energy_dashboard():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    panel_size = request.args.get('panel_size', default=10.0, type=float)  # m²
    efficiency = request.args.get('efficiency', default=0.20, type=float)

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and Longitude required"}), 400

    try:
        # Call Open-Meteo
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&hourly=shortwave_radiation,wind_speed_10m,precipitation"
            f"&daily=precipitation_sum"
            f"&timezone=auto"
        )
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        radiation = hourly.get("shortwave_radiation", [])
        wind_speed = hourly.get("wind_speed_10m", [])
        precipitation = hourly.get("precipitation", [])

        # Daily rainfall (for hydro)
        daily = data.get("daily", {})
        daily_precip = daily.get("precipitation_sum", [0])
        daily_rain_mm = daily_precip[0] if daily_precip else 0

        if not times:
            raise ValueError("No weather data found")

        # Match current local hour
        tz = data.get("timezone", "UTC")
        now = datetime.now(pytz.timezone(tz)).strftime("%Y-%m-%dT%H:00")
        if now in times:
            idx = times.index(now)
        else:
            idx = -1  # fallback

        # ---- Solar ----
        solar_rad = radiation[idx] if radiation else 0  # W/m²
        solar_kw = (solar_rad / 1000.0) * panel_size * efficiency  # kW

        # ---- Wind ----
        wind = wind_speed[idx] if wind_speed else 0
        air_density = 1.225  # kg/m³
        rotor_radius = 2  # meters
        swept_area = math.pi * rotor_radius**2
        turbine_eff = 0.35
        wind_kw = 0.5 * air_density * swept_area * (wind ** 3) * turbine_eff / 1000

        # ---- Hydro ----
        watershed_area = 1000  # m²
        head = 5  # meters
        hydro_eff = 0.7
        rain_m = daily_rain_mm / 1000
        volume_m3 = rain_m * watershed_area
        mass_kg = volume_m3 * 1000
        g = 9.81
        hydro_kw = (mass_kg * g * head * hydro_eff) / (3600 * 1000)

        return jsonify({
            "timestamp": times[idx],
            "solar_kw": round(solar_kw, 3),
            "wind_kw": round(wind_kw, 3),
            "hydro_kw": round(hydro_kw, 3)
        })

    except Exception as e:
        print("❌ Energy API error:", str(e))
        return jsonify({"solar_kw": 0, "wind_kw": 0, "hydro_kw": 0})


# ----------------- COMPARE USAGE -----------------
@app.route('/api/compare', methods=['GET'])
def compare_usage():
    generation = request.args.get('generation', type=float, default=1.0)  # kWh/day
    usage = request.args.get('usage', type=float, default=1.0)  # kWh/day

    balance = generation - usage
    return jsonify({
        "generation_kwh": round(generation, 2),
        "usage_kwh": round(usage, 2),
        "balance_kwh": round(balance, 2),
        "status": "Surplus" if balance >= 0 else "Deficit"
    })


# ----------------- CARBON FOOTPRINT -----------------
@app.route('/api/carbon_footprint', methods=['GET'])
def carbon_footprint():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    panel_size = request.args.get('panel_size', type=float, default=10.0)
    efficiency = request.args.get('efficiency', type=float, default=0.20)
    co2_factor = request.args.get('co2_factor', type=float, default=0.85)  # kg CO₂/kWh
    period = request.args.get('period', default="daily")

    if lat is None or lon is None:
        return jsonify({"error": "Latitude and Longitude required"}), 400

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&hourly=shortwave_radiation&timezone=auto"
        )
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        radiation = data.get("hourly", {}).get("shortwave_radiation", [])
        if not radiation:
            raise ValueError("No solar radiation data found")

        daily_kwh_m2 = sum(radiation) / 1000.0
        daily_gen = daily_kwh_m2 * panel_size * efficiency

        if period == "daily":
            gen_kwh = daily_gen
        elif period == "monthly":
            gen_kwh = daily_gen * 30
        elif period == "yearly":
            gen_kwh = daily_gen * 365
        else:
            gen_kwh = daily_gen

        co2_avoided = gen_kwh * co2_factor

        return jsonify({
            "period": period,
            "generation_kwh": round(gen_kwh, 2),
            "co2_avoided_kg": round(co2_avoided, 2)
        })

    except Exception as e:
        print("❌ Carbon Footprint API error:", str(e))
        return jsonify({"generation_kwh": 0, "co2_avoided_kg": 0})


# ----------------- ROI CALCULATOR -----------------
@app.route('/api/roi', methods=['GET'])
def roi():
    capex = request.args.get('capex', type=float, default=80000.0)  # ₹
    panel_size = request.args.get('panel_size', type=float, default=10.0)
    efficiency = request.args.get('efficiency', type=float, default=0.20)
    electricity_price = request.args.get('electricity_price', type=float, default=7.0)  # ₹/kWh

    # Assume average 4.5 sun hours/day
    daily_kwh = panel_size * efficiency * 4.5
    yearly_savings = daily_kwh * 365 * electricity_price
    payback_years = capex / yearly_savings if yearly_savings > 0 else None

    return jsonify({
        "daily_kwh": round(daily_kwh, 2),
        "yearly_savings_inr": round(yearly_savings, 2),
        "payback_years": round(payback_years, 2) if payback_years else "Infinity"
    })


if __name__ == '__main__':
    print("✅ Backend running...")
    app.run(debug=True, host='0.0.0.0', port=5000)
