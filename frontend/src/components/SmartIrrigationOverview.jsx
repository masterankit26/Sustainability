import React from 'react';

function SmartIrrigationOverview() {
  return (
    <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl border border-green-100 rounded-2xl p-8 mt-12">
      <h2 className="text-3xl font-extrabold text-green-800 mb-6 flex items-center gap-2">
        💧 Smart Precision Irrigation System
      </h2>

      <p className="text-gray-800 leading-relaxed text-[16.5px]">
        Our system tackles the challenge of <strong className="text-green-700">water scarcity</strong> by replacing guesswork with real-time, AI-powered decisions. It delivers water <strong className="text-green-700">only where and when crops need it</strong>, improving yield and reducing waste.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-8 text-gray-700 text-[15.5px]">
        <div className="bg-green-50/40 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <h4 className="font-semibold text-green-700 mb-2 text-lg flex items-center gap-1">📡 Sensor Intelligence</h4>
          <ul className="list-disc ml-5 space-y-1">
            <li>Live soil moisture readings from all crop zones</li>
            <li>Granular tracking of water demand zone-by-zone</li>
          </ul>
        </div>

        <div className="bg-green-50/40 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <h4 className="font-semibold text-green-700 mb-2 text-lg flex items-center gap-1">🌦️ Predictive Weather Sync</h4>
          <ul className="list-disc ml-5 space-y-1">
            <li>Uses local forecasts: rainfall, humidity, and temperature</li>
            <li>Skips irrigation before rain to prevent water waste</li>
          </ul>
        </div>

        <div className="bg-green-50/40 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <h4 className="font-semibold text-green-700 mb-2 text-lg flex items-center gap-1">🧠 AI-Based Irrigation Logic</h4>
          <ul className="list-disc ml-5 space-y-1">
            <li>Calculates exact water needed per crop zone</li>
            <li>Optimizes irrigation timing (e.g., early morning/night)</li>
            <li>Selects ideal delivery method — drip or sprinkler</li>
          </ul>
        </div>

        <div className="bg-green-50/40 p-5 rounded-xl shadow-sm hover:shadow-md transition">
          <h4 className="font-semibold text-green-700 mb-2 text-lg flex items-center gap-1">📱 Smart Dashboard & Alerts</h4>
          <ul className="list-disc ml-5 space-y-1">
            <li>Monitor live moisture, water flow, and pump status</li>
            <li>Receive alerts for dry zones or sensor failures</li>
            <li>Access from mobile or desktop — anytime, anywhere</li>
          </ul>
        </div>
      </div>

      <p className="mt-8 text-gray-800 leading-relaxed text-[16.5px]">
        The result: a responsive, intelligent farm system that <strong className="text-green-700">preserves water</strong>, <strong className="text-green-700">boosts productivity</strong>, and <strong className="text-green-700">minimizes manual effort</strong>. All powered by real-time data and automation.
      </p>
    </div>
  );
}

export default SmartIrrigationOverview;
