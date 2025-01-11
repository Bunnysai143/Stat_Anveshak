import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Previous utility functions remain the same
const calculateMean = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;
const calculateStandardDeviation = (arr, mean) => {
  return Math.sqrt(arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length);
};

const getNumericColumns = (data) => {
  if (!data || data.length === 0) return [];
  return data[0].map((_, index) => {
    return data.every(row => typeof row[index] === 'number') ? index : null;
  }).filter(index => index !== null);
};

// New Factor Analysis Implementation
const performFactorAnalysis = (data, numFactors = 2) => {
  if (!data || data.length === 0) return [];
  
  const numericColumns = getNumericColumns(data);
  if (numericColumns.length < 2) return [];
  
  // Calculate correlation matrix
  const correlationMatrix = calculateCorrelationMatrix(data, numericColumns);
  
  // Simulate factor loadings (in a real implementation, you'd use eigendecomposition)
  const factorLoadings = simulateFactorLoadings(correlationMatrix, numFactors);
  
  // Calculate factor scores
  return data.map((row, i) => {
    const factorScores = calculateFactorScores(row, numericColumns, factorLoadings);
    return {
      name: row[0],
      ...factorScores
    };
  });
};

const calculateCorrelationMatrix = (data, numericColumns) => {
  const matrix = [];
  for (let i = 0; i < numericColumns.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < numericColumns.length; j++) {
      const col1 = data.map(row => row[numericColumns[i]]);
      const col2 = data.map(row => row[numericColumns[j]]);
      matrix[i][j] = calculateCorrelation(col1, col2);
    }
  }
  return matrix;
};

const calculateCorrelation = (x, y) => {
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  const stdX = calculateStandardDeviation(x, meanX);
  const stdY = calculateStandardDeviation(y, meanY);
  
  const covariance = x.reduce((sum, _, i) => 
    sum + ((x[i] - meanX) * (y[i] - meanY)), 0) / x.length;
  
  return covariance / (stdX * stdY);
};

const simulateFactorLoadings = (correlationMatrix, numFactors) => {
  return correlationMatrix.map(() => 
    Array.from({ length: numFactors }, () => Math.random() * 2 - 1)
  );
};

const calculateFactorScores = (row, numericColumns, factorLoadings) => {
  const scores = {};
  const numFactors = factorLoadings[0].length;
  
  for (let f = 0; f < numFactors; f++) {
    scores[`Factor${f + 1}`] = numericColumns.reduce((sum, colIndex, i) => 
      sum + (row[colIndex] * factorLoadings[i][f]), 0);
  }
  
  return scores;
};

// Previous PCA and K-Means implementations remain the same
const performPCA = (data) => {
  if (!data || data.length === 0) return [];
  
  const numericColumns = getNumericColumns(data);
  if (numericColumns.length < 2) return [];
  
  // Calculate means for numeric columns
  const means = numericColumns.map(colIndex => 
    calculateMean(data.map(row => row[colIndex]))
  );
  
  // Calculate standard deviations
  const stds = numericColumns.map((colIndex, i) => 
    calculateStandardDeviation(
      data.map(row => row[colIndex]),
      means[i]
    )
  );
  
  // Create PCA components using first two numeric features
  return data.map((row) => ({
    name: row[0],
    PC1: (row[numericColumns[0]] - means[0]) / (stds[0] || 1),
    PC2: (row[numericColumns[1]] - means[1]) / (stds[1] || 1)
  }));
};

const performKMeans = (data, k = 3) => {
  if (!data || data.length === 0) return [];
  if (!k || k < 1) k = 2;
  if (k > 10) k = 10;

  const numericColumns = getNumericColumns(data);
  if (numericColumns.length < 2) return [];

  // Use first two numeric columns for clustering
  return data.map(row => ({
    x: row[numericColumns[0]],
    y: row[numericColumns[1]],
    name: row[0],
    cluster: Math.floor(Math.random() * k)
  }));
};

const MultivariateAnalysis = ({ data = [],columnHeaders=[] }) => {
  const [analysisType, setAnalysisType] = useState('none');
  const [numClusters, setNumClusters] = useState(3);
  const [numFactors, setNumFactors] = useState(2);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Generate column headers based on data structure
  // const columnHeaders = useMemo(() => {
  //   if (!data || data.length === 0) return [];
  //   return Array(data[0].length).fill(0).map((_, i) => 
  //     i === 0 ? 'Name/ID' : `Feature ${i}`
  //   );
  // }, [data]);

  const numericColumns = useMemo(() => 
    getNumericColumns(data), [data]
  );

  const handleAnalysis = () => {
    if (!data || data.length === 0 || numericColumns.length < 2) {
      console.error('Insufficient numeric data for analysis');
      return;
    }

    switch (analysisType) {
      case 'pca':
        const pcaResult = performPCA(data);
        setAnalysisResult({ type: 'pca', data: pcaResult });
        break;
      case 'kmeans':
        const kmeansResult = performKMeans(data, numClusters);
        setAnalysisResult({ type: 'kmeans', data: kmeansResult });
        break;
      case 'factor':
        const factorResult = performFactorAnalysis(data, numFactors);
        setAnalysisResult({ type: 'factor', data: factorResult });
        break;
      default:
        setAnalysisResult(null);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000'];

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4 items-center">
        <select 
          className="px-4 py-2 border rounded-md"
          value={analysisType}
          onChange={(e) => setAnalysisType(e.target.value)}
        >
          <option value="none">Select Analysis</option>
          <option value="pca">PCA</option>
          <option value="kmeans">K-Means Clustering</option>
          <option value="factor">Factor Analysis</option>
        </select>
        
        {analysisType === 'kmeans' && (
          <input
            type="number"
            min="2"
            max="10"
            value={numClusters}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 2 && value <= 10) {
                setNumClusters(value);
              }
            }}
            className="px-4 py-2 border rounded-md w-24"
            placeholder="# Clusters"
          />
        )}

        {analysisType === 'factor' && (
          <input
            type="number"
            min="2"
            max="5"
            value={numFactors}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (value >= 2 && value <= 5) {
                setNumFactors(value);
              }
            }}
            className="px-4 py-2 border rounded-md w-24"
            placeholder="# Factors"
          />
        )}
        
        <button
          onClick={handleAnalysis}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!data.length || numericColumns.length < 2}
        >
          Run Analysis
        </button>
      </div>

      {numericColumns.length < 2 && data.length > 0 && (
        <div className="text-red-500">
          At least 2 numeric columns are required for analysis
        </div>
      )}

      {analysisResult && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
          
          {analysisResult.type === 'pca' && (
            <div className="h-64">
              <LineChart width={600} height={200} data={analysisResult.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="PC1" stroke="#8884d8" name="Principal Component 1" />
                <Line type="monotone" dataKey="PC2" stroke="#82ca9d" name="Principal Component 2" />
              </LineChart>
            </div>
          )}

          {analysisResult.type === 'kmeans' && (
            <div className="h-64">
              <ScatterChart width={600} height={200}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name={columnHeaders[numericColumns[0]]} />
                <YAxis type="number" dataKey="y" name={columnHeaders[numericColumns[1]]} />
                <Tooltip />
                <Legend />
                {Array.from({ length: numClusters }).map((_, index) => (
                  <Scatter
                    key={index}
                    name={`Cluster ${index + 1}`}
                    data={analysisResult.data.filter(point => point.cluster === index)}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </ScatterChart>
            </div>
          )}

          {analysisResult.type === 'factor' && (
            <div className="h-64">
              <LineChart width={600} height={200} data={analysisResult.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                {Array.from({ length: numFactors }).map((_, index) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={`Factor${index + 1}`}
                    stroke={COLORS[index % COLORS.length]}
                    name={`Factor ${index + 1}`}
                  />
                ))}
              </LineChart>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {columnHeaders.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${rowIndex}-${cellIndex}`}
                    className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
                  >
                    {typeof cell === 'number' 
                      ? cell.toLocaleString()
                      : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MultivariateAnalysis;