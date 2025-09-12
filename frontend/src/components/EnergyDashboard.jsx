/* import { useState, useEffect } from "react";
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

export default function EnergyDashboard() {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [panelSize, setPanelSize] = useState(10);
  const [efficiency, setEfficiency] = useState(0.2);
  const [usage, setUsage] = useState(5);
  const [overrideGen, setOverrideGen] = useState(0);

  const [energyRes, setEnergyRes] = useState(null);
  const [compareRes, setCompareRes] = useState(null);
  const [carbonRes, setCarbonRes] = useState(null);
  const [roiRes, setRoiRes] = useState(null);

  const [loading, setLoading] = useState(false);

  const BASE = "http://127.0.0.1:5000";

  // 🔹 Auto-detect location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLon(pos.coords.longitude.toFixed(4));
        },
        (err) => {
          console.error("❌ Location access denied:", err);
          // fallback → New Delhi
          setLat(28.6139);
          setLon(77.2090);
        }
      );
    } else {
      console.warn("Geolocation not supported");
      setLat(28.6139);
      setLon(77.2090);
    }
  }, []);

  // ---- Fetch Data ----
  const getEnergy = async () => {
    if (!lat || !lon) {
      alert("Waiting for location...");
      return;
    }

    setLoading(true);
    try {
      // ENERGY
      const energyParams = new URLSearchParams({
        lat,
        lon,
        panel_size: panelSize,
        efficiency,
      });
      const energyRes = await fetch(`${BASE}/api/energy?${energyParams}`);
      const energyData = await energyRes.json();
      setEnergyRes(energyData);

      // COMPARE
      const compareParams = new URLSearchParams({
        generation: overrideGen || energyData.solar_kw,
        usage,
      });
      const compareRes = await fetch(`${BASE}/api/compare?${compareParams}`);
      const compareData = await compareRes.json();
      setCompareRes(compareData);

      // CARBON FOOTPRINT
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

      // ROI (₹ instead of $)
      const roiParams = new URLSearchParams({
        capex: 80000, // in ₹
        panel_size: panelSize,
        efficiency,
        electricity_price: 7.0, // ₹/kWh
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

  // Chart data
  const chartData = energyRes
    ? [
        { name: "Solar", value: energyRes.solar_kw },
        { name: "Wind", value: energyRes.wind_kw },
        { name: "Hydro", value: energyRes.hydro_kw },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col md:flex-row p-6 gap-6">
      
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">⚡ Energy Dashboard</h1>

        <label className="block text-sm font-semibold text-gray-800">Latitude</label>
        <input
          type="number"
          value={lat || ""}
          onChange={(e) => setLat(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
        />

        <label className="block text-sm font-semibold text-gray-800">Longitude</label>
        <input
          type="number"
          value={lon || ""}
          onChange={(e) => setLon(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
        />

        <label className="block text-sm font-semibold text-gray-800">Panel Size (m²)</label>
        <input
          type="number"
          value={panelSize}
          onChange={(e) => setPanelSize(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
        />

        <label className="block text-sm font-semibold text-gray-800">Efficiency (0-1)</label>
        <input
          type="number"
          step="0.01"
          value={efficiency}
          onChange={(e) => setEfficiency(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
        />

        <button
          onClick={getEnergy}
          disabled={loading}
          className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Loading..." : "Get Energy Data"}
        </button>

        <h2 className="text-lg font-bold mt-6 text-gray-900">📊 Compare / ROI</h2>

        <label className="block text-sm font-semibold text-gray-800">Usage (kWh/day)</label>
        <input
          type="number"
          value={usage}
          onChange={(e) => setUsage(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
        />

        <label className="block text-sm font-semibold text-gray-800">Override Generation (kWh/day)</label>
        <input
          type="number"
          value={overrideGen}
          onChange={(e) => setOverrideGen(parseFloat(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
      </div>

      
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

        {roiRes && (
          <div className="grid grid-cols-2 gap-4 text-sm mt-6">
            <div className="p-4 bg-sky-100 rounded-lg shadow border border-sky-200">
              <strong className="text-gray-900">ROI - Payback (yrs)</strong><br />{roiRes.payback_years}
            </div>
            <div className="p-4 bg-orange-100 rounded-lg shadow border border-orange-200">
              <strong className="text-gray-900">Yearly Savings (₹)</strong><br />{roiRes.yearly_savings_inr}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}*/

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
