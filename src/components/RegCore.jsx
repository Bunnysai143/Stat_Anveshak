import React, { useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import regression from 'regression';
import { correlation, spearmanRankCorrelation } from 'simple-statistics';

const RegressionAndCorrelation = () => {
  const [data, setData] = useState([]);
  const [xValues, setXValues] = useState([]);
  const [yValues, setYValues] = useState([]);
  const [model, setModel] = useState(null);
  const [pearson, setPearson] = useState(null);
  const [spearman, setSpearman] = useState(null);

  // Handle file upload (CSV/JSON parsing logic to populate data)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").map((row) => row.split(","));
      const x = rows.map((row) => parseFloat(row[0]));
      const y = rows.map((row) => parseFloat(row[1]));
      setXValues(x);
      setYValues(y);
      setData(rows);
    };
    reader.readAsText(file);
  };

  // Perform linear regression
  const performRegression = () => {
    const result = regression.linear(data.map(([x, y]) => [parseFloat(x), parseFloat(y)]));
    setModel(result);
  };

  // Calculate Correlation
  const calculateCorrelation = () => {
    const pearsonCoefficient = correlation(xValues, yValues);
    const spearmanCoefficient = spearmanRankCorrelation(xValues, yValues);
    setPearson(pearsonCoefficient);
    setSpearman(spearmanCoefficient);
  };

  // Prepare data for scatter plot
  const scatterData = {
    labels: xValues,
    datasets: [
      {
        label: 'Data Points',
        data: xValues.map((x, i) => ({ x, y: yValues[i] })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      ...(model
        ? [
            {
              label: 'Regression Line',
              data: xValues.map((x) => ({ x, y: model.predict(x)[1] })),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              type: 'line',
            },
          ]
        : []),
    ],
  };

  return (
    <div>
      <h1>Regression and Correlation Analysis</h1>
      <div>
        <input type="file" accept=".csv,.json" onChange={handleFileUpload} />
      </div>
      <button onClick={performRegression}>Perform Regression</button>
      <button onClick={calculateCorrelation}>Calculate Correlation</button>
      <Scatter data={scatterData} />
      {model && (
        <div>
          <h3>Regression Results:</h3>
          <p>Equation: {model.string}</p>
          <p>R² Value: {model.r2.toFixed(2)}</p>
        </div>
      )}
      {pearson !== null && spearman !== null && (
        <div>
          <h3>Correlation Coefficients:</h3>
          <p>Pearson's Correlation: {pearson.toFixed(2)}</p>
          <p>Spearman's Rank Correlation: {spearman.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default RegressionAndCorrelation;
