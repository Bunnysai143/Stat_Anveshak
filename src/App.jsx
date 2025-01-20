import React, { useState } from "react";
import FileUploader from "./components/FileUploader";
import RawDataTable from "./components/RawDataTable";
import CoreStatistics from "./components/CoreStatistics";
import ChartGenerator from "./components/ChartGenerator";
import DistributionAnalysis from "./components/DistributionAnalysis";
import InferentialStatistics from "./components/InferentialStatistics";
import TimeSeriesAnalysis from "./components/TimeSeriesAnalysis";
import RegressionAndCorrelation from "./components/RegCore";
import MultivariateAnalysis from "./components/MultivariateAnalysis ";
import { predefinedDatasets, parseCSVData } from "./utils/datasets";
import "./styles/App.css";
// import { predefinedDatasets } from "./utils/datasets";

function App() {
  const [data, setData] = useState([]);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedColumn, setSelectedColumn] = useState(null);

  const handleFileUpload = (uploadedData, uploadedHeaders) => {
    setData(uploadedData);
    setColumnHeaders(uploadedHeaders);
    setSelectedComponent("RawDataTable");
  };

  const handleManualInput = (event) => {
    event.preventDefault();
    const rawInput = event.target.manualData.value.trim();
    if (!rawInput) {
      alert("Please enter valid data.");
      return;
    }
  
    const rows = rawInput
      .split("\n")
      .map(row => row.split(",").map(value => value.trim()));
  
    if (rows.length < 2) {
      alert("Please enter valid CSV data with at least one data row.");
      return;
    }
  
    const headers = rows[0];
    const body = rows.slice(1).map(row => row.length === headers.length ? row : headers.map(() => ""));
  
    setData(body);
    setColumnHeaders(headers);
    setSelectedComponent("RawDataTable");
  };
  
  

  const handlePredefinedDataset = (datasetName) => {
    const csvData = predefinedDatasets[datasetName];
  
    if (csvData) {
      const { headers, body } = parseCSVData(csvData);
      console.log("Parsed Headers: ", headers); // Log headers
      console.log("Parsed Body: ", body); // Log the data rows
  
      setData(body);
      setColumnHeaders(headers);
      setSelectedComponent("RawDataTable");
    } else {
      alert("Dataset not found!");
    }
  };
  
  

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <nav className="w-1/5 bg-gray-800 text-white h-full flex flex-col p-4">
        <h1 className="text-xl text-white font-bold mb-6">Stat Anveshak</h1>
        <button
          className="mb-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setSelectedComponent("RawDataTable")}
        >
          Raw Data Table
        </button>
        <button
          className="mb-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setSelectedComponent("CoreStatistics")}
        >
          Core Statistics
        </button>
        <button
          className="mb-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setSelectedComponent("ChartGenerator")}
        >
          Chart Generator
        </button>
        <button
          className="mb-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setSelectedComponent("DistributionAnalysis")}
        >
          Distribution Analysis
        </button>
        <button
          className="mb-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setSelectedComponent("InferentialStatistics")}
        >
          Inferential Statistics
        </button>
        <button
          className="mb-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setSelectedComponent("TimeSeriesAnalysis")}
        >
          Time Series Analysis
        </button>
        <button
          className="mb-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setSelectedComponent("RegressionAndCorrelation")}
        >
          Regression & Correlation
        </button>
        <button
          className="mb-2 p-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setSelectedComponent("MultivariateAnalysis")}
        >
          Multivariate Analysis
        </button>
      </nav>

      {/* Main Content */}
      <div className="w-4/5 p-6 bg-gray-100 overflow-auto">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-4">
                Welcome To Stat Anveshak! Add Your Data
              </h1>
              <div className="mb-4">
                <FileUploader onFileUpload={handleFileUpload} />
              </div>
              <form
                onSubmit={handleManualInput}
                className="bg-white shadow-md p-4 rounded mb-4"
              >
                <textarea
  name="manualData"
  rows="5"
  className="w-full border border-gray-300 p-2 rounded mb-2"
  placeholder="Example Format
Name,Age,Score 
Alice,25,85
Bob,30,90
Charlie,28,88"
></textarea>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Submit Manual Data
                </button>
              </form>
              <div>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 mr-2"
                  onClick={() => handlePredefinedDataset("Dataset 1")}
                >
                  Load Dataset 1
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                  onClick={() => handlePredefinedDataset("Dataset 2")}
                >
                  Load Dataset 2
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {selectedComponent === "RawDataTable" && (
              <RawDataTable data={data} columnHeaders={columnHeaders} setData={setData} />
            )}
            {selectedComponent === "CoreStatistics" && (
              <CoreStatistics
                data={data}
                columnHeaders={columnHeaders}
                selectedColumn={selectedColumn}
                onColumnSelect={setSelectedColumn}
              />
            )}
            {selectedComponent === "ChartGenerator" && (
              <ChartGenerator data={data} columnHeaders={columnHeaders} />
            )}
            {selectedComponent === "DistributionAnalysis" && (
              <DistributionAnalysis data={data} columnHeaders={columnHeaders} />
            )}
            {selectedComponent === "InferentialStatistics" && (
              <InferentialStatistics data={data} columnHeaders={columnHeaders} />
            )}
            {selectedComponent === "TimeSeriesAnalysis" && (
              <TimeSeriesAnalysis data={data} columnHeaders={columnHeaders} />
            )}
            {selectedComponent === "RegressionAndCorrelation" && (
              <RegressionAndCorrelation data={data} columnHeaders={columnHeaders} />
            )}
            {selectedComponent === "MultivariateAnalysis" && (
              <MultivariateAnalysis data={data} columnHeaders={columnHeaders} setData={setData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
