"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { StatsCards } from "@/components/stats-cards"
import { DataPreview } from "@/components/data-preview"
import { ProductivityPieChart } from "@/components/productivity-pie-chart"
import { NutrientRadarChart } from "@/components/nutrient-radar-chart"
import { ScoreHistogram } from "@/components/score-histogram"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, LineChart, Layers, FileText, MessageSquare } from "lucide-react"
import Link from "next/link"
import { soilDataStore } from "@/lib/soil-data-store"
import type { SoilSample, DatasetStats, ClusterResult, PredictionResult } from "@/lib/types"

export default function DashboardPage() {
  const [data, setData] = useState<SoilSample[]>([])
  const [stats, setStats] = useState<DatasetStats | null>(null)
  const [clusters, setClusters] = useState<ClusterResult[]>([])
  const [predictions, setPredictions] = useState<PredictionResult[]>([])

  useEffect(() => {
    setData(soilDataStore.getData())
    setStats(soilDataStore.getStats())
    setClusters(soilDataStore.getClusters())
    setPredictions(soilDataStore.getPredictions())
  }, [])

  const quickActions = [
    { href: "/upload", label: "Upload Data", icon: Upload, description: "Import your soil dataset" },
    { href: "/prediction", label: "Run Prediction", icon: LineChart, description: "Predict soil productivity" },
    { href: "/clustering", label: "View Clusters", icon: Layers, description: "Analyze soil groupings" },
    { href: "/reports", label: "Generate Report", icon: FileText, description: "Export PDF reports" },
    { href: "/chatbot", label: "Ask AI", icon: MessageSquare, description: "Get soil health advice" },
  ]

  return (
    <div className="flex h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">ML-Based Soil Productivity Prediction System</p>
          </div>

          <StatsCards stats={stats} clusters={clusters} predictions={predictions} />

          {predictions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Productivity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductivityPieChart predictions={predictions} />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreHistogram predictions={predictions} />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Nutrient Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <NutrientRadarChart stats={stats} />
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataPreview data={data} stats={stats} />
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Button variant="ghost" className="w-full justify-between h-auto py-3 px-4 hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <action.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
