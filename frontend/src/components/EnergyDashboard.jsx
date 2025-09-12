import { useState, useEffect } from "react";
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
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [panelSize, setPanelSize] = useState(10);
  const [efficiency, setEfficiency] = useState(0.2);
  const [usage, setUsage] = useState(5);
  const [overrideGen, setOverrideGen] = useState("");

  const [energyRes, setEnergyRes] = useState(null);
  const [compareRes, setCompareRes] = useState(null);
  const [carbonRes, setCarbonRes] = useState(null);
  const [roiRes, setRoiRes] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE = "https://sustainability-5oz0.onrender.com";

  // Auto-detect location on first load
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLat(pos.coords.latitude.toFixed(4));
            setLon(pos.coords.longitude.toFixed(4));
          },
          (err) => {
            console.error("❌ Location access denied:", err);
            // Fallback to New Delhi coordinates
            setLat("28.6139");
            setLon("77.2090");
          }
        );
      } else {
        console.warn("Geolocation not supported");
        setLat("28.6139");
        setLon("77.2090");
      }
    };

    getLocation();
  }, []);

  // Fetch Data
  const getEnergy = async () => {
    if (!lat || !lon) {
      setError("Please provide valid latitude and longitude coordinates.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ENERGY
      const energyParams = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        panel_size: panelSize.toString(),
        efficiency: efficiency.toString(),
      });
      
      const energyResponse = await fetch(`${BASE}/api/energy?${energyParams}`);
      if (!energyResponse.ok) {
        throw new Error(`Energy API error: ${energyResponse.status}`);
      }
      const energyData = await energyResponse.json();
      setEnergyRes(energyData);

      // COMPARE
      const generationValue = overrideGen ? parseFloat(overrideGen) : energyData.solar_kw;
      const compareParams = new URLSearchParams({
        generation: generationValue.toString(),
        usage: usage.toString(),
      });
      
      const compareResponse = await fetch(`${BASE}/api/compare?${compareParams}`);
      if (!compareResponse.ok) {
        throw new Error(`Compare API error: ${compareResponse.status}`);
      }
      const compareData = await compareResponse.json();
      setCompareRes(compareData);

      // CARBON FOOTPRINT
      const carbonParams = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        panel_size: panelSize.toString(),
        efficiency: efficiency.toString(),
        period: "daily",
      });
      
      const carbonResponse = await fetch(`${BASE}/api/carbon_footprint?${carbonParams}`);
      if (!carbonResponse.ok) {
        throw new Error(`Carbon API error: ${carbonResponse.status}`);
      }
      const carbonData = await carbonResponse.json();
      setCarbonRes(carbonData);

      // ROI
      const roiParams = new URLSearchParams({
        capex: "80000",
        panel_size: panelSize.toString(),
        efficiency: efficiency.toString(),
        electricity_price: "7.0",
      });
      
      const roiResponse = await fetch(`${BASE}/api/roi?${roiParams}`);
      if (!roiResponse.ok) {
        throw new Error(`ROI API error: ${roiResponse.status}`);
      }
      const roiData = await roiResponse.json();
      setRoiRes(roiData);

    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError(err.message || "Failed to fetch energy data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Input handlers with validation
  const handleLatChange = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && value >= -90 && value <= 90)) {
      setLat(value);
    }
  };

  const handleLonChange = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && value >= -180 && value <= 180)) {
      setLon(value);
    }
  };

  const handlePanelSizeChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setPanelSize(value);
    }
  };

  const handleEfficiencyChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setEfficiency(value);
    }
  };

  const handleUsageChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setUsage(value);
    }
  };

  const handleOverrideGenChange = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setOverrideGen(value);
    }
  };

  // Chart data with safety checks
  const chartData = energyRes
    ? [
        { name: "Solar", value: parseFloat(energyRes.solar_kw) || 0 },
        { name: "Wind", value: parseFloat(energyRes.wind_kw) || 0 },
        { name: "Hydro", value: parseFloat(energyRes.hydro_kw) || 0 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col md:flex-row p-6 gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">⚡ Energy Dashboard</h1>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Latitude (-90 to 90)
          </label>
          <input
            type="number"
            value={lat}
            onChange={handleLatChange}
            placeholder="e.g., 28.6139"
            min="-90"
            max="90"
            step="any"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Longitude (-180 to 180)
          </label>
          <input
            type="number"
            value={lon}
            onChange={handleLonChange}
            placeholder="e.g., 77.2090"
            min="-180"
            max="180"
            step="any"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Panel Size (m²)
          </label>
          <input
            type="number"
            value={panelSize}
            onChange={handlePanelSizeChange}
            min="0.1"
            step="0.1"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Efficiency (0 to 1)
          </label>
          <input
            type="number"
            step="0.01"
            value={efficiency}
            onChange={handleEfficiencyChange}
            min="0"
            max="1"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        <button
          onClick={getEnergy}
          disabled={loading || !lat || !lon}
          className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Get Energy Data"}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <h2 className="text-lg font-bold mt-6 text-gray-900">📊 Compare / ROI</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Usage (kWh/day)
          </label>
          <input
            type="number"
            value={usage}
            onChange={handleUsageChange}
            min="0"
            step="0.1"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Override Generation (kWh/day)
          </label>
          <input
            type="number"
            value={overrideGen}
            onChange={handleOverrideGenChange}
            placeholder="Optional - leave empty to use calculated"
            min="0"
            step="0.1"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-900">📈 Results</h2>

        {/* Chart */}
        {energyRes && chartData.length > 0 && (
          <div className="w-full h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kW`, "Generation"]} />
                <Legend />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data Cards */}
        {energyRes && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
            <div className="p-4 bg-green-50 rounded-lg shadow border border-green-200">
              <strong className="text-gray-900">Timestamp</strong>
              <br />
              <span className="text-gray-700">{energyRes.timestamp}</span>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg shadow border border-yellow-200">
              <strong className="text-gray-900">Solar (kW)</strong>
              <br />
              <span className="text-gray-700">{energyRes.solar_kw}</span>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg shadow border border-blue-200">
              <strong className="text-gray-900">Wind (kW)</strong>
              <br />
              <span className="text-gray-700">{energyRes.wind_kw}</span>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg shadow border border-purple-200">
              <strong className="text-gray-900">Hydro (kW)</strong>
              <br />
              <span className="text-gray-700">{energyRes.hydro_kw}</span>
            </div>
          </div>
        )}

        {compareRes && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
            <div className="p-4 bg-green-100 rounded-lg shadow border border-green-200">
              <strong className="text-gray-900">Generation (kWh/day)</strong>
              <br />
              <span className="text-gray-700">{compareRes.generation_kwh}</span>
            </div>
            <div className="p-4 bg-red-100 rounded-lg shadow border border-red-200">
              <strong className="text-gray-900">Usage (kWh/day)</strong>
              <br />
              <span className="text-gray-700">{compareRes.usage_kwh}</span>
            </div>
            <div className="p-4 bg-indigo-100 rounded-lg shadow border border-indigo-200">
              <strong className="text-gray-900">Balance</strong>
              <br />
              <span className="text-gray-700">
                {compareRes.balance_kwh} ({compareRes.status})
              </span>
            </div>
          </div>
        )}

        {carbonRes && (
          <div className="mb-6 p-4 bg-emerald-100 rounded-lg shadow border border-emerald-200 text-sm">
            <strong className="text-gray-900">🌍 CO₂ Avoided (kg)</strong>
            <br />
            <span className="text-gray-700">{carbonRes.co2_avoided_kg}</span>
          </div>
        )}

        {roiRes && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-sky-100 rounded-lg shadow border border-sky-200">
              <strong className="text-gray-900">ROI - Payback (yrs)</strong>
              <br />
              <span className="text-gray-700">{roiRes.payback_years}</span>
            </div>
            <div className="p-4 bg-orange-100 rounded-lg shadow border border-orange-200">
              <strong className="text-gray-900">Yearly Savings (₹)</strong>
              <br />
              <span className="text-gray-700">{roiRes.yearly_savings_inr}</span>
            </div>
          </div>
        )}

        {!loading && !energyRes && !error && (
          <div className="text-center text-gray-500 py-8">
            Enter coordinates and click "Get Energy Data" to see results
          </div>
        )}
      </div>
    </div>
  );
}
