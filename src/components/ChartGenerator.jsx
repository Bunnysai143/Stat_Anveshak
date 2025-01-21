import React, { useState, useEffect, useRef } from "react";
import {
  Line,
  Bar,
  Radar,
  Doughnut,
  Pie,
  Scatter,
  Bubble,
  PolarArea,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
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
  BubbleController,
  RadialLinearScale,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

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
  BubbleController,
  RadialLinearScale,
  zoomPlugin
);

const ChartGenerator = ({ data, columnHeaders }) => {
  const [chartType, setChartType] = useState("Line");
  const [xColumn, setXColumn] = useState(columnHeaders[0]);
  const [yColumn, setYColumn] = useState(columnHeaders[1]);
  const [showUniqueValues, setShowUniqueValues] = useState(false);
  const [processedData, setProcessedData] = useState(data);
  const chartRef = useRef(null);

  useEffect(() => {
    if (columnHeaders.length > 1) {
      setXColumn(columnHeaders[0]);
      setYColumn(columnHeaders[1]);
    }
  }, [columnHeaders]);

  useEffect(() => {
    if (showUniqueValues && typeof xColumn === "string") {
      const aggregatedData = [];
      const groupedData = {};

      data.forEach((row) => {
        const xValue = row[columnHeaders.indexOf(xColumn)];
        const yValue = parseFloat(row[columnHeaders.indexOf(yColumn)]);
        if (!groupedData[xValue]) groupedData[xValue] = [];
        groupedData[xValue].push(yValue);
      });

      for (const [key, values] of Object.entries(groupedData)) {
        aggregatedData.push({
          x: key,
          y: values.reduce((a, b) => a + b, 0) / values.length,
        });
      }

      setProcessedData(aggregatedData);
    } else {
      setProcessedData(data);
    }
  }, [showUniqueValues, xColumn, yColumn, data]);

  const chartColors = {
    Line: "#3490dc",
    Bar: "#ff6f61",
    Radar: "#ffcc00",
    Doughnut: [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F5A623",
      "#8E44AD",
      "#1F77B4",
      "#D35400",
      "#F39C12",
    ],
    Pie: [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F5A623",
      "#8E44AD",
      "#1F77B4",
      "#D35400",
      "#F39C12",
    ],
    Scatter: "#f39c12",
    Bubble: "#8e44ad",
    PolarArea: [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F5A623",
      "#8E44AD",
      "#1F77B4",
      "#D35400",
      "#F39C12",
    ],
  };

  const chartData = {
    labels: processedData.map((row) =>
      showUniqueValues ? row.x : row[columnHeaders.indexOf(xColumn)]
    ),
    datasets: [
      {
        label: yColumn,
        data: processedData.map((row) =>
          showUniqueValues ? row.y : row[columnHeaders.indexOf(yColumn)]
        ),
        fill: false,
        borderColor: chartColors[chartType],
        backgroundColor:
          chartType === "Pie" || chartType === "Doughnut"
            ? chartColors[chartType]
            : chartColors[chartType],
        tension: 0.1,
      },
    ],
  };

  const chartDescriptions = {
    Line: `Line charts are useful for showing trends over time (time series), allowing for an easy comparison of data points along a continuous axis. 
      - Use Cases: Stock market trends, sales performance over time, weather forecasting.
      - Advantages: Clear representation of trends, good for long-term analysis, can show multiple datasets.
      - Limitations: Can become cluttered with too many lines, not ideal for non-continuous data.`,
    Bar: `Bar charts represent data with rectangular bars, where the length of each bar is proportional to the data value. 
      - Use Cases: Comparing sales across regions, examining customer preferences, categorizing products.
      - Advantages: Easy to compare data, ideal for categorical data, simple and intuitive.
      - Limitations: Difficult to interpret if there are too many categories, can become cluttered with too many bars.`,
    Radar: `Radar charts visualize multiple variables on a circular grid, showing data points as spokes emanating from the center.
      - Use Cases: Comparing features of products, performance metrics across multiple criteria, skills assessment.
      - Advantages: Allows comparison of many variables in a single view, excellent for detecting strengths and weaknesses.
      - Limitations: Can be difficult to read if there are too many variables or if the data points are too close together.`,
    Doughnut: `Doughnut charts are similar to pie charts, but with a hollow center, providing more space for additional information or labels.
      - Use Cases: Showing market share, representing proportions in surveys, budget breakdown.
      - Advantages: More space for labels, visually attractive, highlights proportions of data.
      - Limitations: Harder to compare small differences, can become cluttered if too many segments are included.`,
    Pie: `Pie charts represent parts of a whole, with each slice corresponding to a data category.
      - Use Cases: Showing parts of a whole, like market share, budget allocation, or survey results.
      - Advantages: Simple to interpret, effective for representing small numbers of categories.
      - Limitations: Difficult to interpret with more than a few slices, ineffective for showing precise comparisons between categories.`,
    Scatter: `Scatter charts display individual data points on a two-dimensional plane, helping to identify correlations or patterns between variables.
      - Use Cases: Analyzing relationships between variables (e.g., income vs. education level), spotting outliers.
      - Advantages: Great for identifying correlations, showing distributions, and visualizing trends.
      - Limitations: Not suitable for categorical data, can be hard to interpret if there are too many points.`,
    Bubble: `Bubble charts are an extension of scatter plots, where each data point is represented by a bubble. The size of the bubble adds a third dimension, making it useful for displaying three variables.
      - Use Cases: Financial data analysis (e.g., revenue vs. cost vs. profit), demographic studies (e.g., population size vs. income vs. education).
      - Advantages: Can show three variables in one chart, great for complex data visualization.
      - Limitations: Can become crowded with too many points, needs careful attention to bubble size scaling.`,
    PolarArea: `Polar Area charts are a variation of pie charts that use polar coordinates. They represent quantities relative to an angular scale, with the area of each segment proportional to its value.
      - Use Cases: Showing data with a cyclical nature (e.g., wind direction vs. wind speed), comparing data across different directions.
      - Advantages: Suitable for showing directional or cyclical data, visually striking.
      - Limitations: Hard to interpret with too many segments, not suitable for datasets with non-angular relationships.`,
  };

  const chartOptions = {
    responsive: true,
    scales:
      chartType === "Radar"
        ? {
            r: {
              min: 0,
              max:
                Math.max(
                  ...processedData.map((row) =>
                    showUniqueValues ? row.y : row[columnHeaders.indexOf(yColumn)]
                  )
                ) + 10,
            },
          }
        : {},
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
  };

  const handleDownload = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement("a");
      link.href = url;
      link.download = "chart.png";
      link.click();
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case "Line":
        return <Line ref={chartRef} data={chartData} options={chartOptions} />;
      case "Bar":
        return <Bar ref={chartRef} data={chartData} options={chartOptions} />;
      case "Radar":
        return <Radar ref={chartRef} data={chartData} options={chartOptions} />;
      case "Doughnut":
        return <Doughnut ref={chartRef} data={chartData} options={chartOptions} />;
      case "Pie":
        return <Pie ref={chartRef} data={chartData} options={chartOptions} />;
      case "Scatter":
        return <Scatter ref={chartRef} data={chartData} options={chartOptions} />;
      case "Bubble":
        return <Bubble ref={chartRef} data={chartData} options={chartOptions} />;
      case "PolarArea":
        return <PolarArea ref={chartRef} data={chartData} options={chartOptions} />;
      default:
        return <Line ref={chartRef} data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-lg shadow-xl max-w-4xl mx-auto">
      <div className="w-full max-w-lg mb-8">
        {/* Chart configuration inputs */}
        {/* ... (same as before) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="chartType" className="text-white font-semibold text-lg">
              Chart Type
            </label>
            <select
              id="chartType"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="p-3 bg-white rounded-xl shadow-md w-44"
            >
              {Object.keys(chartDescriptions).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="xColumn" className="text-white font-semibold text-lg">
              X-Axis
            </label>
            <select
              id="xColumn"
              value={xColumn}
              onChange={(e) => setXColumn(e.target.value)}
              className="p-3 bg-white rounded-xl shadow-md w-44"
            >
              {columnHeaders.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="yColumn" className="text-white font-semibold text-lg">
              Y-Axis
            </label>
            <select
              id="yColumn"
              value={yColumn}
              onChange={(e) => setYColumn(e.target.value)}
              className="p-3 bg-white rounded-xl shadow-md w-44"
            >
              {columnHeaders.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-white font-semibold text-lg">
              Show Unique X-Values
            </label>
            <input
              type="checkbox"
              checked={showUniqueValues}
              onChange={(e) => setShowUniqueValues(e.target.checked)}
              className="h-6 w-6 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      <div className="relative w-full mb-8">
        <div className="relative border-4 border-white rounded-lg shadow-2xl">
          {renderChart()}
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={() => chartRef.current?.resetZoom()}
              className="bg-blue-500 text-white px-2 py-1 rounded shadow hover:bg-blue-600"
            >
              Reset Zoom
            </button>
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white px-2 py-1 rounded shadow hover:bg-green-600"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg text-center p-6 bg-white bg-opacity-80 rounded-lg shadow-md">
        {/* Chart descriptions */}
        <p className="text-sm text-gray-700">{chartDescriptions[chartType]}</p>
      </div>
    </div>
  );
};

export default ChartGenerator;
