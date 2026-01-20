"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react"
import { toast } from "sonner"
import type { SoilSample, DatasetStats } from "@/lib/types"
import { predictFromFile, checkBackendHealth } from "@/lib/api-service"

interface DataUploadProps {
  onDataLoaded: (data: SoilSample[], stats: DatasetStats) => void
}

export function DataUpload({ onDataLoaded }: DataUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)

  const parseCSV = (text: string): SoilSample[] => {
    const lines = text.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const fieldMap: Record<string, keyof SoilSample> = {
      n: "nitrogen",
      nitrogen: "nitrogen",
      p: "phosphorus",
      phosphorus: "phosphorus",
      k: "potassium",
      potassium: "potassium",
      ph: "ph",
      oc: "organicCarbon",
      organic_carbon: "organicCarbon",
      organiccarbon: "organicCarbon",
      ec: "electricalConductivity",
      electrical_conductivity: "electricalConductivity",
      s: "sulphur",
      sulphur: "sulphur",
      zn: "zinc",
      zinc: "zinc",
      fe: "iron",
      iron: "iron",
      cu: "copper",
      copper: "copper",
      mn: "manganese",
      manganese: "manganese",
      b: "boron",
      boron: "boron",
      moisture: "soilMoisture",
      soil_moisture: "soilMoisture",
      soilmoisture: "soilMoisture",
      temperature: "temperature",
      temp: "temperature",
      humidity: "humidity",
      rainfall: "rainfall",
      rain: "rainfall",
    }

    const samples: SoilSample[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      if (values.length < headers.length) continue

      const sample: Partial<SoilSample> = {
        id: `sample-${i}`,
      }

      headers.forEach((header, idx) => {
        const mappedField = fieldMap[header]
        if (mappedField && mappedField !== "id") {
          const value = Number.parseFloat(values[idx])
          if (!isNaN(value)) {
            ;(sample as Record<string, number | string>)[mappedField] = value
          }
        }
      })

      // Set defaults for missing values
      sample.nitrogen = sample.nitrogen ?? 0
      sample.phosphorus = sample.phosphorus ?? 0
      sample.potassium = sample.potassium ?? 0
      sample.ph = sample.ph ?? 7
      sample.organicCarbon = sample.organicCarbon ?? 0
      sample.electricalConductivity = sample.electricalConductivity ?? 0
      sample.sulphur = sample.sulphur ?? 0
      sample.zinc = sample.zinc ?? 0
      sample.iron = sample.iron ?? 0
      sample.copper = sample.copper ?? 0
      sample.manganese = sample.manganese ?? 0
      sample.boron = sample.boron ?? 0
      sample.soilMoisture = sample.soilMoisture ?? 50
      sample.temperature = sample.temperature ?? 25
      sample.humidity = sample.humidity ?? 60
      sample.rainfall = sample.rainfall ?? 100

      samples.push(sample as SoilSample)
    }

    return samples
  }

  const calculateStats = (data: SoilSample[]): DatasetStats => {
    const numericFields: (keyof SoilSample)[] = [
      "nitrogen",
      "phosphorus",
      "potassium",
      "ph",
      "organicCarbon",
      "electricalConductivity",
      "sulphur",
      "zinc",
      "iron",
      "copper",
      "manganese",
      "boron",
      "soilMoisture",
      "temperature",
      "humidity",
      "rainfall",
    ]

    const summary: DatasetStats["summary"] = {}

    numericFields.forEach((field) => {
      const values = data.map((d) => d[field] as number).filter((v) => !isNaN(v))
      if (values.length > 0) {
        const min = Math.min(...values)
        const max = Math.max(...values)
        const mean = values.reduce((a, b) => a + b, 0) / values.length
        const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)
        summary[field] = { min, max, mean, std }
      }
    })

    return {
      totalSamples: data.length,
      features: numericFields as string[],
      summary,
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploadedFile(file)
      setIsProcessing(true)
      setError(null)
      setUploadProgress(0)

      try {
        // Check backend availability first
        const health = await checkBackendHealth()
        const useBackend = health !== null && health.model_loaded

        if (useBackend) {
          setBackendAvailable(true)
          // Use backend API for prediction
          setUploadProgress(20)
          toast.info("Using backend ML model for prediction...")

          const result = await predictFromFile(file)
          setUploadProgress(90)

          const stats = calculateStats(result.data)
          onDataLoaded(result.data, stats)
          setUploadProgress(100)
          toast.success(
            `Successfully processed ${result.data.length} samples with ML predictions (Avg: ${result.averageProductivity.toFixed(1)})`
          )
        } else {
          setBackendAvailable(false)
          // Fallback to client-side parsing
          toast.warning("Backend unavailable, using client-side processing")
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90))
          }, 100)

          const text = await file.text()
          const data = parseCSV(text)

          clearInterval(progressInterval)
          setUploadProgress(100)

          if (data.length === 0) {
            throw new Error("No valid data found in the file")
          }

          const stats = calculateStats(data)
          onDataLoaded(data, stats)
          toast.success(`Successfully loaded ${data.length} soil samples`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process file")
        toast.error(err instanceof Error ? err.message : "Failed to process file")
      } finally {
        setIsProcessing(false)
      }
    },
    [onDataLoaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
  })

  const clearUpload = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setError(null)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Soil Dataset
        </CardTitle>
        <CardDescription>Upload your CSV file containing soil parameters (N, P, K, pH, etc.)</CardDescription>
      </CardHeader>
      <CardContent>
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }
            `}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-1">
              {isDragActive ? "Drop the file here" : "Drag & drop your dataset"}
            </p>
            <p className="text-sm text-muted-foreground">or click to browse (CSV, XLS, XLSX)</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {uploadProgress === 100 && !error && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Processed
                  </Badge>
                )}
                {error && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Error
                  </Badge>
                )}
                <Button variant="ghost" size="icon" onClick={clearUpload}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="text-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Expected columns:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "N",
                "P",
                "K",
                "pH",
                "OC",
                "EC",
                "S",
                "Zn",
                "Fe",
                "Cu",
                "Mn",
                "B",
                "Moisture",
                "Temp",
                "Humidity",
                "Rainfall",
              ].map((col) => (
                <Badge key={col} variant="outline" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </div>
          {backendAvailable !== null && (
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {backendAvailable ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Connected to backend ML model
                  </span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    ⚠ Using client-side processing (backend unavailable)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
