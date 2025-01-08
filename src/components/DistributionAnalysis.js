import React, { useState } from "react";
import * as ss from "simple-statistics";
import { Line } from "react-chartjs-2";
import "../styles/DistributionAnalysis.css";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import jStat from "jstat";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DistributionAnalysis = ({ data, columnHeaders }) => {
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedDistributionType, setSelectedDistributionType] = useState("");
  const [selectedDistribution, setSelectedDistribution] = useState("");
  const [chartData, setChartData] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const continuousDistributions = [
    "Normal", "Exponential", "Uniform", "Gamma", "Log-Normal", "Beta", "Weibull", "Chi-Square", "Cauchy", "T-Distribution"
  ];

  const discreteDistributions = [
    "Binomial", "Poisson", "Geometric", "Bernoulli", "Negative Binomial", "Hypergeometric"
  ];

  const handleColumnChange = (event) => {
    const column = event.target.value;
    setSelectedColumn(column);
    setChartData(null);
    setSelectedDistributionType("");
    setSelectedDistribution("");
    setAccuracy(null);
  };

  const handleDistributionTypeChange = (event) => {
    setSelectedDistributionType(event.target.value);
    setSelectedDistribution("");
    setChartData(null);
    setAccuracy(null);
  };

  const handleDistributionChange = (event) => {
    const distribution = event.target.value;
    setSelectedDistribution(distribution);

    if (distribution && selectedColumn) {
      const colIndex = columnHeaders.indexOf(selectedColumn);
      const columnData = data.map((row) => parseFloat(row[colIndex])).filter((val) => !isNaN(val));
      if (columnData.length === 0) return;

      const labels = Array.from({ length: columnData.length }, (_, index) => index + 1);
      let distributionData = [];
      let calculatedAccuracy = 0;

      switch (distribution) {
        case "Normal":
          const mean = ss.mean(columnData);
          const stddev = ss.standardDeviation(columnData);
          distributionData = columnData.map((val) => ss.zScore(val, mean, stddev));
          calculatedAccuracy = 1 - stddev / mean;
          break;

        case "Exponential":
          const lambda = 1 / ss.mean(columnData);
          distributionData = columnData.map((val) => lambda * Math.exp(-lambda * val));
          calculatedAccuracy = lambda;
          break;

        case "Uniform":
          const min = Math.min(...columnData);
          const max = Math.max(...columnData);
          distributionData = columnData.map(() => 1 / (max - min));
          calculatedAccuracy = max - min;
          break;

        case "Gamma":
          const shape = 2; // example shape
          const scale = ss.mean(columnData) / shape;
          distributionData = columnData.map((val) => jStat.gamma.pdf(val, shape, scale));
          calculatedAccuracy = shape * scale;
          break;

        case "Log-Normal":
          const logMean = Math.log(ss.mean(columnData));
          const logStdDev = Math.log(ss.standardDeviation(columnData));
          distributionData = columnData.map((val) => jStat.lognormal.pdf(val, logMean, logStdDev));
          calculatedAccuracy = 1 / logStdDev;
          break;

        case "Beta":
          const alpha = 2; // example alpha
          const beta = 5; // example beta
          distributionData = columnData.map((val) => jStat.beta.pdf(val, alpha, beta));
          calculatedAccuracy = alpha / (alpha + beta);
          break;

        case "Weibull":
          const weibullScale = ss.mean(columnData);
          const weibullShape = 1.5; // example shape
          distributionData = columnData.map((val) => jStat.weibull.pdf(val, weibullShape, weibullScale));
          calculatedAccuracy = weibullScale / weibullShape;
          break;

        case "Chi-Square":
          const df = columnData.length - 1; // degrees of freedom
          distributionData = columnData.map((val) => jStat.chisquare.pdf(val, df));
          calculatedAccuracy = 1 / df;
          break;

        case "Cauchy":
          const location = ss.mean(columnData);
          const scaleParam = ss.standardDeviation(columnData);
          distributionData = columnData.map((val) => jStat.cauchy.pdf(val, location, scaleParam));
          calculatedAccuracy = 1 / scaleParam;
          break;

        case "T-Distribution":
          const dof = columnData.length - 1;
          distributionData = columnData.map((val) => jStat.studentt.pdf(val, dof));
          calculatedAccuracy = 1 / dof;
          break;

        case "Binomial":
          const trials = 10; // example
          const probability = 0.5; // example
          distributionData = columnData.map((val) => ss.binomialDistribution(trials, probability)[val] || 0);
          calculatedAccuracy = trials * probability;
          break;

        case "Poisson":
          const poissonLambda = ss.mean(columnData);
          distributionData = columnData.map((val) => ss.poissonDistribution(poissonLambda)[val] || 0);
          calculatedAccuracy = poissonLambda;
          break;

        case "Geometric":
          const geomP = 1 / ss.mean(columnData);
          distributionData = columnData.map((val) => geomP * Math.pow(1 - geomP, val - 1));
          calculatedAccuracy = geomP;
          break;

        case "Bernoulli":
          const bernP = ss.mean(columnData);
          distributionData = columnData.map((val) => (val === 0 ? 1 - bernP : bernP));
          calculatedAccuracy = bernP;
          break;

        case "Negative Binomial":
          const negR = 5; // example
          const negP = 0.5; // example
          distributionData = columnData.map((val) => jStat.negbinom.pdf(val, negR, negP));
          calculatedAccuracy = negR * negP;
          break;

        case "Hypergeometric":
          const N = 50;
          const K = 20;
          const n = 10;
          distributionData = columnData.map((val) => jStat.hypergeometric.pdf(val, N, K, n));
          calculatedAccuracy = K / N;
          break;

        default:
          break;
      }

      setAccuracy(calculatedAccuracy.toFixed(4));
      setChartData({
        labels,
        datasets: [
          {
            label: `${distribution} Distribution`,
            data: distributionData,
            fill: false,
            borderColor: "rgba(75,192,192,1)",
            tension: 0.1,
          },
        ],
      });
    }
  };

  return (
    <div className="distribution-analysis">
      
      <div className="controls">
        <select onChange={handleColumnChange}>
          <option value="">Select a column</option>
          {columnHeaders.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>

        {selectedColumn && (
          <>
            
            <select onChange={handleDistributionTypeChange}>
              <option value="">Select Type</option>
              <option value="Continuous">Continuous</option>
              <option value="Discrete">Discrete</option>
            </select>

            {selectedDistributionType === "Continuous" && (
              <select onChange={handleDistributionChange}>
                <option value="">Select Distribution</option>
                {continuousDistributions.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            )}

            {selectedDistributionType === "Discrete" && (
              <select onChange={handleDistributionChange}>
                <option value="">Select Distribution</option>
                {discreteDistributions.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist} 
                  </option>
                ))}
              </select>
            )}
          </>
        )}
      </div>

      {chartData && (
        <div className="chart-container">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: { title: { display: true, text: `${selectedDistribution} Distribution for ${selectedColumn} `} },
            }}
          />
        </div>
      )}

      {accuracy && (
        <div className="accuracy-container">
          <h4>Accuracy: {accuracy}</h4>
        </div>
      )}
    </div>
  );
};

export default DistributionAnalysis;
