import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import RawDataTable from "./components/RawDataTable";
import CoreStatistics from "./components/CoreStatistics";
import ChartGenerator from "./components/ChartGenerator"; // Updated for chart generation
import DistributionAnalysis from "./components/DistributionAnalysis"; // New component for distribution
import "./styles/App.css";
import InferentialStatistics from "./components/InferentialStatistics";
import TimeSeriesAnalysis from "./components/TimeSeriesAnalysis";

function App() {
  const [data, setData] = useState([]);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedColumn, setSelectedColumn] = useState(null); // Manage selected column for CoreStatistics

  const handleFileUpload = (data, columnHeaders) => {
    setData(data);
    setColumnHeaders(columnHeaders);
    setSelectedComponent("RawDataTable"); // Automatically show Raw Data Table after file upload
  };

  // Function to handle column selection for CoreStatistics
  const onColumnSelect = (selected) => {
    setSelectedColumn(selected); // Update the selected column state
  };

  return (
    <div>
      {/* File Uploader at the very start */}
      {data.length === 0 && (
        <div className="file-uploader-section">
          <h1>Welcome To Stat Anveshak! Please Upload Your File</h1>
          <FileUploader onFileUpload={handleFileUpload} />
        </div>
      )}

      {/* Show the rest of the app only after file is uploaded */}
      {data.length > 0 && (
        <>
          {/* Navbar */}
          <nav className="navbar">
            <div className="navbar-container">
              <div className="navbar-links">
                <button
                  className="navbar-button"
                  onClick={() => setSelectedComponent("RawDataTable")}
                >
                  Raw Data Table
                </button>
                <button
                  className="navbar-button"
                  onClick={() => setSelectedComponent("CoreStatistics")}
                >
                  Core Statistics
                </button>
                <button
                  className="navbar-button"
                  onClick={() => setSelectedComponent("ChartGenerator")}
                >
                  Chart Generator
                </button>
                <button
                  className="navbar-button"
                  onClick={() => setSelectedComponent("DistributionAnalysis")} // New button for distribution
                >
                  Distribution Analysis
                </button>
                <button
                  className="navbar-button"
                  onClick={() => setSelectedComponent("InferentialStatistics")}
                >
                  Inferential Statistics
                </button>
                <button
                  className="navbar-button"
                  onClick={() => setSelectedComponent("TimeSeriesAnalysis")}
                >
                  Time Series Analysis
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <div className="main-content">
            {/* Raw Data Table */}
            {selectedComponent === "RawDataTable" && (
              <RawDataTable data={data} columnHeaders={columnHeaders} setData={setData} />
            )}

            {/* Core Statistics */}
            {selectedComponent === "CoreStatistics" && (
              <CoreStatistics
                data={data}
                columnHeaders={columnHeaders}
                selectedColumn={selectedColumn}
                onColumnSelect={onColumnSelect} // Pass down onColumnSelect to handle column change
              />
            )}

            {/* Chart Generator */}
            {selectedComponent === "ChartGenerator" && (
              <ChartGenerator data={data} columnHeaders={columnHeaders} />
            )}

            {/* Distribution Analysis */}
            {selectedComponent === "DistributionAnalysis" && (
              <DistributionAnalysis data={data} columnHeaders={columnHeaders} />
            )}

            {/* Inferential Statistics */}
            {selectedComponent === "InferentialStatistics" && (
              <InferentialStatistics data={data} columnHeaders={columnHeaders} />
            )}

            {/* Time Series Analysis */}
            {selectedComponent === "TimeSeriesAnalysis" && (
              <TimeSeriesAnalysis data={data} columnHeaders={columnHeaders} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
