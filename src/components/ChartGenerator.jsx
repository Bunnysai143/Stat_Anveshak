import React, { useState, useEffect } from "react";
import { Line, Bar, Radar, Doughnut, Pie, Scatter, Bubble, PolarArea } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, RadarController, DoughnutController, ArcElement, PolarAreaController, ScatterController, BubbleController } from "chart.js";

// Registering necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  DoughnutController,
  ArcElement,
  PolarAreaController,
  ScatterController,
  BubbleController
);

const ChartGenerator = ({ data, columnHeaders }) => {
  const [chartType, setChartType] = useState("Line");
  const [xColumn, setXColumn] = useState(columnHeaders[0]);
  const [yColumn, setYColumn] = useState(columnHeaders[1]);

  useEffect(() => {
    if (columnHeaders.length > 1) {
      setXColumn(columnHeaders[0]);
      setYColumn(columnHeaders[1]);
    }
  }, [columnHeaders]);

  // Color for each chart type
  const chartColors = {
    Line: "#3490dc", // Light blue for line
    Bar: "#ff6f61", // Coral for bar chart
    Radar: "#ffcc00", // Yellow for radar chart
    Doughnut: "#1f8f85", // Teal for doughnut chart
    Pie: [
      "#FF5733", // Red
      "#33FF57", // Green
      "#3357FF", // Blue
      "#F5A623", // Orange
      "#8E44AD", // Purple
      "#1F77B4", // Sky Blue
      "#D35400", // Dark Orange
      "#F39C12", // Yellow
    ], // Array of distinct colors for Pie chart
    Scatter: "#f39c12", // Orange for scatter chart
    Bubble: "#8e44ad", // Purple for bubble chart
    PolarArea: "#27ae60", // Green for polar area chart
  };

  const chartData = {
    labels: data.map(row => row[columnHeaders.indexOf(xColumn)]),
    datasets: [
      {
        label: yColumn,
        data: data.map(row => row[columnHeaders.indexOf(yColumn)]),
        fill: false,
        borderColor: chartColors[chartType], // Use chartType-specific color for line border
        backgroundColor: chartType === "Pie" ? chartColors.Pie : chartColors[chartType], // For Pie, use multiple colors
        tension: 0.1,
      },
    ],
  };

  const chartDescriptions = {
    "Line": "Line charts are widely used for visualizing trends over time.",
    "Bar": "Bar charts are effective for comparing discrete categories or groups.",
    "Radar": "Radar charts are used to compare multiple variables across a common baseline.",
    "Doughnut": "Doughnut charts are similar to pie charts but with a central blank space.",
    "Pie": "Pie charts are used to represent parts of a whole.",
    "Scatter": "Scatter charts are ideal for visualizing the relationship between two continuous variables.",
    "Bubble": "Bubble charts are an extension of scatter plots that add a third dimension using the size of the bubbles.",
    "PolarArea": "Polar Area charts are similar to pie charts but utilize a polar coordinate system.",
  };

  const renderChart = () => {
    switch (chartType) {
      case "Line":
        return <Line data={chartData} />;
      case "Bar":
        return <Bar data={chartData} />;
      case "Radar":
        return <Radar data={chartData} />;
      case "Doughnut":
        return <Doughnut data={chartData} />;
      case "Pie":
        return <Pie data={chartData} />;
      case "Scatter":
        return <Scatter data={chartData} />;
      case "Bubble":
        return <Bubble data={chartData} />;
      case "PolarArea":
        return <PolarArea data={chartData} />;
      default:
        return <Line data={chartData} />;
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-lg shadow-xl max-w-4xl mx-auto">
      <div className="w-full max-w-lg mb-8">
        {/* Controls Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="chartType" className="text-white font-semibold text-lg">Chart Type</label>
            <select
              id="chartType"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="p-3 bg-white text-gray-800 rounded-xl shadow-md w-44 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="Line">Line Chart</option>
              <option value="Bar">Bar Chart</option>
              <option value="Radar">Radar Chart</option>
              <option value="Doughnut">Doughnut Chart</option>
              <option value="Pie">Pie Chart</option>
              <option value="Scatter">Scatter Chart</option>
              <option value="Bubble">Bubble Chart</option>
              <option value="PolarArea">Polar Area Chart</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <label htmlFor="xColumn" className="text-white font-semibold text-lg">X-Axis</label>
            <select
              id="xColumn"
              value={xColumn}
              onChange={(e) => setXColumn(e.target.value)}
              className="p-3 bg-white text-gray-800 rounded-xl shadow-md w-44 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {columnHeaders.map((header, index) => (
                <option key={index} value={header}>{header}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <label htmlFor="yColumn" className="text-white font-semibold text-lg">Y-Axis</label>
            <select
              id="yColumn"
              value={yColumn}
              onChange={(e) => setYColumn(e.target.value)}
              className="p-3 bg-white text-gray-800 rounded-xl shadow-md w-44 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {columnHeaders.map((header, index) => (
                <option key={index} value={header}>{header}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Wrapper */}
      <div className="w-full mb-8">
        <div className="relative border-4 border-white rounded-lg shadow-2xl overflow-hidden">
          {renderChart()}
        </div>
      </div>

      {/* Chart Description */}
      <div className="w-full max-w-lg text-center p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
        <p className="text-sm text-gray-700">{chartDescriptions[chartType]}</p>
      </div>
    </div>
  );
};

export default ChartGenerator;
