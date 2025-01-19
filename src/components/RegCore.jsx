import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const styles = `
.regression-container {
  padding: 20px;
  width: 100%;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-top: 16px;
}

@media (min-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr 1fr;
  }
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.visualization-container {
  margin-top: 16px;
  min-height: 400px;
}

.heatmap-container, .scatter-container {
  width: 100%;
  height: 500px;
}

.result-item {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ddd;
}

.result-item:hover {
  background-color: #f3f4f6;
}

.result-item.selected {
  background-color: #dbeafe;
}

.tooltip {
  position: absolute;
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  pointer-events: none;
  font-size: 12px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.no-data {
  padding: 16px;
  text-align: center;
  color: #666;
}
`;

const RegressionAndCorrelation = ({ data = [], columnHeaders = [] }) => {
  const [matrix, setMatrix] = useState([]);
  const [regressionResults, setRegressionResults] = useState([]);
  const [selectedRegression, setSelectedRegression] = useState(0);
  const heatmapRef = useRef(null);
  const scatterRef = useRef(null);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const calculateCorrelation = (arr1, arr2) => {
    if (!arr1?.length || !arr2?.length) return 0;
    
    // Convert strings to numbers and filter out non-numeric values
    const nums1 = arr1.map(val => typeof val === 'string' ? parseFloat(val) : val)
                     .filter(val => !isNaN(val) && val !== null);
    const nums2 = arr2.map(val => typeof val === 'string' ? parseFloat(val) : val)
                     .filter(val => !isNaN(val) && val !== null);
    
    if (nums1.length === 0 || nums2.length === 0) return NaN;

    const n = Math.min(nums1.length, nums2.length);
    const mean1 = nums1.reduce((a, b) => a + b, 0) / n;
    const mean2 = nums2.reduce((a, b) => a + b, 0) / n;
    
    const variance1 = nums1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0);
    const variance2 = nums2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0);
    
    if (variance1 === 0 || variance2 === 0) return NaN;
    
    const covariance = nums1.reduce((a, b, i) => {
      return i < n ? a + (b - mean1) * (nums2[i] - mean2) : a;
    }, 0);
    
    return covariance / Math.sqrt(variance1 * variance2);
  };

  const calculateRegression = (x, y) => {
    const validPairs = x.map((val, i) => [val, y[i]])
                       .filter(pair => !isNaN(pair[0]) && !isNaN(pair[1]));
    
    if (validPairs.length < 2) return { slope: NaN, intercept: NaN, rSquared: NaN };
    
    const xVals = validPairs.map(p => p[0]);
    const yVals = validPairs.map(p => p[1]);
    const n = validPairs.length;
    
    const sumX = xVals.reduce((a, b) => a + b, 0);
    const sumY = yVals.reduce((a, b) => a + b, 0);
    const sumXY = xVals.reduce((a, b, i) => a + b * yVals[i], 0);
    const sumXX = xVals.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const yMean = sumY / n;
    const ssTotal = yVals.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
    const ssResidual = yVals.reduce((a, b, i) => {
      const yPred = slope * xVals[i] + intercept;
      return a + Math.pow(b - yPred, 2);
    }, 0);
    
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return { slope, intercept, rSquared };
  };

  useEffect(() => {
    if (!data?.length || !columnHeaders?.length) {
      setMatrix([]);
      setRegressionResults([]);
      return;
    }

    try {
      const numVars = columnHeaders.length - 1;
      const matrix = [];
      const regressions = [];
      
      // Convert data to numerical arrays
      const numericalData = columnHeaders.slice(1).map((_, i) => 
        data.map(row => {
          const val = parseFloat(row[i + 1]);
          return isNaN(val) ? NaN : val;
        })
      );

      // Calculate correlation matrix
      for (let i = 0; i < numVars; i++) {
        const row = [];
        for (let j = 0; j < numVars; j++) {
          row.push(calculateCorrelation(numericalData[i], numericalData[j]));
          
          // Calculate regression for upper triangle only
          if (i < j) {
            const regression = calculateRegression(numericalData[i], numericalData[j]);
            if (!isNaN(regression.rSquared)) {
              regressions.push({
                x: columnHeaders[i + 1],
                y: columnHeaders[j + 1],
                ...regression
              });
            }
          }
        }
        matrix.push(row);
      }
      
      setMatrix(matrix);
      setRegressionResults(regressions);
    } catch (error) {
      console.error('Error processing data:', error);
      setMatrix([]);
      setRegressionResults([]);
    }
  }, [data, columnHeaders]);

  // Render heatmap
  useEffect(() => {
    if (!matrix.length || !heatmapRef.current) return;

    const container = heatmapRef.current;
    const margin = { top: 50, right: 50, bottom: 100, left: 100 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Clear previous content
    d3.select(container).selectAll("*").remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const numericalHeaders = columnHeaders.slice(1);
    const cellSize = Math.min(width, height) / numericalHeaders.length;

    // Create scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(numericalHeaders)
      .padding(0.05);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(numericalHeaders)
      .padding(0.05);

    // Color scale
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateRdBu)
      .domain([-1, 1]);

    // Create cells
    numericalHeaders.forEach((row, i) => {
      numericalHeaders.forEach((col, j) => {
        const correlation = matrix[i][j];
        
        svg.append("rect")
          .attr("x", x(col))
          .attr("y", y(row))
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .style("fill", isNaN(correlation) ? "#eee" : colorScale(correlation))
          .style("stroke", "white");

        svg.append("text")
          .attr("x", x(col) + x.bandwidth() / 2)
          .attr("y", y(row) + y.bandwidth() / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "12px")
          .text(isNaN(correlation) ? "N/A" : correlation.toFixed(2));
      });
    });

    // Add axes
    svg.append("g")
      .style("font-size", "12px")
      .call(d3.axisBottom(x))
      .attr("transform", `translate(0,${height})`)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .style("font-size", "12px")
      .call(d3.axisLeft(y));

  }, [matrix, columnHeaders]);

  // Render scatter plot
  useEffect(() => {
    if (!regressionResults.length || !scatterRef.current) return;

    const result = regressionResults[selectedRegression];
    if (!result) return;

    const container = scatterRef.current;
    const margin = { top: 50, right: 50, bottom: 100, left: 100 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Clear previous content
    d3.select(container).selectAll("*").remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get numerical data
    const xData = data.map(row => parseFloat(row[columnHeaders.indexOf(result.x)]));
    const yData = data.map(row => parseFloat(row[columnHeaders.indexOf(result.y)]));
    const validData = xData.map((x, i) => ({ x, y: yData[i] }))
                          .filter(d => !isNaN(d.x) && !isNaN(d.y));

    // Create scales
    const x = d3.scaleLinear()
      .domain([d3.min(validData, d => d.x) * 0.9, d3.max(validData, d => d.x) * 1.1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(validData, d => d.y) * 0.9, d3.max(validData, d => d.y) * 1.1])
      .range([height, 0]);

    // Add points
    svg.selectAll("circle")
      .data(validData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 4)
      .style("fill", "steelblue")
      .style("opacity", 0.6);

    // Add regression line if valid
    if (!isNaN(result.slope) && !isNaN(result.intercept)) {
      const xRange = d3.extent(validData, d => d.x);
      const lineData = xRange.map(x => ({
        x: x,
        y: result.slope * x + result.intercept
      }));

      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(d.y));

      svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .text(result.x);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .text(result.y);

  }, [regressionResults, selectedRegression, data, columnHeaders]);

  if (!data?.length || !columnHeaders?.length) {
    return <div className="no-data">No data available</div>;
  }

  return (
    <div className="p-5 w-full">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <h3 className="text-xl font-semibold mb-2">Correlation Heatmap</h3>
      <div ref={heatmapRef} className="min-h-[400px] w-full h-[500px]" />
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2">Regression Analysis</h3>
      <div ref={scatterRef} className="min-h-[400px] w-full h-[500px]" />
      <div className="flex flex-wrap gap-2">
  {regressionResults.map((result, i) => (
    <div
      key={i}
      className={`flex items-center px-4 py-2 text-sm rounded-full border cursor-pointer 
        ${
          i === selectedRegression
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
      onClick={() => setSelectedRegression(i)}
    >
      <div className="flex flex-col">
        <span className="font-medium">{result.x} vs {result.y}</span>
        <span>y = {result.slope.toFixed(4)}x + {result.intercept.toFixed(4)}</span>
        <span>R² = {result.rSquared.toFixed(4)}</span>
      </div>
      <button
        className="ml-4 text-gray-500 hover:text-red-500 focus:outline-none"
        onClick={(e) => {
          e.stopPropagation();
          // Add functionality to remove chip if needed
          console.log(`Remove chip ${i}`);
        }}
      >
        
      </button>
    </div>
  ))}
</div>

    </div>
  </div>
</div>
  );
};

export default RegressionAndCorrelation;