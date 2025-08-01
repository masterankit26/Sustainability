import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';

function InsightPanel({ location }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const panelRef = useRef(null);

  // ✅ Helper function to validate coordinates
  const isValid = (val) => typeof val === 'number' && !isNaN(val);

  useEffect(() => {
    if (!location || !isValid(location.lat) || !isValid(location.lon)) return;

    const fetchWeather = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/location-data?lat=${location.lat}&lon=${location.lon}`
        );
        if (res.data && !res.data.error) {
          setData(res.data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('❌ InsightPanel error:', err);
        setError(true);
      }
    };

    fetchWeather();
  }, [location]);

  useEffect(() => {
    if (panelRef.current && data) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }
      );
    }
  }, [data]);

  const get = (val, unit = '', fallback = '—') =>
    typeof val === 'number' ? `${val} ${unit}` : fallback;

  // ✅ Don't render anything if location is invalid
  if (!location || !isValid(location.lat) || !isValid(location.lon)) {
    return null;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto bg-red-50 border border-red-300 text-red-700 rounded-md p-4 mt-6">
        <h3 className="text-lg font-semibold mb-2">⚠️ Unable to load weather data</h3>
        <p className="text-sm">Check your internet connection or selected location.</p>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center mt-4 text-gray-600">⏳ Loading weather insights...</p>;
  }

  return (
    <div
      ref={panelRef}
      className="max-w-3xl mx-auto bg-white shadow-md rounded-xl border border-green-100 p-6 mt-6"
    >
      <h3 className="text-xl font-bold text-green-700 mb-4">🌤️ Real-Time Weather Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-800 text-sm">
        <div><strong>🌡️ Temp Max:</strong> {get(data.temp_max, '°C')}</div>
        <div><strong>🌡️ Temp Min:</strong> {get(data.temp_min, '°C')}</div>
        <div><strong>💧 Humidity:</strong> {get(data.humidity, '%')}</div>
        <div><strong>💨 Wind Speed:</strong> {get(data.wind_speed, 'm/s')}</div>
        <div><strong>🌧️ Rainfall:</strong> {get(data.rainfall, 'mm')}</div>
        <div><strong>🌿 Soil Moisture:</strong> {get(data.soil_moisture, 'm³/m³')}</div>
      </div>
    </div>
  );
}

export default InsightPanel;
