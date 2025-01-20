import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ScatterChart, Scatter, ResponsiveContainer } from 'recharts';
import { Upload, Download, Table as TableIcon, Loader } from 'lucide-react';
import html2canvas from 'html2canvas';

const InferentialStatistics = ({ data: initialData, columnHeaders: initialHeaders }) => {
  const [activeTab, setActiveTab] = useState('hypothesis');
  const [data, setData] = useState(initialData);
  const [columnHeaders, setColumnHeaders] = useState(initialHeaders);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [testType, setTestType] = useState('Z-Test');
  const [samplingType, setSamplingType] = useState('Random');
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [sampleSize, setSampleSize] = useState(30);

  // Statistical helper functions
  const stats = {
    mean: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
    
    standardDeviation: (arr) => {
      const mean = stats.mean(arr);
      const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
      return Math.sqrt(variance);
    },
    
    zScore: (value, mean, sd) => (value - mean) / sd,
    
    tScore: (sampleMean, populationMean, sd, n) => 
      (sampleMean - populationMean) / (sd / Math.sqrt(n)),
    
    chiSquare: (observed, expected) => 
      observed.reduce((sum, obs, i) => sum + Math.pow(obs - expected[i], 2) / expected[i], 0)
  };

  // Format data for Recharts
  const formattedData = useMemo(() => {
    return data.map((row, index) => {
      const obj = { index };
      columnHeaders.forEach((header, colIndex) => {
        const value = row[colIndex];
        obj[header] = isNaN(Number(value)) ? value : Number(value);
      });
      return obj;
    });
  }, [data, columnHeaders]);

  // Infer numeric columns
  const numericColumns = useMemo(() => {
    if (!data.length || !columnHeaders.length) return [];
    
    return columnHeaders.filter((header, index) => {
      return data.every(row => {
        const value = row[index];
        return value !== undefined && value !== null && value !== '' && !isNaN(Number(value));
      });
    });
  }, [data, columnHeaders]);

  // Perform statistical tests
  const performStatisticalTest = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      const columnIndex = columnHeaders.indexOf(selectedColumn);
      const values = data.map(row => Number(row[columnIndex]));
      
      let results = {
        testType,
        column: selectedColumn,
        sampleSize: values.length,
        mean: stats.mean(values),
        standardDeviation: stats.standardDeviation(values)
      };

      switch (testType) {
        case 'Z-Test': {
          const zScore = stats.zScore(results.mean, 0, results.standardDeviation);
          results = {
            ...results,
            zScore,
            pValue: 2 * (1 - stats.normalCDF(Math.abs(zScore)))
          };
          break;
        }
        case 'T-Test': {
          const tScore = stats.tScore(results.mean, 0, results.standardDeviation, values.length);
          results = {
            ...results,
            tScore,
            degreesOfFreedom: values.length - 1
          };
          break;
        }
        // Add other test calculations here
      }

      setTestResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [testType, selectedColumn, data, columnHeaders]);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split('\n')
          .map(row => row.trim())
          .filter(row => row.length > 0)
          .map(row => row.split(','));

        if (rows.length < 2) {
          throw new Error('File must contain header row and data');
        }

        setColumnHeaders(rows[0]);
        setData(rows.slice(1));
        setSelectedColumn('');
        setTestResults(null);
      } catch (err) {
        setError(`Error parsing file: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };

    reader.readAsText(file);
  }, []);

  // Export graph

  // ... (previous state management and helper functions remain the same until the Tab components)

  // Modified Tab content components with individual export buttons
  const HypothesisTestingTab = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select 
          className="form-select rounded-md border-gray-300"
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
        >
          <option value="Z-Test">Z-Test</option>
          <option value="T-Test">T-Test</option>
          <option value="Chi-Square Test">Chi-Square Test</option>
          <option value="ANOVA">ANOVA</option>
        </select>
        <select
          className="form-select rounded-md border-gray-300"
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
        >
          <option value="">Select Column</option>
          {numericColumns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          onClick={performStatisticalTest}
          disabled={!selectedColumn}
        >
          Run Test
        </button>
      </div>

      {testResults && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Test Results</h3>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}

      {selectedColumn && formattedData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-end mb-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => exportGraph('hypothesisGraph')}
            >
              Export Hypothesis Graph
            </button>
          </div>
          <div id="hypothesisGraph">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey={selectedColumn} 
                  fill="#8884d8"
                  animationDuration={1000}
                  animationBegin={0}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  const ConfidenceIntervalsTab = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="number"
          value={confidenceLevel}
          onChange={(e) => setConfidenceLevel(Number(e.target.value))}
          className="form-input rounded-md border-gray-300"
          min="1"
          max="99"
        />
        <select
          className="form-select rounded-md border-gray-300"
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
        >
          <option value="">Select Column</option>
          {numericColumns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      {selectedColumn && formattedData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-end mb-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => exportGraph('confidenceGraph')}
            >
              Export Confidence Graph
            </button>
          </div>
          <div id="confidenceGraph">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={selectedColumn} 
                  stroke="#8884d8"
                  animationDuration={1000}
                  animationBegin={0}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  const SamplingTab = () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select
          className="form-select rounded-md border-gray-300"
          value={samplingType}
          onChange={(e) => setSamplingType(e.target.value)}
        >
          <option value="Random">Random</option>
          <option value="Stratified">Stratified</option>
          <option value="Cluster">Cluster</option>
        </select>
        <input
          type="number"
          value={sampleSize}
          onChange={(e) => setSampleSize(Number(e.target.value))}
          className="form-input rounded-md border-gray-300"
          min="1"
          max={data.length}
        />
        <select
          className="form-select rounded-md border-gray-300"
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
        >
          <option value="">Select Column</option>
          {numericColumns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      {selectedColumn && formattedData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-end mb-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => exportGraph('samplingGraph')}
            >
              Export Sampling Graph
            </button>
          </div>
          <div id="samplingGraph">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" type="number" />
                <YAxis dataKey={selectedColumn} type="number" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter 
                  name={selectedColumn} 
                  data={formattedData} 
                  fill="#8884d8"
                  animationDuration={1000}
                  animationBegin={0}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  // Updated export function with better error handling
  const exportGraph = useCallback(async (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) {
      setError('Graph element not found');
      return;
    }

    try {
      setLoading(true);
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        logging: false,
        scale: 2, // Higher quality export
      });
      
      const link = document.createElement('a');
      link.download = `${elementId}-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      setError(`Error exporting graph: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Main return remains the same but without the universal export button
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* File Upload and Error/Loading States */}
      <div className="flex justify-between items-center">
        <div>
          {error && (
            <div className="text-red-600">
              {error}
            </div>
          )}
          {loading && (
            <div className="flex items-center text-gray-600">
              <Loader className="animate-spin mr-2" size={16} />
              Processing...
            </div>
          )}
        </div>
        <label className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer">
          <Upload className="inline-block mr-2" size={16} />
          Upload Dataset
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'hypothesis', name: 'Hypothesis Testing' },
            { id: 'confidence', name: 'Confidence Intervals' },
            { id: 'sampling', name: 'Sampling' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'hypothesis' && <HypothesisTestingTab />}
        {activeTab === 'confidence' && <ConfidenceIntervalsTab />}
        {activeTab === 'sampling' && <SamplingTab />}
      </div>

      {/* Dataset Table */}
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <TableIcon className="mr-2" size={20} />
            Dataset Preview
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columnHeaders.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(0, 5).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length > 5 && (
          <div className="px-4 py-3 bg-gray-50 text-sm text-gray-500">
            Showing first 5 rows of {data.length} total rows
          </div>
        )}
      </div>

      {/* Export Dataset Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            const csvContent = [
              columnHeaders.join(','),
              ...data.map(row => row.join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'dataset.csv';
            link.click();
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
        >
          <Download className="mr-2" size={16} />
          Export Dataset
        </button>
      </div>
    </div>
  );
};

export default InferentialStatistics;