import React, { useEffect, useState } from 'react';
import axios from 'axios';

function WeatherTable({ location }) {
  const [forecastData, setForecastData] = useState(null);

  useEffect(() => {
    if (!location?.lat || !location?.lon) return;

    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];
    const startDate = formatDate(today);
    const endDate = formatDate(new Date(today.getTime() + 5 * 86400000));

    const fetchForecast = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,relative_humidity_2m,windspeed_10m,precipitation&timezone=auto`;
        const res = await axios.get(url);
        setForecastData(res.data.hourly);
      } catch (err) {
        console.error('❌ WeatherTable fetch error:', err);
      }
    };

    fetchForecast();
  }, [location]);

  const renderRows = (data) =>
    data?.time?.map((t, i) => (
      <tr
        key={t}
        className={`border-b hover:bg-blue-50 transition duration-200 ease-in-out ${
          i % 2 === 0 ? 'bg-white' : 'bg-blue-50/20'
        }`}
      >
        <td className="px-4 py-2 text-sm text-gray-800 whitespace-nowrap">
          {new Date(t).toLocaleString('en-IN', {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </td>
        <td className="px-4 py-2 text-center text-blue-800 font-medium">
          {data.temperature_2m[i]}°C
        </td>
        <td className="px-4 py-2 text-center text-green-700">{data.relative_humidity_2m[i]}%</td>
        <td className="px-4 py-2 text-center text-indigo-600">{data.windspeed_10m[i]} m/s</td>
        <td className="px-4 py-2 text-center text-sky-700">{data.precipitation[i]} mm</td>
      </tr>
    ));

  return (
    <div className="max-w-6xl mx-auto mt-12 bg-white/80 backdrop-blur-xl shadow-2xl border border-blue-100 rounded-2xl p-6 overflow-x-auto">
      <h3 className="text-2xl font-bold text-blue-800 mb-5 flex items-center gap-2">
        📅 5-Day Hourly Weather Forecast
      </h3>

      {!forecastData ? (
        <p className="text-center text-gray-600 py-10">⏳ Loading weather forecast...</p>
      ) : (
        <table className="min-w-full border-collapse text-sm text-gray-700">
          <thead className="bg-blue-100 text-blue-800 rounded">
            <tr>
              <th className="px-4 py-3 text-left">🕓 Time</th>
              <th className="px-4 py-3 text-center">🌡️ Temp (°C)</th>
              <th className="px-4 py-3 text-center">💧 Humidity (%)</th>
              <th className="px-4 py-3 text-center">🌬️ Wind (m/s)</th>
              <th className="px-4 py-3 text-center">🌧️ Rain (mm)</th>
            </tr>
          </thead>
          <tbody>{renderRows(forecastData)}</tbody>
        </table>
      )}
    </div>
  );
}

export default WeatherTable;
