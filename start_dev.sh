#!/bin/bash

echo "Starting Soil Productivity Prediction Application..."
echo ""

# Start backend in background
echo "Starting backend server..."
cd backend
bash start_backend.sh &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
npm run dev

# Kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null
