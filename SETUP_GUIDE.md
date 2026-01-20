# Setup Guide - Soil Productivity Prediction System

This guide will help you set up and run the complete application.

## Quick Start

### Windows

1. **Start Backend:**
   ```bash
   cd backend
   start_backend.bat
   ```

2. **Start Frontend (in a new terminal):**
   ```bash
   npm run dev
   ```

3. **Or use the combined script:**
   ```bash
   start_dev.bat
   ```

### Linux/Mac

1. **Make scripts executable:**
   ```bash
   chmod +x start_dev.sh
   chmod +x backend/start_backend.sh
   ```

2. **Start everything:**
   ```bash
   ./start_dev.sh
   ```

## Detailed Setup

### Step 1: Install Node.js Dependencies

```bash
npm install
```

### Step 2: Set Up Python Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Train the ML Model

```bash
cd backend
python train_model.py
```

This creates `backend/models/soil_model.pkl`.

### Step 4: Verify Backend

```bash
# In backend directory with venv activated
python ../test_backend.py
```

Or manually test:
```bash
curl http://localhost:5000/api/health
```

### Step 5: Start the Application

**Option A: Separate Terminals**

Terminal 1 (Backend):
```bash
cd backend
python wsgi.py
```

Terminal 2 (Frontend):
```bash
npm run dev
```

**Option B: Use Startup Scripts**

Windows:
```bash
start_dev.bat
```

Linux/Mac:
```bash
./start_dev.sh
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## Verification Checklist

- [ ] Node.js dependencies installed (`npm install`)
- [ ] Python virtual environment created and activated
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] ML model trained (`python train_model.py`)
- [ ] Model file exists (`backend/models/soil_model.pkl`)
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/api/health
- [ ] Frontend shows "Connected to backend ML model"

## Troubleshooting

### Backend Issues

**Problem: Module not found errors**
```bash
# Solution: Ensure virtual environment is activated
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Problem: Model not found**
```bash
# Solution: Train the model
cd backend
python train_model.py
```

**Problem: Port 5000 already in use**
```bash
# Solution: Change port in backend/wsgi.py
# Or kill the process using port 5000
```

### Frontend Issues

**Problem: Cannot connect to backend**
- Check if backend is running on http://localhost:5000
- Verify `lib/api-config.ts` has correct URL
- Check browser console for CORS errors
- Ensure `.env` file has `NEXT_PUBLIC_API_URL=http://localhost:5000`

**Problem: npm install fails**
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Common Issues

**CORS Errors:**
- Backend has CORS enabled by default
- If issues persist, check `backend/app/__init__.py`

**Model Loading Errors:**
- Ensure model file exists: `backend/models/soil_model.pkl`
- Check file permissions
- Verify model was trained successfully

**Port Conflicts:**
- Backend: Change port in `backend/wsgi.py`
- Frontend: Change port with `npm run dev -- -p 3001`

## Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here
```

## Production Deployment

### Backend (using Gunicorn)

```bash
cd backend
source venv/bin/activate
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

### Frontend

```bash
npm run build
npm start
```

## Next Steps

1. Upload a CSV file with soil data
2. Run predictions
3. View visualizations
4. Explore clustering analysis
5. Review recommendations

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review error messages in console/logs
3. Verify all prerequisites are installed
4. Ensure all steps in setup guide are completed
