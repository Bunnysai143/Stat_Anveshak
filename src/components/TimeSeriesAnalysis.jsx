import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import * as ss from "simple-statistics";
import "../styles/TimeSeriesAnalysis.css";

// Function to perform a basic stationarity check using rolling mean
const isStationary = (data) => {
  const windowSize = Math.floor(data.length / 2);
  const rollingMean1 = ss.mean(data.slice(0, windowSize));
  const rollingMean2 = ss.mean(data.slice(windowSize));
  return Math.abs(rollingMean1 - rollingMean2) < 1e-2; // Threshold for stationarity
};

// Utility function to check if a column is relevant to time series analysis
const isRelevantColumn = (columnHeader, data) => {
  const dateFormats = [
    /^\d{4}-\d{2}-\d{2}$/,   // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    /^\d{2}-\d{2}-\d{4}$/,   // DD-MM-YYYY
    /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
  ];

  const isDateColumn = data.some((row) => dateFormats.some((format) => format.test(row[columnHeader])));

  const isValueColumn = data.every((row) => typeof row[columnHeader] === "number" && !isNaN(row[columnHeader]));

  return isDateColumn || isValueColumn;
};

const descriptions = {
  "Original Data": `
    <b>Original Data:</b> 
    <p><b>Use:</b> Represents the raw time series data without any transformations or smoothing. It is the starting point for any time series analysis, showing the observed values over time.</p>

    <p><b>How it works:</b> 
      - No modifications applied. This is simply the data as it was collected.
      - Visual Analysis: Helps you see trends, anomalies, outliers, and patterns.
    </p>

    <p><b>Formula:</b> 
      - There is no formula for the original data itself; it's just the set of data points collected in a time-ordered sequence.
    </p>

    <p><b>Example:</b> 
      - Stock price history, temperature readings over time, sales figures by day/week/month.
    </p>

    <p><b>Use in Practice:</b> 
      - You may start by plotting the original data to understand the natural behavior of the dataset before applying any statistical techniques.
    </p>
  `,
  
  "Moving Average": `
    <b>Moving Average:</b> 
    <p><b>Use:</b> A technique used to smooth the time series data by averaging data points over a specific period. Helps identify trends by reducing noise from random fluctuations.</p>

    <p><b>How it works:</b> 
      - The moving average takes a window size (number of data points) and calculates the average of the points in that window.
      - As you move the window along the data, you get a new average for each position, which "smooths" the fluctuations.
    </p>

    <p><b>Formula:</b> 
      - **Simple Moving Average (SMA)**:

        <code>MA<sub>t</sub> = (1/N) * Σ(y<sub>i</sub>) where i = t-N+1 to t</code>

        Where:
        - \( MA_t \) is the moving average at time \( t \).
        - \( N \) is the number of data points in the window.
        - \( y_i \) is the data point at time \( i \).
    </p>

    <p><b>Example Calculation:</b></p>
    <p>
      If the window size is 3, the moving average at time \( t \) would be the average of the previous three values:

      <code>MA(3) = (1/3) * (22 + 23 + 21) = 22</code>
    </p>

    <p><b>Use in Practice:</b> 
      - Used in stock market to determine price trends, identify entry/exit points in trading.
      - Commonly used to detect trends in sales, economic indicators, etc.
    </p>
  `,

  "Exponential Moving Average (EMA)": `
    <b>Exponential Moving Average (EMA):</b> 
    <p><b>Use:</b> An alternative to the Simple Moving Average (SMA) that gives more weight to recent data points, making it more responsive to changes. Suitable for data where recent changes matter more than past values.</p>

    <p><b>How it works:</b> 
      - Unlike SMA, the EMA assigns exponentially decreasing weights to older data points, making it more sensitive to recent trends.
      - The smoothing factor (\( \alpha \)) determines how much weight to give to the most recent data point.
    </p>

    <p><b>Formula:</b> 
      - The recursive formula for EMA is:

        <code>EMA<sub>t</sub> = α * y<sub>t</sub> + (1 - α) * EMA<sub>t-1</sub></code>

        Where:
        - \( \alpha = \frac{2}{n+1} \) is the smoothing factor.
        - \( y_t \) is the current data point.
        - \( EMA_{t-1} \) is the previous EMA.
    </p>

    <p><b>Example Calculation:</b></p>
    <p>
      EMA for 2025-01-02 with \( \alpha = 0.5 \):

      <code>EMA(2) = 0.5 * 23 + (1 - 0.5) * 22 = 22.5</code>
    </p>

    <p><b>Use in Practice:</b> 
      - Used in financial analysis, such as stock trading or sales forecasting, to detect trends more quickly compared to SMA.
    </p>
  `,

  "Differencing": `
    <b>Differencing:</b> 
    <p><b>Use:</b> A technique to make a time series stationary by removing trends and seasonality. Helps make data more suitable for forecasting models that assume stationarity (e.g., ARIMA).</p>

    <p><b>How it works:</b> 
      - Differencing involves subtracting the previous observation from the current observation. This removes the trend component of the data.
      - A first difference is computed as:

        <code>y<sub>t</sub>' = y<sub>t</sub> - y<sub>t-1</sub></code>

      - Seasonal differencing removes seasonal effects:

        <code>y<sub>t</sub>'' = y<sub>t</sub> - y<sub>t-s</sub></code>

        Where \(s\) is the seasonal period.
    </p>

    <p><b>Formula:</b> 
      - For first-order differencing:

        <code>y<sub>t</sub>' = y<sub>t</sub> - y<sub>t-1</sub></code>
    </p>

    <p><b>Example Calculation:</b></p>
    <p>
      Differencing for 2025-01-02:

      <code>Differencing(2) = 23 - 22 = 1</code>
    </p>

    <p><b>Use in Practice:</b> 
      - Often used when preparing data for models like ARIMA.
      - Helps identify if seasonality or trend is present and allows us to focus on the fluctuations (residuals).
    </p>
  `,

  "Stationarity Test": `
    <b>Stationarity Test:</b> 
    <p><b>Use:</b> A statistical test to check if a time series is stationary, meaning its statistical properties like mean and variance do not change over time.</p>

    <p><b>How it works:</b> 
      - A stationary series is required for many forecasting models like ARIMA, as the model assumes constant statistical properties.
      - The Augmented Dickey-Fuller (ADF) test is commonly used to check for stationarity.
    </p>

    <p><b>Formula:</b> 
      - The ADF test is based on the equation:

        <code>Δy<sub>t</sub> = α + βt + ρy<sub>t-1</sub> + Σ<sub>i=1</sub><sup>p</sup> φ<sub>i</sub> Δy<sub>t-i</sub> + ε<sub>t</sub></code>

        Where:
        - \( Δy_t \) is the change in the value of the time series.
        - \( ρ \) is the coefficient that tests for a unit root (stationarity).
        - \( ε_t \) is the error term.
    </p>

    <p><b>Use in Practice:</b> 
      - If the series is non-stationary, transformations (e.g., differencing or log transformation) are applied.
      - Essential before applying models like ARIMA for accurate forecasting.
    </p>
  `,

  "Autocorrelation": `
    <b>Autocorrelation:</b> 
    <p><b>Use:</b> Measures the correlation of a time series with its own past values at different lags. Helps identify repeating patterns or cycles in data.</p>

    <p><b>How it works:</b> 
      - Autocorrelation looks at how similar a series is to itself at different time lags.
      - If autocorrelation is high at a certain lag, it indicates that values from earlier time periods have a significant impact on future values.
    </p>

    <p><b>Formula:</b> 
      - The autocorrelation function (ACF) at lag \( k \) is given by:

        <code>ρ(k) = Σ<sub>t=k+1</sub><sup>n</sup> (y<sub>t</sub> - ȳ)(y<sub>t-k</sub> - ȳ) / Σ<sub>t=1</sub><sup>n</sup> (y<sub>t</sub> - ȳ)<sup>2</sup></code>

        Where:
        - \( ρ(k) \) is the autocorrelation at lag \( k \).
        - \( y_t \) is the value at time \( t \).
        - \( ȳ \) is the mean of the series.
    </p>

    <p><b>Use in Practice:</b> 
      - Commonly used to detect seasonal effects and cyclical behavior in time series data.
      - Helps determine how far back in time dependencies exist for predictive modeling.
    </p>
  `,

  "Trend Line": `
    <b>Trend Line:</b> 
    <p><b>Use:</b> A line or curve that represents the general direction (upward, downward, or constant) of the data over time. Useful for identifying the overall movement of the time series data.</p>

    <p><b>How it works:</b> 
      - Trend lines can be linear or non-linear, depending on the type of data and its characteristics.
      - The line is often determined by fitting a regression model to the data.
    </p>

    <p><b>Formula:</b> 
      - **Linear Trend Line**: \( y = mx + c \)

        Where:
        - \( m \) is the slope (rate of change).
        - \( c \) is the intercept.
        - \( x \) is time.
    </p>

    <p><b>Example Calculation:</b></p>
    <p>
      If the trend line is given by \( y = 2x + 5 \), for \( x = 3 \), we get:

      <code>y = 2(3) + 5 = 11</code>
    </p>

    <p><b>Use in Practice:</b> 
      - Used in trend analysis to visualize whether a data series is increasing or decreasing.
      - Important in stock market analysis, economics, and forecasting.
    </p>
  `,

  "Forecast": `
    <b>Forecasting:</b> 
    <p><b>Use:</b> Predicting future values based on historical data. Useful for decision-making in various industries (e.g., finance, retail, weather).</p>

    <p><b>How it works:</b> 
      - Forecasting models like ARIMA, Holt-Winters, or Prophet take historical data to forecast future points by identifying patterns like trends, seasonality, and cycles.
    </p>

    <p><b>Formula:</b> 
      - **ARIMA Model**:

        <code>y<sub>t</sub> = μ + φ<sub>1</sub> y<sub>t-1</sub> + θ<sub>1</sub> ε<sub>t-1</sub> + ε<sub>t</sub></code>

        Where:
        - \( y_t \) is the forecasted value.
        - \( μ \) is a constant.
        - \( φ_1 \) is the autoregressive term.
        - \( ε_t \) is the error term.
    </p>

    <p><b>Use in Practice:</b> 
      - Forecasting is used in demand planning, stock market prediction, weather forecasting, etc.
    </p>
  `
};

function TimeSeriesAnalysis({ data, columnHeaders }) {
  const timeSeriesColumns = columnHeaders.filter((header) => isRelevantColumn(header, data));
  const [dateColumn, setDateColumn] = useState("");
  const [valueColumn, setValueColumn] = useState("");
  const [chartData, setChartData] = useState(null);
  const [mae, setMae] = useState(null);
  const [mse, setMse] = useState(null);
  const [autocorrelation, setAutocorrelation] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState("Original Data");
  const [trendLine, setTrendLine] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [emaData, setEmaData] = useState(null);
  const [differencingData, setDifferencingData] = useState(null);
  const [stationarityTest, setStationarityTest] = useState(null);
  const [showSelectors, setShowSelectors] = useState(false);

  useEffect(() => {
    if (!dateColumn || !valueColumn) return;

    const formattedData = data
      .map((row) => {
        const date = row[columnHeaders.indexOf(dateColumn)];
        const value = row[columnHeaders.indexOf(valueColumn)];
        return { date, value };
      })
      .filter((row) => row.date && row.value !== null && row.value !== undefined);

    if (formattedData.length === 0) {
      console.error("No valid data entries after filtering null or undefined values.");
      return;
    }

    const values = formattedData.map((row) => row.value);

    // Moving Average
    const movingAverage = values.map((value, index, arr) => {
      if (index < 4) return null; // Assuming window size of 5
      const windowData = arr.slice(index - 4, index + 1);
      return ss.mean(windowData);
    });

    const actualValues = values.slice(4);
    const predictedValues = movingAverage.slice(4);

    // Exponential Moving Average (EMA)
    const alpha = 2 / (values.length + 1);
    const ema = values.reduce((acc, value, index) => {
      if (index === 0) return [value];
      const prevEma = acc[index - 1];
      const newEma = alpha * value + (1 - alpha) * prevEma;
      return [...acc, newEma];
    }, []);

    // Differencing
    const differencing = values.map((value, index, arr) => {
      if (index === 0) return null;
      return value - arr[index - 1];
    }).slice(1);

    // Trend Line Calculation
    const linReg = ss.linearRegression(values.map((value, index) => [index, value]));
    const linRegLine = ss.linearRegressionLine(linReg);
    const trendLineData = values.map((_, index) => linRegLine(index));

    // Simple ARIMA-like Forecasting (Using basic trend and seasonality)
    const forecast = [...values];
    for (let i = values.length; i < values.length + 12; i++) {
      const trend = linRegLine(i);
      const seasonalComponent = values[i % values.length]; // Repeat seasonal pattern
      forecast.push(trend + seasonalComponent - linRegLine(i % values.length));
    }

        // Chart Data
        const newChartData = {
          labels: formattedData.map((row) => row.date).concat(Array.from({ length: 12 }, (_, i) => `Forecast ${i + 1}`)),
          datasets: [
            {
              label: 'Original Data',
              data: values,
              borderColor: 'blue',
              fill: false,
            },
            {
              label: 'Moving Average',
              data: movingAverage,
              borderColor: 'red',
              fill: false,
            },
            {
              label: 'Trend Line',
              data: trendLineData,
              borderColor: 'green',
              fill: false,
            },
            {
              label: 'Forecast',
              data: forecast,
              borderColor: 'purple',
              fill: false,
            },
            {
              label: 'Exponential Moving Average (EMA)',
              data: ema,
              borderColor: 'orange',
              fill: false,
            },
            {
              label: 'Differencing',
              data: differencing,
              borderColor: 'gray',
              fill: false,
            }
          ],
        };
    
        // MAE and MSE Calculation
        const calculateMAE = (actual, predicted) => {
          return actual.reduce((sum, value, index) => sum + Math.abs(value - predicted[index]), 0) / actual.length;
        };
    
        const calculateMSE = (actual, predicted) => {
          return actual.reduce((sum, value, index) => sum + Math.pow(value - predicted[index], 2), 0) / actual.length;
        };
    
        const maeValue = calculateMAE(actualValues, predictedValues);
        const mseValue = calculateMSE(actualValues, predictedValues);
    
        // Autocorrelation Calculation
        const calculateAutocorrelation = (data, lag) => {
          const mean = ss.mean(data);
          const variance = ss.variance(data);
          let autoCovariance = 0;
    
          for (let i = 0; i < data.length - lag; i++) {
            autoCovariance += (data[i] - mean) * (data[i + lag] - mean);
          }
    
          return autoCovariance / (data.length - lag) / variance;
        };
    
        const acf = Array.from({ length: 20 }, (_, k) => calculateAutocorrelation(values, k + 1));
    
        // Stationarity Test
        const stationarity = isStationary(values) ? "Stationary" : "Non-Stationary";
        setStationarityTest(stationarity);
    
        setChartData(newChartData);
        setMae(maeValue);
        setMse(mseValue);
        setAutocorrelation(acf);
        setTrendLine(trendLineData);
        setForecastData(forecast);
        setEmaData(ema);
        setDifferencingData(differencing);
    
        console.log("New Chart Data: ", newChartData);
      }, [data, dateColumn, valueColumn, columnHeaders]);
    
      const handleDateColumnChange = (e) => setDateColumn(e.target.value);
      const handleValueColumnChange = (e) => setValueColumn(e.target.value);
      const handleAnalysisChange = (e) => setSelectedAnalysis(e.target.value);
    
      const renderSelectedAnalysis = () => {
        switch (selectedAnalysis) {
          case "Original Data":
            return <Line data={chartData} />;
          case "Moving Average":
            return (
              <>
                <Line data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Moving Average',
                      data: chartData.datasets[1].data,
                      borderColor: 'red',
                      fill: false,
                    }
                  ]
                }} />
              </>
            );
          case "Autocorrelation":
            return (
              <>
                <Line data={{
                  labels: [...Array(20).keys()],
                  datasets: [
                    {
                      label: 'Autocorrelation',
                      data: autocorrelation,
                      borderColor: 'black',
                      fill: false,
                    }
                  ]
                }} />
              </>
            );
          case "Trend Line":
            return (
              <>
                <Line data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Trend Line',
                      data: trendLine,
                      borderColor: 'green',
                      fill: false,
                    }
                  ]
                }} />
              </>
            );
          case "Forecast":
            return (
              <>
                <Line data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Forecast',
                      data: forecastData,
                      borderColor: 'purple',
                      fill: false,
                    }
                  ]
                }} />
              </>
            );
          case "Exponential Moving Average (EMA)":
            return (
              <>
                <Line data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Exponential Moving Average (EMA)',
                      data: emaData,
                      borderColor: 'orange',
                      fill: false,
                    }
                  ]
                }} />
              </>
            );
          case "Differencing":
            return (
              <>
                <Line data={{
                  labels: chartData.labels.slice(1), // Adjust labels for differencing
                  datasets: [
                    {
                      label: 'Differencing',
                      data: differencingData,
                      borderColor: 'gray',
                      fill: false,
                    }
                  ]
                }} />
              </>
            );
          case "Stationarity Test":
            return (
              <div>{`The series is ${stationarityTest}`}</div>
            );
          case "All Graphs":
            return <Line data={chartData} />;
          default:
            return <p>Select an analysis to view.</p>;
        }
      };
      return (
        <div className="time-series-analysis">
          {!showSelectors ? (
            <>
              <h2>Time Series Analysis</h2>
              <p>
                **What is Time Series Analysis?**
                <br />
                Time series analysis is a statistical technique that deals with time-ordered data points. It involves analyzing and interpreting data collected or recorded at specific time intervals to identify patterns, trends, and other meaningful information.
              </p>
              <p>
                **Uses of Time Series Analysis:**
                <br />
                Time series analysis is widely used across various fields such as finance, economics, environmental science, healthcare, and more. Some common applications include:
                <ul>
                  <li><b>Forecasting:</b> Predicting future values based on past observations (e.g., stock prices, weather conditions).</li>
                  <li><b>Anomaly Detection:</b> Identifying unusual patterns or outliers in the data (e.g., fraud detection, equipment monitoring).</li>
                  <li><b>Seasonal Analysis:</b> Understanding and quantifying seasonal effects in the data (e.g., retail sales, tourism trends).</li>
                </ul>
              </p>
              <p>
                **How Time Series Analysis Works:**
                <br />
                Time series analysis involves several techniques and methods to analyze the data:
                <ul>
                  <li><b>Moving Average (MA):</b> Smoothing out short-term fluctuations by averaging a specified number of past data points.</li>
                  <li><b>Exponential Moving Average (EMA):</b> Giving more weight to recent data points, making it more responsive to new information.</li>
                  <li><b>Differencing:</b> Making a time series stationary by removing trends and seasonality through differencing.</li>
                  <li><b>Autocorrelation:</b> Measuring the correlation between a time series and a lagged version of itself to identify patterns and seasonality.</li>
                  <li><b>ARIMA (AutoRegressive Integrated Moving Average):</b> A popular forecasting model that combines autoregression, differencing, and moving average techniques.</li>
                </ul>
              </p>
              <button className="start-time" onClick={() => setShowSelectors(true)}>Start Time Series Analysis</button>
            </>
          ) : (
            <>
              <div className="selectors">
                <label>
                  Date Column:
                  <select value={dateColumn} onChange={handleDateColumnChange}>
                    <option value="">Select</option>
                    {columnHeaders.map((header, index) => (
                      <option key={index} value={header}>{header}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Value Column:
                  <select value={valueColumn} onChange={handleValueColumnChange}>
                    <option value="">Select</option>
                    {columnHeaders.map((header, index) => (
                      <option key={index} value={header}>{header}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Select Analysis:
                  <select value={selectedAnalysis} onChange={handleAnalysisChange}>
                    <option value="Original Data">Original Data</option>
                    <option value="Moving Average">Moving Average</option>
                    <option value="Autocorrelation">Autocorrelation</option>
                    <option value="Trend Line">Trend Line</option>
                    <option value="Forecast">Forecast</option>
                    <option value="Exponential Moving Average (EMA)">Exponential Moving Average (EMA)</option>
                    <option value="Differencing">Differencing</option>
                    <option value="Stationarity Test">Stationarity Test</option>
                    <option value="All Graphs">All Graphs</option>
                  </select>
                </label>
              </div>
              <div className="metrics">
                <p><b>Mean Absolute Error (MAE):</b> {mae}</p>
                <p><b>Mean Squared Error (MSE):</b> {mse}</p>
              </div>
              {chartData ? (
                <>
                  <div className="chart-container">
                    {renderSelectedAnalysis()}
                  </div>
                  {selectedAnalysis !== "Original Data" && (
                    <div className="description">
                      <p dangerouslySetInnerHTML={{ __html: descriptions[selectedAnalysis] }} />
                    </div>
                  )}
                </>
              ) : (
                <p>No data available to plot the graph.</p>
              )}
              {!dateColumn || !valueColumn ? (
                <div className="explanations">
                  <h3>Example Dataset</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Value (like temperature, sales)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>2025-01-01</td>
                          <td>22</td>
                        </tr>
                        <tr>
                          <td>2025-01-02</td>
                          <td>23</td>
                        </tr>
                        <tr>
                          <td>2025-01-03</td>
                          <td>21</td>
                        </tr>
                        <tr>
                          <td>2025-01-04</td>
                          <td>25</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      );
      
    }
    

export default TimeSeriesAnalysis;