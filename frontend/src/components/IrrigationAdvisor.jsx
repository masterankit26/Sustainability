import React, { useEffect, useState } from 'react';
import axios from 'axios';

function IrrigationAdvisor({ areaSize = 1000, lat = 23.1, lon = 88.5 }) {
  const [environment, setEnvironment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnvironment = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/location-data?lat=${lat}&lon=${lon}`
        );
        setEnvironment(res.data);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load irrigation advisory.');
      }
    };

    fetchEnvironment();
  }, [lat, lon]);

  const get = (val, unit = '', fallback = '—') =>
    typeof val === 'number' ? `${val} ${unit}` : fallback;

  const calculateWaterNeed = () => {
    const baseNeed = 5; // Fixed base water need per m² (in liters)
    const moistureAdj = 1 - (environment?.soil_moisture ?? 0.25);
    const evap =
      1 +
      (environment.temp_max / 35) +
      (environment.wind_speed / 5) -
      (environment.humidity / 100);
    const total = baseNeed * areaSize * moistureAdj * evap;
    return total > 0 ? total.toFixed(1) : '—';
  };

  const findBestTime = () => {
    const hourly = environment.history;
    if (!hourly?.time || !hourly.temperature_2m) return 'Unavailable';

    let best = { time: null, temp: Infinity };
    for (let i = 0; i < hourly.time.length; i++) {
      const temp = hourly.temperature_2m[i];
      const wind = hourly.windspeed_10m?.[i];
      if (typeof temp === 'number' && typeof wind === 'number' && temp < best.temp && wind < 3) {
        best = { time: hourly.time[i], temp };
      }
    }
    return best.time ? new Date(best.time).toLocaleString() : 'Unavailable';
  };

  const suggestMethod = () => {
    return areaSize > 1000 ? 'Sprinkler' : 'Drip or Sprinkler';
  };

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  if (!environment) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-4 bg-white shadow rounded text-center text-gray-600 animate-pulse">
        ⏳ Loading AI irrigation advisory...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-green-200">
      <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
        💧 <span className="ml-2">AI-Based Irrigation Advisory</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-800 text-[15.5px]">
        {[
          ['📐 Field Size', `${areaSize} m²`],
          ['🌿 Soil Moisture', get(environment.soil_moisture, 'm³/m³')],
          ['🌡️ Max Temperature', get(environment.temp_max, '°C')],
          ['💧 Humidity', get(environment.humidity, '%')],
          ['💨 Wind Speed', get(environment.wind_speed, 'm/s')],
          ['🚰 Estimated Water Needed', `${calculateWaterNeed()} liters`],
          ['⏰ Suggested Time', findBestTime()],
          ['🧪 Delivery Method', suggestMethod()]
        ].map(([label, value], idx) => (
          <div
            key={idx}
            className="bg-green-50/40 px-4 py-2 rounded border border-green-100 shadow-sm"
          >
            <strong>{label}:</strong> {value}
          </div>
        ))}
      </div>

      <p className="mt-6 text-green-700 font-medium">
        ✅ This advisory helps reduce water waste and improve yield through precision irrigation.
      </p>
    </div>
  );
}

export default IrrigationAdvisor;
