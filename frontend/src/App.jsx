import React, { useState } from "react";
import Navbar from "./components/Navbar";
import MapPicker from "./components/MapPicker";
import InsightPanel from "./components/InsightPanel";
import SimulationTool from "./components/SimulationTool";
import SensorChart from "./components/SensorChart";
import EnergyDashboard from "./components/EnergyDashboard"; // ✅ fixed casing
import WeatherTimeline from "./components/WeatherTimeline";
import IrrigationAdvisor from "./components/IrrigationAdvisor";
import SetupGuide from "./components/SetupGuide";
import SmartIrrigationOverview from "./components/SmartIrrigationOverview";

function App() {
  const [location, setLocation] = useState({ lat: null, lon: null });

  const isValid = (val) => typeof val === "number" && !isNaN(val);
  const isLocationValid = isValid(location.lat) && isValid(location.lon);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Top Navigation */}
      <Navbar />

      {/* Pick location */}
      <MapPicker onSubmit={setLocation} />

      {/* Setup instructions */}
      <SetupGuide />

      {/* Show dashboards only when location is valid */}
      {isLocationValid && (
        <>
          <IrrigationAdvisor
            areaSize={500} // m²
            environment={location}
            location={location}
          />
          <InsightPanel location={location} />
          <EnergyDashboard location={location} />
          <SimulationTool location={location} />
          
          <SensorChart location={location} />
          <WeatherTimeline location={location} />
          <SmartIrrigationOverview />
        </>
      )}
    </div>
  );
}

export default App;
