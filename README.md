# Soil Productivity Prediction System

A comprehensive Machine Learning-based web application for analyzing soil health, predicting productivity, clustering soil samples, and generating actionable recommendations for agricultural improvement.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running in VS Code](#running-in-vs-code)
- [Usage Guide](#usage-guide)
- [Dataset Format](#dataset-format)
- [ML Algorithms](#ml-algorithms)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### 1. Data Input & Management
- **CSV File Upload**: Bulk upload soil data via CSV files with automatic parsing
- **Manual Entry Form**: Enter individual soil samples with 16 parameters
- **Data Preview**: View uploaded data with statistics and sample counts
- **Data Validation**: Automatic validation of input ranges and formats

### 2. Soil Productivity Prediction
- **ML-Based Scoring**: Weighted algorithm analyzing all soil parameters
- **Productivity Classification**: High, Medium, or Low productivity labels
- **Confidence Scores**: Reliability measure for each prediction
- **Actionable Recommendations**: Specific suggestions for soil improvement

### 3. Clustering Analysis
- **K-Means Clustering**: Group similar soil samples (2-5 clusters)
- **PCA Visualization**: 2D scatter plot of clustered data
- **Cluster Characteristics**: Detailed stats for each cluster
- **Distribution Charts**: Bar charts showing cluster composition

### 4. Data Visualizations
- **Productivity Pie Chart**: Distribution of productivity classes
- **Score Histogram**: Distribution of productivity scores
- **Nutrient Radar Chart**: Multi-axis view of average nutrient levels
- **Correlation Heatmap**: Feature correlation matrix

### 5. Report Generation
- **Customizable Reports**: Select which sections to include
- **Print-Ready Format**: Clean layout optimized for printing/PDF
- **Comprehensive Data**: Summary, statistics, predictions, clusters, recommendations

### 6. AI Chatbot Assistant
- **Soil Health Q&A**: Ask questions about soil parameters
- **Contextual Insights**: Responses based on your uploaded data
- **Expert Knowledge**: Information on fertilizers, pH, nutrients, and more

### 7. Animated Background
- **Live Soil Animation**: Floating particles, leaves, and seeds
- **Earth-Tone Aesthetics**: Agricultural-themed visual design

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS 4** | Utility-first CSS styling |
| **Recharts** | Data visualization charts |
| **shadcn/ui** | UI component library |
| **Sonner** | Toast notifications |
| **PapaParse** | CSV parsing library |

---

## Project Structure

```
soil-productivity-prediction/
├── app/
│   ├── page.tsx              # Dashboard home page
│   ├── layout.tsx            # Root layout with sidebar
│   ├── globals.css           # Global styles & theme
│   ├── upload/
│   │   └── page.tsx          # Data input page (CSV + Manual)
│   ├── prediction/
│   │   └── page.tsx          # Productivity prediction page
│   ├── clustering/
│   │   └── page.tsx          # K-Means clustering page
│   ├── reports/
│   │   └── page.tsx          # Report generation page
│   └── chatbot/
│       └── page.tsx          # AI chatbot page
├── components/
│   ├── sidebar-nav.tsx       # Navigation sidebar
│   ├── data-upload.tsx       # CSV upload component
│   ├── data-preview.tsx      # Data table preview
│   ├── manual-soil-form.tsx  # Manual entry form
│   ├── stats-cards.tsx       # Statistics cards
│   ├── soil-background-animation.tsx  # Animated background
│   ├── cluster-scatter-chart.tsx      # PCA scatter plot
│   ├── cluster-distribution-chart.tsx # Cluster bar chart
│   ├── productivity-pie-chart.tsx     # Pie chart
│   ├── score-histogram.tsx            # Histogram
│   ├── nutrient-radar-chart.tsx       # Radar chart
│   ├── feature-correlation-heatmap.tsx # Heatmap
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── ml-algorithms.ts      # ML prediction & clustering
│   ├── soil-data-store.ts    # Global data store
│   └── utils.ts              # Utility functions
├── package.json              # Dependencies
└── README.md
```

---

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| **Node.js** | 18.x or higher | [nodejs.o
rg](https://nodejs.org/) |
| **VS Code** | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Recommended VS Code Extensions

Install these extensions for the best development experience:

1. **ES7+ React/Redux/React-Native snippets** - React code snippets
2. **Tailwind CSS IntelliSense** - Tailwind autocomplete
3. **TypeScript Vue Plugin (Volar)** - TypeScript support
4. **Prettier - Code formatter** - Code formatting
5. **ESLint** - Code linting

---

## Running in VS Code

### Step-by-Step Guide

#### Step 1: Download the Project

**Option A: Download ZIP from v0**
1. In the v0 interface, click the **three dots menu** (⋯) in the top right
2. Select **"Download ZIP"**
3. Save the ZIP file to your desired location
4. Extract the ZIP file

**Option B: Use shadcn CLI**
```bash
npx shadcn@latest add https://v0.dev/chat/your-project-url
```

#### Step 2: Open in VS Code

1. Open **VS Code**
2. Go to **File → Open Folder** (or press `Ctrl+K Ctrl+O` on Windows/Linux, `Cmd+K Cmd+O` on Mac)
3. Navigate to the extracted project folder
4. Click **"Select Folder"**

#### Step 3: Open the Terminal

1. In VS Code, go to **Terminal → New Terminal** (or press `` Ctrl+` ``)
2. The terminal will open at the bottom of VS Code

#### Step 4: Install Dependencies

Run this command in the terminal:

```bash
npm install
```

Wait for the installation to complete. You'll see a `node_modules` folder appear.

**If you encounter errors:**
```bash
# Clear npm cache and retry
npm cache clean --force
npm install

# Or use yarn instead
yarn install

# Or use pnpm
pnpm install
```

#### Step 5: Start the Development Server

Run this command:

```bash
npm run dev
```

You should see output like:
```
   ▲ Next.js 16.x.x
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Starting...
 ✓ Ready in 2.5s
```

#### Step 6: Open in Browser

1. Hold `Ctrl` (or `Cmd` on Mac) and click on `http://localhost:3000` in the terminal
2. Or manually open your browser and go to: **http://localhost:3000**

#### Step 7: Start Using the App

The application is now running! You can:
1. Upload soil data via CSV or manual entry
2. Run predictions and clustering
3. Generate reports
4. Chat with the AI assistant

---

## Quick Reference Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## VS Code Tips

### Hot Reload
The development server supports **hot reload**. Any changes you make to the code will automatically refresh in the browser.

### Debugging
1. Open the **Run and Debug** panel (`Ctrl+Shift+D`)
2. Click **"create a launch.json file"**
3. Select **"Next.js: debug full stack"**
4. Press `F5` to start debugging

### Terminal Shortcuts
| Shortcut | Action |
|----------|--------|
| `` Ctrl+` `` | Toggle terminal |
| `Ctrl+C` | Stop the server |
| `Ctrl+L` | Clear terminal |

---

## Usage Guide

### Step 1: Upload Soil Data

1. Navigate to **Data Input** from the sidebar
2. Choose input method:
   - **CSV Upload**: Drag & drop or click to upload a CSV file
   - **Manual Entry**: Fill in the form for individual samples
3. Preview your data in the table below

### Step 2: Run Predictions

1. Navigate to **Prediction** from the sidebar
2. Click **"Run Prediction"** button
3. View results:
   - Overall statistics (average score, class distribution)
   - Individual sample predictions with confidence scores
   - Recommendations for soil improvement

### Step 3: Perform Clustering

1. Navigate to **Clustering** from the sidebar
2. Select number of clusters (2-5)
3. Click **"Run Clustering"**
4. Analyze:
   - 2D scatter plot (PCA visualization)
   - Cluster distribution chart
   - Detailed cluster characteristics

### Step 4: Generate Reports

1. Navigate to **Reports** from the sidebar
2. Select sections to include:
   - Summary
   - Statistics
   - Predictions
   - Clusters
   - Recommendations
3. Click **"Generate Report"**
4. Use **"Print Report"** to save as PDF

### Step 5: Chat with AI Assistant

1. Navigate to **Chatbot** from the sidebar
2. Ask questions about:
   - Soil parameters (pH, NPK, etc.)
   - Fertilizer recommendations
   - Crop suitability
   - Your uploaded data analysis

---

## Dataset Format

### Required CSV Structure

Your CSV file should contain the following columns:

| Column | Description | Unit | Range |
|--------|-------------|------|-------|
| `pH` | Soil acidity/alkalinity | - | 0-14 |
| `N` | Nitrogen content | kg/ha | 0-500 |
| `P` | Phosphorus content | kg/ha | 0-200 |
| `K` | Potassium content | kg/ha | 0-500 |
| `moisture` | Soil moisture | % | 0-100 |
| `temperature` | Soil temperature | °C | -10 to 60 |
| `rainfall` | Annual rainfall | mm | 0-5000 |
| `OC` | Organic Carbon | % | 0-10 |
| `EC` | Electrical Conductivity | dS/m | 0-10 |
| `S` | Sulphur | ppm | 0-100 |
| `Zn` | Zinc | ppm | 0-50 |
| `Fe` | Iron | ppm | 0-100 |
| `Cu` | Copper | ppm | 0-20 |
| `Mn` | Manganese | ppm | 0-100 |
| `B` | Boron | ppm | 0-10 |
| `humidity` | Air humidity | % | 0-100 |

### Sample CSV

```csv
pH,N,P,K,moisture,temperature,rainfall,OC,EC,S,Zn,Fe,Cu,Mn,B,humidity
6.5,120,45,200,35,25,1200,1.2,0.8,15,2.5,12,1.5,8,0.5,65
7.2,85,30,150,28,28,900,0.9,1.2,10,1.8,8,1.0,5,0.3,55
5.8,150,60,250,42,22,1500,1.8,0.5,20,3.2,15,2.0,12,0.8,72
```

### Column Name Flexibility

The system recognizes various column name formats:
- `nitrogen`, `N`, `n` → Nitrogen
- `phosphorus`, `P`, `p` → Phosphorus
- `potassium`, `K`, `k` → Potassium
- `organic_carbon`, `OC`, `oc` → Organic Carbon

---

## ML Algorithms

### Productivity Prediction

The prediction algorithm uses a **weighted scoring system**:

```
Productivity Score = Σ (normalized_value × weight)

Weights:
- pH: 15%
- Nitrogen: 15%
- Phosphorus: 12%
- Potassium: 12%
- Organic Carbon: 15%
- Moisture: 10%
- EC: 8%
- Micronutrients: 13% (combined)
```

**Classification Thresholds:**
- **High**: Score ≥ 70
- **Medium**: Score 40-69
- **Low**: Score < 40

### K-Means Clustering

1. **Normalization**: Min-max scaling of all features
2. **Initialization**: K-means++ for centroid selection
3. **Iteration**: Lloyd's algorithm until convergence
4. **PCA**: Principal Component Analysis for 2D visualization

---

## API Reference

### Data Store (lib/soil-data-store.ts)

```typescript
// Get current data
const data = getSoilData()

// Set new data
setSoilData(newData: SoilSample[])

// Subscribe to changes
const unsubscribe = subscribeSoilData((data) => {
  console.log('Data updated:', data)
})
```

### ML Functions (lib/ml-algorithms.ts)

```typescript
// Run predictions
const results = predictProductivity(samples: SoilSample[])

// Run clustering
const clusters = performClustering(samples: SoilSample[], k: number)

// Get recommendations
const recs = generateRecommendations(sample: SoilSample)
```

---

## Troubleshooting

### Common Issues

**"npm install" fails**
```bash
# Delete node_modules and package-lock.json, then retry
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 already in use**
```bash
# Use a different port
npm run dev -- -p 3001
```

**CSV not parsing correctly**
- Ensure columns match expected names (see Dataset Format)
- Check for special characters in headers
- Verify CSV encoding is UTF-8

**Predictions showing NaN**
- Ensure all numeric fields have valid values
- Check for empty cells in your CSV

**Charts not rendering**
- Upload data first before running predictions
- Ensure you have at least 3 samples for clustering

---

## Deployment

### Deploy to Vercel (Recommended)

**Option 1: From v0**
1. Click the **"Publish"** button in v0
2. Follow the prompts to deploy

**Option 2: Using Vercel CLI**
```bash
npm i -g vercel
vercel
```

**Option 3: GitHub Integration**
1. Push code to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-deploys on every push

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Developed using [v0 by Vercel](https://v0.dev/)
cd "c:\Users\MY-PC\Desktop\soil-productivity-prediction\backend"; .\start_backend.bat
Columns (தரவு நெடுவரிசைகள்):

N - Nitrogen (நைட்ரஜன்)
P - Phosphorus (பாஸ்பரஸ்)
K - Potassium (பொட்டாசியம்)
pH - Soil pH (மண் அமிலத்தன்மை)
OC - Organic Carbon (கரிம கரிமம்)
EC - Electrical Conductivity (மின் கடத்துதிறன்)
S - Sulphur (சல்பர்)
Zn - Zinc (துத்தம்)
Fe - Iron (இரும்பு)
Cu - Copper (செம்பு)
Mn - Manganese (மாங்கனீஸ்)
B - Boron (போரான்)
Moisture - Soil Moisture (மண் ஈரப்பதம்)
Temp - Temperature (வெப்பநிலை)
Humidity - Humidity (ஈரப்பதம்)
Rainfall - Rainfall (மழை