
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Database, BarChart2, PieChart, Activity, Calculator, Clock, TrendingUp, Network, Table, Upload } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
const navItems = [
  { name: "Upload Data", icon: Upload, path: "/upload" },
  { name: "Raw Data Table", icon: Table, path: "/raw-data" },
  { name: "Core Statistics", icon: Calculator, path: "/core-statistics" },
  { name: "Chart Generator", icon: BarChart2, path: "/chart-generator" },
  { name: "Distribution Analysis", icon: PieChart, path: "/distribution-analysis" },
  { name: "Inferential Statistics", icon: Activity, path: "/inferential-statistics" },
  { name: "Time Series Analysis", icon: Clock, path: "/time-series" },
  { name: "Regression & Correlation", icon: TrendingUp, path: "/regression" },
  { name: "Multivariate Analysis", icon: Network, path: "/multivariate" }
];

// Layout component with navigation
function Layout({ data, setData, columnHeaders, setColumnHeaders }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <nav className="w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-xl">
        <div className="p-6">
          <div 
            className="flex items-center space-x-3 mb-8 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <Database className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">Stat Anveshak</h1>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150 ${
                  location.pathname === item.path
                    ? "bg-indigo-700 text-white"
                    : "text-gray-300 hover:bg-indigo-800 hover:text-white"
                }`}
                onClick={() => navigate(item.path)}
                disabled={data.length === 0 && item.path !== "/"}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {data.length === 0 && location.pathname !== "/" ? (
              <Navigate to="/" replace />
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Welcome({ setData, setColumnHeaders }) {
  const navigate = useNavigate();

  const handleFileUpload = (uploadedData, uploadedHeaders) => {
    setData(uploadedData);
    setColumnHeaders(uploadedHeaders);
    navigate("/raw-data");
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
    const body = rows.slice(1).map(row => 
      row.length === headers.length ? row : headers.map(() => "")
    );
  
    setData(body);
    setColumnHeaders(headers);
    navigate("/raw-data");
  };

  const handlePredefinedDataset = (datasetName) => {
    const csvData = predefinedDatasets[datasetName];
  
    if (csvData) {
      const { headers, body } = parseCSVData(csvData);
      setData(body);
      setColumnHeaders(headers);
      navigate("/raw-data");
    } else {
      alert("Dataset not found!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Stat Anveshak
          </h1>
          <p className="text-gray-600 mb-8">
            Upload your data or use our sample datasets to begin your analysis
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Upload Data</h2>
            <FileUploader onFileUpload={handleFileUpload} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Manual Input</h2>
            <form onSubmit={handleManualInput}>
              <textarea
                name="manualData"
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Example Format:&#10;Name,Age,Score&#10;Alice,25,85&#10;Bob,30,90&#10;Charlie,28,88"
              ></textarea>
              <button
                type="submit"
                className="mt-3 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-150"
              >
                Submit Manual Data
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Sample Datasets</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handlePredefinedDataset("Dataset 1")}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-600 transition-colors duration-150"
              >
                Random Dataset 1
              </button>
              <button
                onClick={() => handlePredefinedDataset("Dataset 2")}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-600 transition-colors duration-150"
              >
                Random Dataset 2
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function UploadData({ setData, setColumnHeaders }) {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Upload New Dataset
        </h1>
        <p className="text-gray-600">
          Choose a method to upload your new dataset
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">File Upload</h2>
          <FileUploader 
            onFileUpload={(uploadedData, uploadedHeaders) => {
              setData(uploadedData);
              setColumnHeaders(uploadedHeaders);
              localStorage.setItem('tableData', JSON.stringify(uploadedData));
              localStorage.setItem('columnHeaders', JSON.stringify(uploadedHeaders));
              navigate("/raw-data");
            }} 
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Manual Input</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const rawInput = e.target.manualData.value.trim();
            
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
            const body = rows.slice(1).map(row => 
              row.length === headers.length ? row : headers.map(() => "")
            );
          
            setData(body);
            setColumnHeaders(headers);
            localStorage.setItem('tableData', JSON.stringify(body));
            localStorage.setItem('columnHeaders', JSON.stringify(headers));
            navigate("/raw-data");
          }}>
            <textarea
              name="manualData"
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Example Format:&#10;Name,Age,Score&#10;Alice,25,85&#10;Bob,30,90&#10;Charlie,28,88"
            ></textarea>
            <button
              type="submit"
              className="mt-3 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-150"
            >
              Submit Manual Data
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Sample Datasets</h2>
          <div className="flex space-x-4">
            {Object.keys(predefinedDatasets).map((datasetName) => (
              <button
                key={datasetName}
                onClick={() => {
                  const csvData = predefinedDatasets[datasetName];
                  const { headers, body } = parseCSVData(csvData);
                  setData(body);
                  setColumnHeaders(headers);
                  localStorage.setItem('tableData', JSON.stringify(body));
                  localStorage.setItem('columnHeaders', JSON.stringify(headers));
                  navigate("/raw-data");
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-600 transition-colors duration-150"
              >
                Random {datasetName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('tableData');
    return savedData ? JSON.parse(savedData) : [];
  });
  
  const [columnHeaders, setColumnHeaders] = useState(() => {
    const savedHeaders = localStorage.getItem('columnHeaders');
    return savedHeaders ? JSON.parse(savedHeaders) : [];
  });
  
  const [selectedColumn, setSelectedColumn] = useState(null);

  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem('tableData', JSON.stringify(data));
    }
  }, [data]);

  useEffect(() => {
    if (columnHeaders.length > 0) {
      localStorage.setItem('columnHeaders', JSON.stringify(columnHeaders));
    }
  }, [columnHeaders]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout data={data} setData={setData} columnHeaders={columnHeaders} setColumnHeaders={setColumnHeaders} />}>
          <Route index element={<Welcome setData={setData} setColumnHeaders={setColumnHeaders} />} />
          <Route path="upload" element={<UploadData setData={setData} setColumnHeaders={setColumnHeaders} />} />
          <Route path="raw-data" element={<RawDataTable data={data} setData={setData} columnHeaders={columnHeaders} />} />
          <Route path="core-statistics" element={<CoreStatistics data={data} columnHeaders={columnHeaders} selectedColumn={selectedColumn} setSelectedColumn={setSelectedColumn} />} />
          <Route path="chart-generator" element={<ChartGenerator data={data} columnHeaders={columnHeaders} />} />
          <Route path="distribution-analysis" element={<DistributionAnalysis data={data} columnHeaders={columnHeaders} />} />
          <Route path="inferential-statistics" element={<InferentialStatistics data={data} columnHeaders={columnHeaders} />} />
          <Route path="time-series" element={<TimeSeriesAnalysis data={data} columnHeaders={columnHeaders} />} />
          <Route path="regression" element={<RegressionAndCorrelation data={data} columnHeaders={columnHeaders} />} />
          <Route path="multivariate" element={<MultivariateAnalysis data={data} setData={setData} columnHeaders={columnHeaders} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;