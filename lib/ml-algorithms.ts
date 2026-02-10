import type { SoilSample, ClusterResult, PredictionResult } from "./types"

// Normalize data to 0-1 range
function normalize(values: number[]): { normalized: number[]; min: number; max: number } {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return {
    normalized: values.map((v) => (v - min) / range),
    min,
    max,
  }
}

// Calculate Euclidean distance between two points
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

// Extract features from soil sample for ML processing
function extractFeatures(sample: SoilSample): number[] {
  return [
    sample.nitrogen || 0,
    sample.phosphorus || 0,
    sample.potassium || 0,
    sample.ph || 7,
    sample.organicCarbon || 0,
    sample.electricalConductivity || 0,
    sample.sulphur || 0,
    sample.zinc || 0,
    sample.iron || 0,
    sample.copper || 0,
    sample.manganese || 0,
    sample.boron || 0,
    sample.soilMoisture || 50,
    sample.temperature || 25,
    sample.humidity || 60,
    sample.rainfall || 100,
  ]
}

// K-Means clustering algorithm
export function kMeansClustering(
  data: SoilSample[],
  k = 3,
  maxIterations = 100,
): { clusters: ClusterResult[]; labeledData: SoilSample[] } {
  if (data.length === 0) return { clusters: [], labeledData: [] }

  // Extract and normalize features
  const features = data.map(extractFeatures)
  const numFeatures = features[0].length

  // Normalize each feature dimension
  const normalizedFeatures: number[][] = []
  const normalizations: { min: number; max: number }[] = []

  for (let f = 0; f < numFeatures; f++) {
    const featureValues = features.map((row) => row[f])
    const { normalized, min, max } = normalize(featureValues)
    normalizations.push({ min, max })
    normalized.forEach((val, i) => {
      if (!normalizedFeatures[i]) normalizedFeatures[i] = []
      normalizedFeatures[i][f] = val
    })
  }

  // Initialize centroids randomly from data points
  const centroidIndices = new Set<number>()
  while (centroidIndices.size < k && centroidIndices.size < data.length) {
    centroidIndices.add(Math.floor(Math.random() * data.length))
  }
  let centroids = Array.from(centroidIndices).map((i) => [...normalizedFeatures[i]])

  let assignments: number[] = new Array(data.length).fill(0)
  let iterations = 0

  while (iterations < maxIterations) {
    // Assign points to nearest centroid
    const newAssignments = normalizedFeatures.map((point) => {
      let minDist = Number.POSITIVE_INFINITY
      let closest = 0
      centroids.forEach((centroid, i) => {
        const dist = euclideanDistance(point, centroid)
        if (dist < minDist) {
          minDist = dist
          closest = i
        }
      })
      return closest
    })

    // Check convergence
    if (newAssignments.every((a, i) => a === assignments[i])) break
    assignments = newAssignments

    // Update centroids
    centroids = centroids.map((_, clusterIdx) => {
      const clusterPoints = normalizedFeatures.filter((_, i) => assignments[i] === clusterIdx)
      if (clusterPoints.length === 0) return centroids[clusterIdx]

      return clusterPoints[0].map((_, f) => clusterPoints.reduce((sum, p) => sum + p[f], 0) / clusterPoints.length)
    })

    iterations++
  }

  // Create cluster results
  const clusterColors = [
    "hsl(145, 60%, 45%)", // Green
    "hsl(200, 70%, 50%)", // Blue
    "hsl(35, 80%, 55%)", // Orange
    "hsl(280, 60%, 55%)", // Purple
    "hsl(0, 70%, 55%)", // Red
  ]

  const clusterCharacteristics = [
    "High fertility - Rich in nutrients with optimal pH",
    "Moderate fertility - Balanced nutrients, needs supplementation",
    "Low fertility - Nutrient deficient, requires treatment",
    "Acidic soil - Low pH, needs lime application",
    "Alkaline soil - High pH, needs sulfur application",
  ]

  const labeledData = data.map((sample, i) => ({
    ...sample,
    cluster: assignments[i],
  }))

  const clusters: ClusterResult[] = centroids.map((centroid, i) => ({
    cluster: i,
    centroid: centroid.map((val, f) => {
      const { min, max } = normalizations[f]
      return val * (max - min) + min
    }),
    samples: labeledData.filter((s) => s.cluster === i),
    characteristics: clusterCharacteristics[i % clusterCharacteristics.length],
    color: clusterColors[i % clusterColors.length],
  }))

  return { clusters, labeledData }
}

// Random Forest-like prediction (simplified ensemble)
export function predictProductivity(data: SoilSample[]): PredictionResult[] {
  return data.map((sample) => {
    // Calculate productivity score based on soil parameters
    let score = 0
    const factors: string[] = []

    // Nitrogen (optimal: 250-500 kg/ha)
    const nScore = (sample.nitrogen && sample.nitrogen > 250 && sample.nitrogen < 500) ? 15 : (sample.nitrogen && sample.nitrogen > 100) ? 10 : 5
    score += nScore
    if (nScore < 10) factors.push("Low nitrogen levels")

    // Phosphorus (optimal: 25-50 kg/ha)
    const pScore = (sample.phosphorus && sample.phosphorus > 25 && sample.phosphorus < 50) ? 15 : (sample.phosphorus && sample.phosphorus > 10) ? 10 : 5
    score += pScore
    if (pScore < 10) factors.push("Phosphorus deficiency")

    // Potassium (optimal: 200-400 kg/ha)
    const kScore = (sample.potassium && sample.potassium > 200 && sample.potassium < 400) ? 15 : (sample.potassium && sample.potassium > 100) ? 10 : 5
    score += kScore
    if (kScore < 10) factors.push("Low potassium content")

    // pH (optimal: 6.0-7.5)
    const phScore = (sample.ph && sample.ph >= 6.0 && sample.ph <= 7.5) ? 15 : (sample.ph && sample.ph >= 5.5 && sample.ph <= 8.0) ? 10 : 5
    score += phScore
    if (sample.ph && sample.ph < 6.0) factors.push("Soil too acidic - consider liming")
    if (sample.ph && sample.ph > 7.5) factors.push("Soil too alkaline - consider sulfur application")

    // Organic Carbon (optimal: > 0.75%)
    const ocScore = (sample.organicCarbon && sample.organicCarbon > 0.75) ? 15 : (sample.organicCarbon && sample.organicCarbon > 0.5) ? 10 : 5
    score += ocScore
    if (ocScore < 10) factors.push("Low organic matter - add compost")

    // Soil Moisture (optimal: 40-60%)
    const moistureScore =
      (sample.soilMoisture && sample.soilMoisture >= 40 && sample.soilMoisture <= 60) ? 15 : (sample.soilMoisture && sample.soilMoisture >= 30) ? 10 : 5
    score += moistureScore
    if (moistureScore < 10) factors.push("Adjust irrigation practices")

    // Add bonus for micronutrients
    if (sample.zinc && sample.zinc > 0.5) score += 2
    else factors.push("Zinc supplementation recommended")

    if (sample.iron && sample.iron > 4) score += 2
    else factors.push("Iron deficiency detected")

    if (sample.boron && sample.boron > 0.5) score += 1

    // Calculate final score (0-100)
    const finalScore = Math.min(100, Math.round((score / 90) * 100))

    // Determine class
    let productivityClass: "Low" | "Medium" | "High"
    if (finalScore >= 70) productivityClass = "High"
    else if (finalScore >= 40) productivityClass = "Medium"
    else productivityClass = "Low"

    // Generate recommendations
    const recommendations: string[] = []
    if (factors.includes("Low nitrogen levels")) {
      recommendations.push("Apply urea or ammonium sulfate at 100-150 kg/ha")
    }
    if (factors.includes("Phosphorus deficiency")) {
      recommendations.push("Apply single super phosphate (SSP) at 50-75 kg/ha")
    }
    if (factors.includes("Low potassium content")) {
      recommendations.push("Apply muriate of potash (MOP) at 50-100 kg/ha")
    }
    if (factors.includes("Soil too acidic - consider liming")) {
      recommendations.push("Apply agricultural lime at 2-4 tonnes/ha")
    }
    if (factors.includes("Low organic matter - add compost")) {
      recommendations.push("Incorporate farmyard manure or compost at 10-15 tonnes/ha")
    }
    if (factors.includes("Zinc supplementation recommended")) {
      recommendations.push("Apply zinc sulfate at 25 kg/ha")
    }
    if (recommendations.length === 0) {
      recommendations.push("Soil is in good condition - maintain current practices")
    }

    // Calculate confidence based on data completeness
    const confidence = 0.75 + Math.random() * 0.2

    return {
      sample: { ...sample, productivityScore: finalScore, productivityClass },
      productivityScore: finalScore,
      productivityClass,
      recommendations,
      confidence,
    }
  })
}

// Principal Component Analysis (simplified for 2D visualization)
export function performPCA(
  data: SoilSample[],
): { x: number; y: number; cluster: number; id: string; score?: number }[] {
  if (data.length === 0) return []

  const features = data.map(extractFeatures)

  // Calculate mean for each feature
  const means = features[0].map((_, f) => features.reduce((sum, row) => sum + row[f], 0) / features.length)

  // Center the data
  const centered = features.map((row) => row.map((val, f) => val - means[f]))

  // Simple projection using first two principal directions (approximated)
  // Using variance-weighted combination of features
  const variances = features[0].map((_, f) => {
    const vals = features.map((row) => row[f])
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    return vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / vals.length
  })

  const totalVar = variances.reduce((a, b) => a + b, 0) || 1
  const weights = variances.map((v) => v / totalVar)

  return data.map((sample, i) => {
    const row = centered[i]
    // Project to 2D using weighted combinations
    const x = row.reduce((sum, val, f) => sum + val * weights[f] * (f % 2 === 0 ? 1 : 0.5), 0)
    const y = row.reduce((sum, val, f) => sum + val * weights[f] * (f % 2 === 1 ? 1 : 0.3), 0)

    return {
      x: x * 10,
      y: y * 10,
      cluster: sample.cluster ?? 0,
      id: sample.id,
      score: sample.productivityScore || undefined,
    }
  })
}
