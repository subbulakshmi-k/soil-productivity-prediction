import { getApiUrl, getBackendUrl, API_CONFIG } from './api-config'
import type { SoilSample, PredictionResult } from './types'

// API Response types
interface HealthResponse {
  status: string
  timestamp: string
  service: string
  model_loaded: boolean
  message?: string
}

interface PredictResponse {
  message: string
  input?: any
  productivity_score: number
  productivity_level?: string
  data?: any[]
  total_records?: number
  average_productivity?: number
  error?: string
}

// Check if backend is available
export async function checkBackendHealth(): Promise<HealthResponse | null> {
  const maxRetries = 2; // Reduced retries to prevent long delays
  const retryDelay = 500; // Reduced delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // Reduced timeout
      
      // Use the Next.js API route which will proxy to the Python backend
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        // Silently handle failed responses without console errors
        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          service: 'soil-productivity-prediction',
          model_loaded: false,
          message: `Backend returned ${response.status}: ${response.statusText}`
        };
      }

      let data: HealthResponse;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (parseError) {
        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          service: 'soil-productivity-prediction',
          model_loaded: false,
          message: 'Invalid response format from backend'
        };
      }
      return data;
    } catch (error) {
      // Silently handle connection errors without console spam
      
      // If this is the last attempt, return the error silently
      if (attempt === maxRetries) {
        if (error instanceof Error && error.name === 'AbortError') {
          return {
            status: 'error',
            timestamp: new Date().toISOString(),
            service: 'soil-productivity-prediction',
            model_loaded: false,
            message: 'Health check timed out'
          };
        }
        if (error instanceof Error && error.name === 'TimeoutError') {
          return {
            status: 'error',
            timestamp: new Date().toISOString(),
            service: 'soil-productivity-prediction',
            model_loaded: false,
            message: 'Health check request timed out'
          };
        }
        if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED'))) {
          return {
            status: 'error',
            timestamp: new Date().toISOString(),
            service: 'soil-productivity-prediction',
            model_loaded: false,
            message: 'Backend server is not running'
          };
        }
        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          service: 'soil-productivity-prediction',
          model_loaded: false,
          message: error instanceof Error ? error.message : 'Unknown error during health check'
        };
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return null;
}

// Convert backend response to frontend SoilSample format
function convertBackendDataToSoilSample(data: any, index: number): SoilSample {
  return {
    id: data.id || `sample-${index}`,
    nitrogen: data.nitrogen || data.N || 0,
    phosphorus: data.phosphorus || data.P || 0,
    potassium: data.potassium || data.K || 0,
    ph: data.ph || data.pH || 7,
    organicCarbon: data.organic_matter || data.organicCarbon || data.OC || 0,
    organic_matter: data.organic_matter || data.organicCarbon || data.OC || 0,
    electricalConductivity: data.electrical_conductivity || data.electricalConductivity || data.EC || 0,
    sulphur: data.sulphur || data.S || 0,
    zinc: data.zinc || data.Zn || 0,
    iron: data.iron || data.Fe || 0,
    copper: data.copper || data.Cu || 0,
    manganese: data.manganese || data.Mn || 0,
    boron: data.boron || data.B || 0,
    soilMoisture: data.moisture || data.soilMoisture || data.soil_moisture || 50,
    moisture: data.moisture || data.soilMoisture || data.soil_moisture || 50,
    temperature: data.temperature || data.temp || 25,
    humidity: data.humidity || 60,
    rainfall: data.rainfall || data.rain || 100,
    soilType: data.soilType || null,
    productivityScore: data.productivity_score || data.productivityScore,
    productivityClass: data.productivity_level || data.productivityClass,
  }
}

// Predict productivity for a single sample (JSON input)
export async function predictSingleSample(sample: SoilSample): Promise<PredictionResult> {
  try {
    // Convert frontend format to backend format
    const requestData = {
      nitrogen: sample.nitrogen,
      phosphorus: sample.phosphorus,
      potassium: sample.potassium,
      ph: sample.ph,
      organic_matter: sample.organicCarbon,
      electricalConductivity: sample.electricalConductivity,
      sulphur: sample.sulphur,
      zinc: sample.zinc,
      iron: sample.iron,
      copper: sample.copper,
      manganese: sample.manganese,
      boron: sample.boron,
      moisture: sample.soilMoisture,
      temperature: sample.temperature,
      humidity: sample.humidity,
      rainfall: sample.rainfall,
      soilType: sample.soilType,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      cache: 'no-store' as RequestCache,
      signal: controller.signal,
    };
    
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PREDICT), requestOptions)

    clearTimeout(timeout);

    if (!response.ok) {
      let errorMessage = `Prediction failed: ${response.statusText}`;
      try {
        const errorText = await response.text();
        // Try to parse as JSON first
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, use the raw text if it's meaningful
          if (errorText && errorText.trim() && !errorText.startsWith('<')) {
            errorMessage = `Prediction failed: ${errorText}`;
          }
        }
      } catch {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    let result: PredictResponse;
    try {
      const responseText = await response.text();
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response format from backend');
    }

    // Convert to frontend format
    const productivityScore = result.productivity_score
    const productivityClass = (result.productivity_level || 
      (productivityScore > 70 ? 'High' : productivityScore > 40 ? 'Medium' : 'Low')) as 'High' | 'Medium' | 'Low'

    // Use the backend's returned input data to preserve soilType and other fields
    const backendInput = result.input || {}
    const updatedSample: SoilSample = {
      ...sample,
      ...backendInput,
      // Convert backend field names back to frontend format
      organicCarbon: backendInput.organic_matter || sample.organicCarbon,
      soilMoisture: backendInput.moisture || sample.soilMoisture,
      soilType: backendInput.soilType || sample.soilType,
      productivityScore,
      productivityClass,
    }

    // Generate recommendations based on score
    const recommendations = generateRecommendations(updatedSample, productivityScore, productivityClass)

    return {
      sample: updatedSample,
      productivityScore,
      productivityClass,
      recommendations,
      confidence: 0.85, // Backend doesn't provide confidence, use default
    }
  } catch (error) {
    console.error('Prediction error:', error)
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      throw new Error('Prediction request timed out. Please try again.')
    }
    throw error
  }
}

// Predict productivity for multiple samples (file upload)
export async function predictFromFile(file: File): Promise<{
  data: SoilSample[]
  predictions: PredictionResult[]
  averageProductivity: number
}> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT * 2);
    
    // Use standard fetch without duplex option
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PREDICT), {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let errorMessage = `File prediction failed: ${response.statusText}`;
      try {
        const errorText = await response.text();
        // Try to parse as JSON first
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, use the raw text if it's meaningful
          if (errorText && errorText.trim() && !errorText.startsWith('<')) {
            errorMessage = `File prediction failed: ${errorText}`;
          }
        }
      } catch {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    let result: PredictResponse;
    try {
      const responseText = await response.text();
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response format from backend');
    }

    if (!result.data || result.data.length === 0) {
      throw new Error('No data returned from backend')
    }

    // Convert backend data to frontend format
    const samples: SoilSample[] = result.data.map((item: any, index: number) =>
      convertBackendDataToSoilSample(item, index)
    )

    // Create prediction results
    const predictions: PredictionResult[] = samples.map((sample) => {
      const score = sample.productivityScore || 0
      const productivityClass = (sample.productivityClass ||
        (score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low')) as 'High' | 'Medium' | 'Low'

      return {
        sample,
        productivityScore: score,
        productivityClass,
        recommendations: generateRecommendations(sample, score, productivityClass),
        confidence: 0.85,
      }
    })

    return {
      data: samples,
      predictions,
      averageProductivity: result.average_productivity || 0,
    }
  } catch (error) {
    console.error('File prediction error:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      throw new Error('File prediction request timed out. Please try again with a smaller file.')
    }
    throw error
  }
}

// Generate recommendations based on soil parameters
function generateRecommendations(
  sample: SoilSample,
  score: number,
  classLevel: 'High' | 'Medium' | 'Low'
): string[] {
  const recommendations: string[] = []

  if (sample.nitrogen && sample.nitrogen < 250) {
    recommendations.push('Apply urea or ammonium sulfate at 100-150 kg/ha')
  }
  if (sample.phosphorus && sample.phosphorus < 25) {
    recommendations.push('Apply single super phosphate (SSP) at 50-75 kg/ha')
  }
  if (sample.potassium && sample.potassium < 200) {
    recommendations.push('Apply muriate of potash (MOP) at 50-100 kg/ha')
  }
  if (sample.ph && sample.ph < 6.0) {
    recommendations.push('Apply agricultural lime at 2-4 tonnes/ha to raise pH')
  }
  if (sample.ph && sample.ph > 7.5) {
    recommendations.push('Apply sulfur at 1-2 tonnes/ha to lower pH')
  }
  if (sample.organicCarbon && sample.organicCarbon < 0.75) {
    recommendations.push('Incorporate farmyard manure or compost at 10-15 tonnes/ha')
  }
  if (sample.zinc && sample.zinc < 0.5) {
    recommendations.push('Apply zinc sulfate at 25 kg/ha')
  }
  if (sample.iron && sample.iron < 4) {
    recommendations.push('Apply iron chelates or ferrous sulfate')
  }
  if (sample.soilMoisture && sample.soilMoisture < 40) {
    recommendations.push('Increase irrigation frequency')
  }
  if (sample.soilMoisture && sample.soilMoisture > 60) {
    recommendations.push('Improve drainage to reduce waterlogging')
  }

  if (recommendations.length === 0) {
    recommendations.push('Soil is in good condition - maintain current practices')
  }

  return recommendations
}

// Get soil types from backend
export async function getSoilTypes(): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SOIL_TYPES), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch soil types: ${response.statusText}`)
    }

    try {
      const responseText = await response.text();
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse soil types response as JSON:', parseError);
      throw new Error('Invalid response format from backend');
    }
  } catch (error) {
    console.error('Failed to fetch soil types:', error)
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      console.warn('Soil types request timed out, using fallback values')
    }
    return ['Loam', 'Clay', 'Sandy', 'Silt', 'Peat', 'Chalk', 'Gravel', 'Sand', 'Clay Loam', 'Sandy Loam', 'Silty Clay', 'Sandy Clay', 'Loamy Sand', 'Silt Loam', 'Peat Loam', 'Chalky Loam', 'Gravelly Loam', 'Silty Loam', 'Clay Sand', 'Humus', 'Compost', 'Topsoil', 'Subsoil', 'Black Soil', 'Red Soil', 'Yellow Soil', 'Alluvial Soil', 'Laterite Soil', 'Saline Soil', 'Acidic Soil', 'Alkaline Soil'] // Fallback
  }
}
