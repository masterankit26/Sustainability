

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function EnergyDashboard({ location }) {
  const [panelSize, setPanelSize] = useState(10);
  const [efficiency, setEfficiency] = useState(0.2);
  const [usage, setUsage] = useState(5);
  const [overrideGen, setOverrideGen] = useState(0);

  const [energyRes, setEnergyRes] = useState(null);
  const [compareRes, setCompareRes] = useState(null);
  const [carbonRes, setCarbonRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE = "http://127.0.0.1:5000";
  const lat = location?.lat;
  const lon = location?.lon;

  const getEnergy = async () => {
    if (!lat || !lon) {
      alert("Waiting for location...");
      return;
    }

    setLoading(true);
    try {
      const energyParams = new URLSearchParams({ lat, lon, panel_size: panelSize, efficiency });
      const energyRes = await fetch(`${BASE}/api/energy?${energyParams}`);
      const energyData = await energyRes.json();
      setEnergyRes(energyData);

      const compareParams = new URLSearchParams({
        generation: overrideGen || energyData.solar_kw,
        usage,
      });
      const compareRes = await fetch(`${BASE}/api/compare?${compareParams}`);
      const compareData = await compareRes.json();
      setCompareRes(compareData);

      const carbonParams = new URLSearchParams({
        lat,
        lon,
        panel_size: panelSize,
        efficiency,
        period: "daily",
      });
      const carbonRes = await fetch(`${BASE}/api/carbon_footprint?${carbonParams}`);
      const carbonData = await carbonRes.json();
      setCarbonRes(carbonData);

      const roiParams = new URLSearchParams({
        capex: 80000,
        panel_size: panelSize,
        efficiency,
        electricity_price: 7.0,
      });
      const roiRes = await fetch(`${BASE}/api/roi?${roiParams}`);
      const roiData = await roiRes.json();
      setRoiRes(roiData);
    } catch (err) {
      console.error("❌ Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = energyRes
    ? [
        { name: "Solar", value: energyRes.solar_kw },
        { name: "Wind", value: energyRes.wind_kw },
        { name: "Hydro", value: energyRes.hydro_kw },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col md:flex-row p-6 gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">⚡ Energy Dashboard</h1>

        <label className="block text-sm font-semibold text-gray-800">Panel Size (m²)</label>
        <input
          type="number"
          value={panelSize}
          onChange={(e) => setPanelSize(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />

        <label className="block text-sm font-semibold text-gray-800">Efficiency (0–1)</label>
        <input
          type="number"
          step="0.01"
          value={efficiency}
          onChange={(e) => setEfficiency(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />

        <button
          onClick={getEnergy}
          disabled={loading}
          className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Loading..." : "Get Energy Data"}
        </button>

       

        <label className="block text-sm font-semibold text-gray-800">Usage (kWh/day)</label>
        <input
          type="number"
          value={usage}
          onChange={(e) => setUsage(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />

        <label className="block text-sm font-semibold text-gray-800">Override Generation (kWh/day)</label>
        <input
          type="number"
          value={overrideGen}
          onChange={(e) => setOverrideGen(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-900">📈 Results</h2>

        {energyRes && (
          <div className="w-full h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {energyRes && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-4 bg-green-50 rounded-lg shadow border border-green-200">
              <strong className="text-gray-900">Timestamp</strong><br />{energyRes.timestamp}
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg shadow border border-yellow-200">
              <strong className="text-gray-900">Solar (kW)</strong><br />{energyRes.solar_kw}
            </div>
            <div className="p-4 bg-blue-50 rounded-lg shadow border border-blue-200">
              <strong className="text-gray-900">Wind (kW)</strong><br />{energyRes.wind_kw}
            </div>
            <div className="p-4 bg-purple-50 rounded-lg shadow border border-purple-200">
              <strong className="text-gray-900">Hydro (kW)</strong><br />{energyRes.hydro_kw}
            </div>
          </div>
        )}

        {compareRes && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-6">
            <div className="p-4 bg-green-100 rounded-lg shadow border border-green-200">
              <strong className="text-gray-900">Generation (kWh/day)</strong><br />{compareRes.generation_kwh}
            </div>
            <div className="p-4 bg-red-100 rounded-lg shadow border border-red-200">
              <strong className="text-gray-900">Usage (kWh/day)</strong><br />{compareRes.usage_kwh}
            </div>
            <div className="p-4 bg-indigo-100 rounded-lg shadow border border-indigo-200">
              <strong className="text-gray-900">Balance</strong><br />{compareRes.balance_kwh} ({compareRes.status})
            </div>
          </div>
        )}

        {carbonRes && (
          <div className="mt-6 p-4 bg-emerald-100 rounded-lg shadow border border-emerald-200 text-sm">
            <strong className="text-gray-900">🌍 CO₂ Avoided (kg)</strong><br />{carbonRes.co2_avoided_kg}
          </div>
        )}

        
      </div>
    </div>
  );
}
