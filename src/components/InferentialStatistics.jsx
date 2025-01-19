import React, { useState, useCallback, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Upload } from 'lucide-react';

const StatisticalAnalysis = ({ data: initialData, columnHeaders }) => {
  // State management
  const [data, setData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [samplingMethod, setSamplingMethod] = useState('random');
  const [sampleSize, setSampleSize] = useState(Math.min(30, initialData?.length || 30));
  const [error, setError] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Initialize data with column headers
  useEffect(() => {
    if (initialData && columnHeaders) {
      const formattedData = initialData.map((row, index) => {
        const dataPoint = { index };
        columnHeaders.forEach((header, i) => {
          dataPoint[header] = row[i];
        });
        return dataPoint;
      });
      setData(formattedData);
    }
  }, [initialData, columnHeaders]);

  // Statistical Functions
  const statisticalHelpers = {
    calculateMean: (arr) => {
      if (!arr?.length) return 0;
      return arr.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) / arr.length;
    },
    
    calculateStandardDeviation: (arr) => {
      if (!arr?.length) return 0;
      const mean = statisticalHelpers.calculateMean(arr);
      const variance = arr.reduce((a, b) => a + Math.pow((b - mean), 2), 0) / (arr.length - 1);
      return Math.sqrt(variance);
    }
  };

  // Perform statistical test
  const performStatisticalTest = useCallback((testType) => {
    try {
      if (!selectedColumns.length) {
        throw new Error('Please select columns for analysis');
      }

      const results = {
        testType,
        columns: selectedColumns,
        statistics: {}
      };

      selectedColumns.forEach(column => {
        const values = data.map(row => row[column]);
        results.statistics[column] = {
          mean: statisticalHelpers.calculateMean(values),
          stdDev: statisticalHelpers.calculateStandardDeviation(values),
          sampleSize: values.length
        };
      });

      setTestResults(results);
      setAnimationKey(prev => prev + 1); // Trigger animation
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [data, selectedColumns]);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text
          .split('\n')
          .map(row => row.trim())
          .filter(row => row.length > 0)
          .map(row => row.split(','));
  
        if (rows.length < 2) {
          throw new Error('File must contain header row and data');
        }
  
        const headers = rows[0]; // First row as headers
        const newData = rows.slice(1).map((row, index) => {
          const dataPoint = { index };
          headers.forEach((header, i) => {
            const value = row[i];
            dataPoint[header] = !isNaN(parseFloat(value)) ? parseFloat(value) : value;
          });
          return dataPoint;
        });
  
        setData(newData); // Update data
        setSelectedColumns([]); // Reset selected columns
        setTestResults(null); // Clear previous results
        setAnimationKey(prev => prev + 1); // Trigger animation
        setError(null);
        columnHeaders = headers; // Dynamically update column headers
      } catch (err) {
        setError(`Error parsing file: ${err.message}`);
      }
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  }, []);
  

  // Export results
  const exportData = useCallback(() => {
    if (!testResults) {
      setError('No results to export');
      return;
    }
    
    const blob = new Blob([JSON.stringify(testResults, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statistical_analysis_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [testResults]);

  return (
    <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-6">
      {/* Header and Controls */}
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Statistical Analysis</h2>
        
        <div className="flex flex-wrap gap-4">
          <select
            value={samplingMethod}
            onChange={(e) => setSamplingMethod(e.target.value)}
            className="px-4 py-2 border rounded hover:border-blue-500 transition-colors"
          >
            <option value="random">Random Sampling</option>
            <option value="stratified">Stratified Sampling</option>
            <option value="cluster">Cluster Sampling</option>
          </select>
          
          <input
            type="number"
            value={sampleSize}
            onChange={(e) => setSampleSize(Math.max(1, Math.min(data.length, parseInt(e.target.value) || 0)))}
            className="px-4 py-2 border rounded"
            min="1"
            max={data.length}
          />
          
          <button
            onClick={() => document.getElementById('fileInput').click()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Data
          </button>
          
          <input
            id="fileInput"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          
          <button
            onClick={exportData}
            disabled={!testResults}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column Selection and Test Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {columnHeaders.map(header => (
              <button
                key={header}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedColumns.includes(header)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => {
                  setSelectedColumns(prev => 
                    prev.includes(header)
                      ? prev.filter(col => col !== header)
                      : prev.length < 2
                        ? [...prev, header]
                        : prev
                  );
                }}
              >
                {header}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {['Z-Test', 'T-Test', 'Chi-Square', 'ANOVA'].map(test => (
              <button
                key={test}
                onClick={() => performStatisticalTest(test.toLowerCase().replace('-', ''))}
                disabled={!selectedColumns.length}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedColumns.length
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {test}
              </button>
            ))}
          </div>
        </div>

        {/* Results and Visualization */}
        <div className="space-y-4">
          {testResults && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Animated Visualizations */}
          {selectedColumns.length > 0 && (
  <div className="h-80" key={animationKey}>
    <ResponsiveContainer width="100%" height="100%">
      {selectedColumns.length === 1 ? (
        // Line Chart for a single column
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={selectedColumns[0]} // Use the selected column as the key
            stroke="#8884d8"
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      ) : (
        // Bar Chart for multiple columns
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="index" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedColumns.map((column, index) => (
            <Bar
              key={column}
              dataKey={column} // Dynamically set the data key
              fill={index === 0 ? "#8884d8" : "#82ca9d"}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default StatisticalAnalysis;