import React, { useState } from "react";
import axios from "axios";

function SimulationTool() {
  const [input, setInput] = useState({ area: "", crop: "", rate: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    if (!input.area || !input.crop || !input.rate) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/simulation", input);
      setResult(res.data);
    } catch (err) {
      console.error("❌ Simulation error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-xl border border-green-100 rounded-2xl p-6 mt-8">
      <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
        📈 <span className="ml-2">ROI Simulation Tool</span>
      </h2>

      {/* Inputs */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Area (acres)</label>
          <input
            type="number"
            placeholder="e.g. 5"
            value={input.area}
            onChange={(e) => setInput({ ...input, area: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Crop Type</label>
          <input
            type="text"
            placeholder="e.g. Wheat"
            value={input.crop}
            onChange={(e) => setInput({ ...input, crop: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Electricity Rate (₹/unit)</label>
          <input
            type="number"
            placeholder="e.g. 7"
            value={input.rate}
            onChange={(e) => setInput({ ...input, rate: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Button */}
      <button
        onClick={simulate}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
      >
        {loading ? "Simulating..." : "Run Simulation"}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-700 mb-2">📊 Results</h3>
          <p className="text-gray-700">
            <strong>💧 Water Saved:</strong> {result.water_saved} liters
          </p>
          <p className="text-gray-700">
            <strong>💰 Cost Savings:</strong> ₹{result.cost_saved}
          </p>
          <p className="text-gray-700">
            <strong>📈 ROI:</strong> {result.roi}%
          </p>
        </div>
      )}
    </div>
  );
}

export default SimulationTool;
