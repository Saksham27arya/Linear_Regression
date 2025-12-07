import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, ResponsiveContainer } from 'recharts';

const LinearRegressionModel = () => {
  const [data, setData] = useState([]);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [isTraining, setIsTraining] = useState(false);
  const [sampleSize, setSampleSize] = useState(100);
  const [noiseLevel, setNoiseLevel] = useState(0.1);

  // Generate synthetic dataset
  const generateData = (n = 100, noise = 0.1) => {
    const data = [];
    const trueSlope = 2.5;
    const trueIntercept = 10;
    
    for (let i = 0; i < n; i++) {
      const x = Math.random() * 20; // X values between 0 and 20
      const trueY = trueSlope * x + trueIntercept;
      const y = trueY + (Math.random() - 0.5) * noise * 50; // Add noise
      data.push({ x, y, id: i });
    }
    return data.sort((a, b) => a.x - b.x);
  };

  // Linear regression implementation
  const trainLinearRegression = (data) => {
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);
    
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    // Calculate slope (m) and intercept (b) for y = mx + b
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = meanY - slope * meanX;
    
    return { slope, intercept, meanX, meanY };
  };

  // Make predictions
  const makePredictions = (model, data) => {
    return data.map(point => ({
      ...point,
      predicted: model.slope * point.x + model.intercept
    }));
  };

  // Calculate performance metrics
  const calculateMetrics = (predictions) => {
    const n = predictions.length;
    const actualValues = predictions.map(p => p.y);
    const predictedValues = predictions.map(p => p.predicted);
    
    // Mean Squared Error (MSE)
    const mse = predictions.reduce((sum, point) => {
      const error = point.y - point.predicted;
      return sum + error * error;
    }, 0) / n;
    
    // Root Mean Squared Error (RMSE)
    const rmse = Math.sqrt(mse);
    
    // Mean Absolute Error (MAE)
    const mae = predictions.reduce((sum, point) => {
      return sum + Math.abs(point.y - point.predicted);
    }, 0) / n;
    
    // R-squared (coefficient of determination)
    const meanActual = actualValues.reduce((sum, val) => sum + val, 0) / n;
    const totalSumSquares = actualValues.reduce((sum, val) => {
      return sum + Math.pow(val - meanActual, 2);
    }, 0);
    const residualSumSquares = predictions.reduce((sum, point) => {
      return sum + Math.pow(point.y - point.predicted, 2);
    }, 0);
    
    const r2 = 1 - (residualSumSquares / totalSumSquares);
    
    // Adjusted R-squared
    const adjustedR2 = 1 - ((1 - r2) * (n - 1)) / (n - 2);
    
    return {
      mse: mse.toFixed(4),
      rmse: rmse.toFixed(4),
      mae: mae.toFixed(4),
      r2: r2.toFixed(4),
      adjustedR2: adjustedR2.toFixed(4),
      n
    };
  };

  // Train the model
  const handleTrain = async () => {
    setIsTraining(true);
    
    // Simulate training delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newData = generateData(sampleSize, noiseLevel);
    const trainedModel = trainLinearRegression(newData);
    const newPredictions = makePredictions(trainedModel, newData);
    const newMetrics = calculateMetrics(newPredictions);
    
    setData(newData);
    setModel(trainedModel);
    setPredictions(newPredictions);
    setMetrics(newMetrics);
    setIsTraining(false);
  };

  // Initialize with default data
  useEffect(() => {
    handleTrain();
  }, []);

  // Prepare data for visualization
  const chartData = predictions.map(point => ({
    x: parseFloat(point.x.toFixed(2)),
    actual: parseFloat(point.y.toFixed(2)),
    predicted: parseFloat(point.predicted.toFixed(2)),
    residual: parseFloat((point.y - point.predicted).toFixed(2))
  }));

  const residualData = predictions.map((point, index) => ({
    index: index + 1,
    residual: parseFloat((point.y - point.predicted).toFixed(2))
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Linear Regression Predictive Model
        </h1>
        
        {/* Controls */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Model Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Size: {sampleSize}
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={sampleSize}
                onChange={(e) => setSampleSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Noise Level: {noiseLevel.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleTrain}
                disabled={isTraining}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${
                  isTraining 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                }`}
              >
                {isTraining ? 'Training...' : 'Train Model'}
              </button>
            </div>
          </div>
        </div>

        {/* Model Parameters */}
        {model && (
          <div className="mb-8 p-4 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Model Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-600">Slope (m)</h3>
                <p className="text-2xl font-bold text-blue-600">{model.slope.toFixed(4)}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-600">Intercept (b)</h3>
                <p className="text-2xl font-bold text-blue-600">{model.intercept.toFixed(4)}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg text-gray-700">
                <strong>Equation:</strong> y = {model.slope.toFixed(4)}x + {model.intercept.toFixed(4)}
              </p>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {metrics.mse && (
          <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Performance Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">MSE</h3>
                <p className="text-xl font-bold text-red-600">{metrics.mse}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">RMSE</h3>
                <p className="text-xl font-bold text-red-600">{metrics.rmse}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">MAE</h3>
                <p className="text-xl font-bold text-orange-600">{metrics.mae}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">R²</h3>
                <p className="text-xl font-bold text-green-600">{metrics.r2}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-600">Adj R²</h3>
                <p className="text-xl font-bold text-green-600">{metrics.adjustedR2}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Metrics Explanation:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>MSE:</strong> Mean Squared Error - lower is better</li>
                <li><strong>RMSE:</strong> Root Mean Squared Error - same units as target variable</li>
                <li><strong>MAE:</strong> Mean Absolute Error - average absolute prediction error</li>
                <li><strong>R²:</strong> Coefficient of determination - proportion of variance explained (0-1, higher is better)</li>
                <li><strong>Adj R²:</strong> Adjusted R² - R² adjusted for number of predictors</li>
              </ul>
            </div>
          </div>
        )}

        {/* Visualization */}
        {chartData.length > 0 && (
          <div className="space-y-8">
            {/* Scatter Plot with Regression Line */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Actual vs Predicted Values</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="x" 
                    label={{ value: 'X (Feature)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Y (Target)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value.toFixed(2), name]}
                    labelFormatter={(label) => `X: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#ef4444" 
                    strokeWidth={0}
                    dot={{ r: 3, fill: '#ef4444' }}
                    name="Actual Values"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name="Regression Line"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Residual Plot */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Residual Plot</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={residualData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="index" 
                    label={{ value: 'Observation Index', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Residuals', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => [value.toFixed(4), 'Residual']}
                    labelFormatter={(label) => `Observation: ${label}`}
                  />
                  <Scatter dataKey="residual" fill="#8884d8" />
                  <Line 
                    type="monotone" 
                    dataKey={() => 0} 
                    stroke="#ff0000" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Model Summary */}
        <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Model Summary</h2>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Dataset Size:</strong> {metrics.n} observations</p>
            <p><strong>Model Type:</strong> Simple Linear Regression (y = mx + b)</p>
            <p><strong>Performance:</strong> 
              {parseFloat(metrics.r2) > 0.8 ? ' Excellent' : 
               parseFloat(metrics.r2) > 0.6 ? ' Good' : 
               parseFloat(metrics.r2) > 0.4 ? ' Fair' : ' Poor'} 
              (R² = {metrics.r2})
            </p>
            <p><strong>Prediction Accuracy:</strong> Average error of ±{metrics.rmse} units</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinearRegressionModel;