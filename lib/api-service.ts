import { getApiUrl, API_CONFIG } from './api-config'
import type { SoilSample, PredictionResult } from './types'

// API Response types
interface HealthResponse {
  status: string
  timestamp: string
  service: string
  model_loaded: boolean
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
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend health check failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'soil-productivity-prediction',
      model_loaded: false,
      message: error instanceof Error ? error.message : 'Unknown error during health check'
    };
  }
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
    electricalConductivity: data.electrical_conductivity || data.electricalConductivity || data.EC || 0,
    sulphur: data.sulphur || data.S || 0,
    zinc: data.zinc || data.Zn || 0,
    iron: data.iron || data.Fe || 0,
    copper: data.copper || data.Cu || 0,
    manganese: data.manganese || data.Mn || 0,
    boron: data.boron || data.B || 0,
    soilMoisture: data.moisture || data.soilMoisture || data.soil_moisture || 50,
    temperature: data.temperature || data.temp || 25,
    humidity: data.humidity || 60,
    rainfall: data.rainfall || data.rain || 100,
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
      moisture: sample.soilMoisture,
      temperature: sample.temperature,
    };

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PREDICT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      cache: 'no-store',
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Prediction failed: ${response.statusText}`);
    }

    const result: PredictResponse = await response.json();

    // Convert to frontend format
    const productivityScore = result.productivity_score
    const productivityClass = (result.productivity_level || 
      (productivityScore > 70 ? 'High' : productivityScore > 40 ? 'Medium' : 'Low')) as 'High' | 'Medium' | 'Low'

    // Generate recommendations based on score
    const recommendations = generateRecommendations(sample, productivityScore, productivityClass)

    return {
      sample: {
        ...sample,
        productivityScore,
        productivityClass,
      },
      productivityScore,
      productivityClass,
      recommendations,
      confidence: 0.85, // Backend doesn't provide confidence, use default
    }
  } catch (error) {
    console.error('Prediction error:', error)
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

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PREDICT), {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT * 2), // Longer timeout for file uploads
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(errorData.error || `File prediction failed: ${response.statusText}`)
    }

    const result: PredictResponse = await response.json()

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

  if (sample.nitrogen < 250) {
    recommendations.push('Apply urea or ammonium sulfate at 100-150 kg/ha')
  }
  if (sample.phosphorus < 25) {
    recommendations.push('Apply single super phosphate (SSP) at 50-75 kg/ha')
  }
  if (sample.potassium < 200) {
    recommendations.push('Apply muriate of potash (MOP) at 50-100 kg/ha')
  }
  if (sample.ph < 6.0) {
    recommendations.push('Apply agricultural lime at 2-4 tonnes/ha to raise pH')
  }
  if (sample.ph > 7.5) {
    recommendations.push('Apply sulfur at 1-2 tonnes/ha to lower pH')
  }
  if (sample.organicCarbon < 0.75) {
    recommendations.push('Incorporate farmyard manure or compost at 10-15 tonnes/ha')
  }
  if (sample.zinc < 0.5) {
    recommendations.push('Apply zinc sulfate at 25 kg/ha')
  }
  if (sample.iron < 4) {
    recommendations.push('Apply iron chelates or ferrous sulfate')
  }
  if (sample.soilMoisture < 40) {
    recommendations.push('Increase irrigation frequency')
  }
  if (sample.soilMoisture > 60) {
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
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SOIL_TYPES), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch soil types: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch soil types:', error)
    return ['Loam', 'Clay', 'Sandy', 'Silt', 'Peat'] // Fallback
  }
}
