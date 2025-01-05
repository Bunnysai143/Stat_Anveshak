import React from "react";
import * as ss from "simple-statistics";
import '../styles/CoreStatistics.css'; // Importing external CSS file

const CoreStatistics = ({ data, columnHeaders }) => {
  const calculateStatistics = (column) => {
    const colIndex = columnHeaders.indexOf(column);
    const columnData = data.map((row) => parseFloat(row[colIndex])).filter((val) => !isNaN(val));
    if (columnData.length === 0) return {};

    const min = Math.min(...columnData).toFixed(2);
    const max = Math.max(...columnData).toFixed(2);
    const range = (max - min).toFixed(2);
    const sum = ss.sum(columnData).toFixed(2);
    const count = columnData.length;

    const q1 = ss.quantile(columnData, 0.25).toFixed(2);
    const median = ss.median(columnData).toFixed(2);
    const q3 = ss.quantile(columnData, 0.75).toFixed(2);
    const iqr = (q3 - q1).toFixed(2);

    return {
      mean: ss.mean(columnData).toFixed(2),
      median,
      mode: ss.mode(columnData),
      variance: ss.variance(columnData).toFixed(2),
      stdDev: ss.standardDeviation(columnData).toFixed(2),
      range,
      min,
      max,
      sum,
      count,
      skewness: ss.sampleSkewness(columnData).toFixed(2),
      kurtosis: ss.sampleKurtosis(columnData).toFixed(2),
      q1,
      q3,
      iqr,
      rms: Math.sqrt(ss.mean(columnData.map(val => val ** 2))).toFixed(2),
      sumOfSquares: columnData.reduce((acc, val) => acc + (val - ss.mean(columnData)) ** 2, 0).toFixed(2)
    };
  };

  const [selectedColumn, setSelectedColumn] = React.useState("");
  const stats = selectedColumn ? calculateStatistics(selectedColumn) : {};

  return (
    <div className="statistics-container">
      <div className="select-container">
        <select onChange={(e) => setSelectedColumn(e.target.value)} className="column-select">
          <option value="">Select a column</option>
          {columnHeaders.map((header) => <option key={header}>{header}</option>)}
        </select>
      </div>

      {selectedColumn && (
        <div className="stats-display">
          <h3>Statistics for {selectedColumn}</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-title">Mean</p>
              <p className="stat-value">{stats.mean}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Median</p>
              <p className="stat-value">{stats.median}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Mode</p>
              <p className="stat-value">{stats.mode}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Variance</p>
              <p className="stat-value">{stats.variance}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Standard Deviation</p>
              <p className="stat-value">{stats.stdDev}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Range</p>
              <p className="stat-value">{stats.range}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Min</p>
              <p className="stat-value">{stats.min}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Max</p>
              <p className="stat-value">{stats.max}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Sum</p>
              <p className="stat-value">{stats.sum}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Count</p>
              <p className="stat-value">{stats.count}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Skewness</p>
              <p className="stat-value">{stats.skewness}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Kurtosis</p>
              <p className="stat-value">{stats.kurtosis}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Q1 (25th Percentile)</p>
              <p className="stat-value">{stats.q1}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Q3 (75th Percentile)</p>
              <p className="stat-value">{stats.q3}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">IQR</p>
              <p className="stat-value">{stats.iqr}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">RMS</p>
              <p className="stat-value">{stats.rms}</p>
            </div>
            <div className="stat-card">
              <p className="stat-title">Sum of Squares</p>
              <p className="stat-value">{stats.sumOfSquares}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreStatistics;
