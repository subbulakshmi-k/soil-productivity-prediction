export interface SoilSample {
  id: string
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  organicCarbon: number
  electricalConductivity: number
  sulphur: number
  zinc: number
  iron: number
  copper: number
  manganese: number
  boron: number
  soilMoisture: number
  temperature: number
  humidity: number
  rainfall: number
  cluster?: number
  productivityScore?: number
  productivityClass?: "Low" | "Medium" | "High"
}

export interface ClusterResult {
  cluster: number
  centroid: number[]
  samples: SoilSample[]
  characteristics: string
  color: string
}

export interface PredictionResult {
  sample: SoilSample
  productivityScore: number
  productivityClass: "Low" | "Medium" | "High"
  recommendations: string[]
  confidence: number
}

export interface DatasetStats {
  totalSamples: number
  features: string[]
  summary: {
    [key: string]: {
      min: number
      max: number
      mean: number
      std: number
    }
  }
}
