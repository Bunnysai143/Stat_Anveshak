import React from "react";
import * as ss from "simple-statistics";

const CoreStatistics = ({ data, columnHeaders }) => {
  const [selectedColumn, setSelectedColumn] = React.useState("");
  const [selectedStat, setSelectedStat] = React.useState("");

  // Helper function to check if a column is numeric
  const isNumericColumn = (column) => {
    const colIndex = columnHeaders.indexOf(column);
    const columnData = data.map((row) => row[colIndex]);
    return columnData.every((val) => !isNaN(parseFloat(val)) && isFinite(val));
  };

  // Filter numeric columns
  const numericColumns = columnHeaders.filter(isNumericColumn);

  const calculateStatistics = (column) => {
    const colIndex = columnHeaders.indexOf(column);
    const columnData = data
      .map((row) => parseFloat(row[colIndex]))
      .filter((val) => !isNaN(val));

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
      rms: Math.sqrt(ss.mean(columnData.map((val) => val ** 2))).toFixed(2),
      sumOfSquares: columnData
        .reduce((acc, val) => acc + (val - ss.mean(columnData)) ** 2, 0)
        .toFixed(2),
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
          description:
            "The mean is the average of all the values in the dataset. It provides a measure of central tendency, indicating the overall level of the data. It's calculated by summing all the values in the dataset and dividing the sum by the number of values.",
        };
      case "median":
        return {
          formula: "Median = Middle value of sorted dataset",
          description:
            "The median is the middle value when the data is sorted in ascending order. It is less sensitive to outliers compared to the mean.",
        };
      case "mode":
        return {
          formula: "Mode = Most frequent value in the dataset",
          description:
            "The mode is the value that appears most frequently in the dataset.",
        };
      case "variance":
        return {
          formula: "Variance = Σ((x - mean)²) / (n - 1)",
          description: "Variance measures the spread of data points around the mean.",
        };
      case "stdDev":
        return {
          formula: "Standard Deviation = √Variance",
          description:
            "The standard deviation is the square root of the variance and provides a measure of the spread of data in the same units as the data.",
        };
      case "range":
        return {
          formula: "Range = Max value - Min value",
          description:
            "The range is the difference between the largest and smallest values in the dataset.",
        };
      case "skewness":
        return {
          formula: "Skewness = (1/n) * Σ((x - mean)³) / (stdDev³)",
          description: "Skewness measures the asymmetry of the data distribution.",
        };
      case "kurtosis":
        return {
          formula: "Kurtosis = (1/n) * Σ((x - mean)⁴) / (stdDev⁴)",
          description: "Kurtosis measures the 'tailedness' of the data distribution.",
        };
      case "q1":
        return {
          formula: "Q1 = 25th percentile of the data",
          description:
            "The first quartile (Q1) is the median of the lower half of the dataset (the 25th percentile).",
        };
      case "q3":
        return {
          formula: "Q3 = 75th percentile of the data",
          description:
            "The third quartile (Q3) is the median of the upper half of the dataset (the 75th percentile).",
        };
      case "iqr":
        return {
          formula: "IQR = Q3 - Q1",
          description:
            "The interquartile range (IQR) is the difference between Q3 and Q1.",
        };
      case "rms":
        return {
          formula: "RMS = √((Σ(x²)) / n)",
          description:
            "The root mean square (RMS) is a measure of the magnitude of the dataset values.",
        };
      case "sumOfSquares":
        return {
          formula: "Sum of Squares = Σ((x - mean)²)",
          description:
            "The sum of squares is the total of the squared differences between each data point and the mean.",
        };
      case "min":
        return {
          formula: "Min = Minimum value in the dataset",
          description: "The minimum value is the smallest value in the dataset.",
        };
      case "max":
        return {
          formula: "Max = Maximum value in the dataset",
          description: "The maximum value is the largest value in the dataset.",
        };
      case "sum":
        return {
          formula: "Sum = Σx",
          description: "The sum is the total of all the values in the dataset.",
        };
      case "count":
        return {
          formula: "Count = Total number of values in the dataset",
          description: "The count is simply the number of values in the dataset.",
        };
      default:
        return {};
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-r from-indigo-300 to-purple-300 shadow-lg rounded-lg">
      <div className="mb-6">
        <select
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full p-3 border border-gray-200 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a column</option>
          {numericColumns.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>

      {selectedColumn && (
        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center sm:text-left">
            Statistics for {selectedColumn}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Object.keys(stats).map((key) => (
              <div
                key={key}
                className="p-4 border border-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-indigo-50 cursor-pointer transition duration-200 ease-in-out transform hover:scale-105"
                onClick={() => toggleInfo(key)}
              >
                <p className="text-lg font-medium text-center sm:text-left">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </p>
                <p className="text-sm text-gray-600 text-center sm:text-left">{stats[key]}</p>
                {selectedStat === key && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      <strong>Formula:</strong> {getStatInfo(key).formula}
                    </p>
                    <p>
                      <strong>Description:</strong> {getStatInfo(key).description}
                    </p>
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
