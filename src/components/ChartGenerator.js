import React, { useState, useRef, useEffect } from "react";
import { Line, Bar, Radar, Doughnut, Pie, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadarController,
  RadialLinearScale,
  ArcElement,
  DoughnutController,
  PieController,
  PolarAreaController,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  RadarController,
  RadialLinearScale,
  ArcElement,
  DoughnutController,
  PieController,
  PolarAreaController
);

const ChartGenerator = ({ data, columnHeaders }) => {
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState("line");
  const [chartData, setChartData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showColumns, setShowColumns] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowColumns(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleColumnSelection = (column) => {
    setSelectedColumns((prevSelected) =>
      prevSelected.includes(column)
        ? prevSelected.filter((col) => col !== column)
        : [...prevSelected, column]
    );
    setSearchTerm(""); // Reset search term after selecting
  };

  const generateChartData = () => {
    if (selectedColumns.length === 0 || !data.length) return;

    const datasets = selectedColumns.map((col) => {
      const colIndex = columnHeaders.indexOf(col);
      const colData = data.map((row) => parseFloat(row[colIndex])).filter((val) => !isNaN(val));
      return {
        label: col,
        data: colData,
        backgroundColor: generateRandomColor(),
        borderColor: generateRandomColor(),
      };
    });

    const labels = data.map((_, i) => `Row ${i + 1}`);

    setChartData({
      labels: labels,
      datasets,
    });
  };

  const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const renderChart = () => {
    if (!chartData) return null;

    switch (selectedChartType) {
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      case "bar":
        return <Bar data={chartData} options={chartOptions} />;
      case "radar":
        return <Radar data={chartData} options={getRadarOptions()} />;
      case "pie":
        return <Pie data={chartData} options={chartOptions} />;
      case "doughnut":
        return <Doughnut data={chartData} options={chartOptions} />;
      case "polarArea":
        return <PolarArea data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  const getRadarOptions = () => ({
    scale: {
      ticks: {
        beginAtZero: true,
        suggestedMin: 0,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  });

  return (
    <div>
      <div>
        <h4>Select Columns</h4>
        <div ref={dropdownRef}>
          <input
            type="text"
            placeholder={
              selectedColumns.length > 0
                ? selectedColumns.join(", ")
                : "Click to search columns..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowColumns(true)}
            style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            readOnly={selectedColumns.length > 0 && searchTerm === ""}
          />
          {showColumns && (
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #ccc",
                padding: "8px",
                borderRadius: "4px",
                backgroundColor: "#fff",
                zIndex: 100,
              }}
            >
              {columnHeaders
                .filter((header) =>
                  header.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((header) => (
                  <label key={header} style={{ display: "block", marginBottom: "4px" }}>
                    <input
                      type="checkbox"
                      value={header}
                      checked={selectedColumns.includes(header)}
                      onChange={() => handleColumnSelection(header)}
                    />
                    {header}
                  </label>
                ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h4>Select Chart Type</h4>
        <select
          onChange={(e) => setSelectedChartType(e.target.value)}
          value={selectedChartType}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="radar">Radar Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="doughnut">Doughnut Chart</option>
          <option value="polarArea">Polar Area Chart</option>
        </select>
      </div>

      <button onClick={generateChartData} style={{ marginTop: "16px" }}>
        Generate Chart
      </button>

      <div style={{ width: "100%", height: "400px", marginTop: "16px" }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartGenerator;
