import React, { useState, useEffect } from "react";
import { Line, Bar, Radar, Doughnut, Pie, Scatter, Bubble, PolarArea } from "react-chartjs-2";
import "../styles/ChartGenerator.css";
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

  const chartData = {
    labels: data.map(row => row[columnHeaders.indexOf(xColumn)]),
    datasets: [
      {
        label: yColumn,
        data: data.map(row => row[columnHeaders.indexOf(yColumn)]),
        fill: false,
        borderColor: "#42a5f5",
        tension: 0.1
      }
    ]
  };

  const chartDescriptions = {
    "Line": `
      Line charts are widely used for visualizing trends over time. They help in understanding patterns and changes in continuous data points. A line chart is ideal for comparing multiple datasets over a common axis, such as time, and is effective for analyzing long-term trends, cyclical patterns, and fluctuations.
      - *Use Cases*: Stock price trends, sales performance, weather patterns, economic indicators.
      - *Advantages*: Easy to interpret trends, clear representation of changes over time, useful for forecasting.
      - *Limitations*: Can become cluttered when there are too many lines, not ideal for non-continuous data.
    `,
    "Bar": `
      Bar charts are effective for comparing discrete categories or groups. They provide a clear visual representation of the quantity of items in each category. A bar chart is ideal for representing data where the categories are distinct and non-overlapping.
      - *Use Cases*: Comparing sales figures by region, evaluating the popularity of products, showing demographic breakdowns.
      - *Advantages*: Easy to compare categories, great for visualizing differences, works well with both small and large datasets.
      - *Limitations*: Not suitable for continuous data, bars can be misinterpreted if not scaled properly.
    `,
    "Radar": `
      Radar charts are used to compare multiple variables across a common baseline. They are particularly effective for evaluating multiple metrics that need to be compared against each other. The chart’s radial layout allows for a visually engaging display of multi-dimensional data.
      - *Use Cases*: Comparing product features, performance metrics, skills assessment.
      - *Advantages*: Excellent for showing relative strengths and weaknesses, easy to compare multiple categories at once.
      - *Limitations*: Can become difficult to read if too many data points are added, not ideal for complex datasets with too many variables.
    `,
    "Doughnut": `
      Doughnut charts are similar to pie charts but with a central blank space, making them a more aesthetically pleasing option for displaying parts of a whole. They are useful for showing proportional data but allow for more space in the center for additional information or labels.
      - *Use Cases*: Market share representation, survey results, budget allocation.
      - *Advantages*: Visually attractive, great for showing proportions in a compact space, customizable with central labels or percentages.
      - *Limitations*: Can become unclear with too many slices, difficult to compare small differences between values.
    `,
    "Pie": `
      Pie charts are used to represent parts of a whole, typically as percentages of 100%. They are ideal for showing the composition of data in a way that is easily interpretable. However, they should only be used when there are a limited number of categories (typically fewer than 6) for clarity.
      - *Use Cases*: Showing market share, budget distribution, survey results.
      - *Advantages*: Simple and intuitive, effective for small numbers of categories.
      - *Limitations*: Becomes hard to interpret with too many categories, less effective when comparing similar-sized sections.
    `,
    "Scatter": `
      Scatter charts are ideal for visualizing the relationship between two continuous variables. They display data points on a two-dimensional axis and can reveal correlations, clusters, and trends.
      - *Use Cases*: Correlation analysis, relationship between income and age, studying customer behavior.
      - *Advantages*: Excellent for visualizing correlations, patterns, and outliers in data.
      - *Limitations*: Cannot be used for categorical data, difficult to interpret with too many data points.
    `,
    "Bubble": `
      Bubble charts are an extension of scatter plots that add a third dimension using the size of the bubbles. This allows for more complex data visualization and can represent an additional variable alongside the x and y axes.
      - *Use Cases*: Financial data analysis (e.g., revenue vs. cost vs. profit), population growth vs. income vs. education levels.
      - *Advantages*: Allows visualization of three variables in a single chart, great for representing complex datasets.
      - *Limitations*: Can become crowded with too many data points, requires careful scaling of bubble sizes.
    `,
    "PolarArea": `
      Polar Area charts are similar to pie charts but utilize a polar coordinate system. They are ideal for showing quantities of data in relation to different categories on a circular scale. The area of each sector is proportional to the value it represents.
      - *Use Cases*: Comparing angular data, weather statistics (wind direction vs. speed), directional metrics.
      - *Advantages*: Effective for displaying cyclic data or quantities that change with angles, visually appealing.
      - *Limitations*: Can be hard to read with too many categories, not suitable for large datasets or continuous data.
    `
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
    <div className="chart-container">
      <div className="controls">
        <select
          id="chartType"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
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

        <select
          id="xColumn"
          value={xColumn}
          onChange={(e) => setXColumn(e.target.value)}
        >
          {columnHeaders.map((header, index) => (
            <option key={index} value={header}>
              {header}
            </option>
          ))}
        </select>

        <select
          id="yColumn"
          value={yColumn}
          onChange={(e) => setYColumn(e.target.value)}
        >
          {columnHeaders.map((header, index) => (
            <option key={index} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>

      <div className="chart-wrapper">
        {renderChart()}
      </div>

      {/* Display Chart Description */}
      <div className="chart-description">
        <p>{chartDescriptions[chartType]}</p>
      </div>
    </div>
  );
};

export default ChartGenerator;
