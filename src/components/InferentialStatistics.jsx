import React, { useEffect, useState } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
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
} from 'chart.js';
import "../styles/InferentialStatistics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InferentialStatisticsVisualiser = ({ data, columnHeaders }) => {
  const [selectedCategory, setSelectedCategory] = useState('hypothesis');
  const [xAxisColumn, setXAxisColumn] = useState(columnHeaders?.[0] || '');
  // console.log(xAxisColumn);
  const [indexx,setIndex] = useState(1);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { type: 'category', title: { display: true, text: 'Categories' } },
      y: { type: 'linear', title: { display: true, text: 'Values' } },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
  };

  useEffect(()=>{
   let a= columnHeaders.findIndex((element) => element === xAxisColumn);
   setIndex(a);
   console.log(indexx);
  })

  const getXValues = () => {
    const columnIndex = columnHeaders.indexOf(xAxisColumn);
  
    if (columnIndex === -1) {
      return data.map((_, index) => `Index ${index + 1}`); // Fallback labels
    }
  
    return data.map((row) => {
      const value = row[columnIndex];
      return value !== undefined && value !== null ? value : 'No Data'; // Handle missing values
    });
  };
  
  let a= data.map((item) => item[5] + 10);
  console.log(a);
  console.log("X Axis Labels:", getXValues());
  

  const chartData = {
    zTest: {
      labels: getXValues(),
      datasets: [
        {
          label: 'Z-Distribution',
          data: data.map((item) => item[5]),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.4,
          fill: false,
        },
      ],
    },
    tTest: {
      labels: getXValues(),
      datasets: [
        {
          label: 'Sample Distribution',
          data: data.map((item) => item[2]),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    },
    chiSquare: {
      labels: getXValues(),
      datasets: [
        {
          label: 'Observed',
          data: data.map((item) => item[3]),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Expected',
          data: data.map((item) => item[4]),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
        },
      ],
    },
    anova: {
      labels: getXValues(),
      datasets: [
        {
          label: 'ANOVA',
          data: data.map((item) => {
            const value = item[indexx+1]; // Ensure this index matches your data structure
            return value !== undefined && !isNaN(value) ? value : null;
          }).filter((value) => value !== null), // Exclude invalid values
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    },
    
    
    confidence: {
      labels: getXValues(),
      datasets: [
        {
          label: 'Mean',
          data: data.map((item) => item[5]),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          type: 'line',
        },
        {
          label: 'Lower Bound',
          data: data.map((item) => item[5] - 10),
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderColor: 'rgba(75, 192, 192, 0.1)',
          type: 'line',
        },  
        {
          label: 'Upper Bound',
          data: data.map((item) => item[5] + 10),
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderColor: 'rgba(75, 192, 192, 0.1)',
          type: 'line',
        },
      ],
    },
    randomSampling: {
      labels: data.map((_, index) => `Sample ${index + 1}`),
      datasets: [
        {
          label: 'Random Samples',
          data: data.map((item, index) => ({ x: index + 1, y: item[5] || 0 })),
          backgroundColor: 'rgb(75, 192, 192)',
        },
      ],
    },
    stratified: {
      labels: getXValues(),
      datasets: [
        {
          label: 'Stratum Size',
          data: data.map((item) => item[1] ?? 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Sample Size',
          data: data.map((item) => item[8] || 0),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
        },
      ],
    },
    clusterSampling: {
      labels: data.map((_, index) => `Cluster ${index + 1}`),
      datasets: [
        {
          label: 'Cluster Samples',
          data: data.map((item) => item[1] ??0),
          backgroundColor: 'rgb(255, 159, 64)',
        },
      ],
    },
  };

  const renderChart = (type) => {
    const charts = {
      hypothesis: (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Z-Test Distribution</h2>
            <div style={{ height: '300px' }}>
              <Line data={chartData.zTest} options={options} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">T-Test Comparison</h2>
            <div style={{ height: '300px' }}>
              <Bar data={chartData.tTest} options={options} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Chi-Square Test</h2>
            <div style={{ height: '300px' }}>
              <Bar data={chartData.chiSquare} options={options} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">ANOVA</h2>
            <div style={{ height: '300px' }}>
              <Bar data={chartData.anova} options={options} />
            </div>
          </div>
        </div>
      ),
      confidence: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Confidence Intervals</h2>
          <div style={{ height: '300px' }}>
            <Line data={chartData.confidence} options={options} />
          </div>
        </div>
      ),
      sampling: (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Random Sampling Distribution</h2>
            <div style={{ height: '300px' }}>
              <Scatter data={chartData.randomSampling} options={options} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Stratified Sampling</h2>
            <div style={{ height: '300px' }}>
              <Bar data={chartData.stratified} options={options} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Cluster Sampling</h2>
            <div style={{ height: '300px' }}>
              <Bar data={chartData.clusterSampling} options={options} />
            </div>
          </div>
        </div>
      ),
    };
    return charts[type] || null;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Inferential Statistics Visualization</h1>
        <select
          value={xAxisColumn}
          onChange={(e) => setXAxisColumn(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          {columnHeaders?.map((header, index) => (
            
            <option key={index} value={header}> 
              {header}
            </option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="hypothesis">Hypothesis Testing</option>
          <option value="confidence">Confidence Intervals</option>
          <option value="sampling">Sampling Methods</option>
        </select>
      </div>
      {renderChart(selectedCategory)}
    </div>
  );
};

export default InferentialStatisticsVisualiser;
