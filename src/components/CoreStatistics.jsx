import React from "react";
import * as ss from "simple-statistics";
import '../styles/CoreStatistics.css';

const CoreStatistics = ({ data, columnHeaders }) => {
  const [selectedColumn, setSelectedColumn] = React.useState("");
  const [selectedStat, setSelectedStat] = React.useState("");

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

  const stats = selectedColumn ? calculateStatistics(selectedColumn) : {};

  const toggleInfo = (stat) => {
    setSelectedStat(selectedStat === stat ? "" : stat); // Toggle the selected stat for info
  };

  const getStatInfo = (stat) => {
    switch (stat) {
      case "mean":
        return {
          formula: "Mean = (Sum of all values) / (Number of values)",
          description: "The mean is the average of all the values in the dataset. It provides a measure of central tendency, indicating the overall level of the data. It's calculated by summing all the values in the dataset and dividing the sum by the number of values."
        };
      case "median":
        return {
          formula: "Median = Middle value of sorted dataset",
          description: "The median is the middle value when the data is sorted in ascending order. It is less sensitive to outliers compared to the mean. For an odd number of values, it's the exact middle value, and for an even number of values, it's the average of the two middle values."
        };
      case "mode":
        return {
          formula: "Mode = Most frequent value in the dataset",
          description: "The mode is the value that appears most frequently in the dataset. It indicates the most common observation. A dataset can have more than one mode (bimodal, multimodal) or no mode at all if all values appear with the same frequency."
        };
      case "variance":
        return {
          formula: "Variance = Σ((x - mean)²) / (n - 1)",
          description: "Variance measures the spread of data points around the mean. It is calculated by taking the squared differences between each data point and the mean, summing them up, and dividing by the number of values minus 1 (sample variance). A higher variance means more spread out data."
        };
      case "stdDev":
        return {
          formula: "Standard Deviation = √Variance",
          description: "The standard deviation is the square root of the variance and provides a measure of the spread of data in the same units as the data. It tells you how much individual data points deviate from the mean on average."
        };
      case "range":
        return {
          formula: "Range = Max value - Min value",
          description: "The range is the difference between the largest and smallest values in the dataset. It gives a sense of the spread of the data but is very sensitive to outliers."
        };
      case "skewness":
        return {
          formula: "Skewness = (1/n) * Σ((x - mean)³) / (stdDev³)",
          description: "Skewness measures the asymmetry of the data distribution. A positive skew means the data is concentrated on the left (tail on the right), while a negative skew means it’s concentrated on the right (tail on the left). It helps to identify the direction of the tail of the data."
        };
      case "kurtosis":
        return {
          formula: "Kurtosis = (1/n) * Σ((x - mean)⁴) / (stdDev⁴)",
          description: "Kurtosis measures the 'tailedness' of the data distribution. High kurtosis indicates heavy tails and extreme outliers, while low kurtosis indicates lighter tails and fewer outliers. It helps to understand the extremities in the dataset."
        };
      case "q1":
        return {
          formula: "Q1 = 25th percentile of the data",
          description: "The first quartile (Q1) is the median of the lower half of the dataset (the 25th percentile). It represents the point below which 25% of the data fall. It's used to understand the lower range of the dataset."
        };
      case "q3":
        return {
          formula: "Q3 = 75th percentile of the data",
          description: "The third quartile (Q3) is the median of the upper half of the dataset (the 75th percentile). It represents the point below which 75% of the data fall, indicating the upper range of the dataset."
        };
      case "iqr":
        return {
          formula: "IQR = Q3 - Q1",
          description: "The interquartile range (IQR) is the difference between Q3 and Q1. It measures the spread of the middle 50% of the data and is a robust measure of variability, as it is not affected by outliers."
        };
      case "rms":
        return {
          formula: "RMS = √((Σ(x²)) / n)",
          description: "The root mean square (RMS) is a measure of the magnitude of the dataset values. It's calculated by squaring each value, averaging the squared values, and then taking the square root. It’s commonly used to measure the magnitude of signals or deviations in data."
        };
      case "sumOfSquares":
        return {
          formula: "Sum of Squares = Σ((x - mean)²)",
          description: "The sum of squares is the total of the squared differences between each data point and the mean. It represents the total variation in the dataset, and it's used in calculating variance and standard deviation."
        };
      case "min":
        return {
          formula: "Min = Minimum value in the dataset",
          description: "The minimum value is the smallest value in the dataset. It gives an indication of the lower bound of the data range."
        };
      case "max":
        return {
          formula: "Max = Maximum value in the dataset",
          description: "The maximum value is the largest value in the dataset. It gives an indication of the upper bound of the data range."
        };
      case "sum":
        return {
          formula: "Sum = Σx",
          description: "The sum is the total of all the values in the dataset. It is the result of adding all values together."
        };
      case "count":
        return {
          formula: "Count = Total number of values in the dataset",
          description: "The count is simply the number of values in the dataset. It indicates how many observations are present."
        };
      default:
        return {};
    }
};

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
            {Object.keys(stats).map((key) => (
              <div className="stat-card" key={key} onClick={() => toggleInfo(key)}>
                <p className="stat-title">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                <p className="stat-value">{stats[key]}</p>
                {selectedStat === key && (
                  <div className="stat-info">
                    <p><strong>Formula:</strong> {getStatInfo(key).formula}</p>
                    <p><strong>Description:</strong> {getStatInfo(key).description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreStatistics;
