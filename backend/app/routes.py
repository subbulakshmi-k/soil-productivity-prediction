from flask import Blueprint, jsonify, request, current_app
import os
import pandas as pd
from werkzeug.utils import secure_filename
import joblib
import numpy as np
from datetime import datetime
import json
import traceback

# Create a Blueprint
main = Blueprint('main', __name__)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'soil_model.pkl')
model = None

def load_model(force_reload=False):
    """Load the ML model, creating it if it doesn't exist"""
    global model
    if model is not None and not force_reload:
        return model
    
    try:
        # Ensure models directory exists
        models_dir = os.path.dirname(MODEL_PATH)
        os.makedirs(models_dir, exist_ok=True)
        
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print(f"✓ Model loaded successfully from {MODEL_PATH}")
        else:
            print(f"⚠ Model not found at {MODEL_PATH}")
            print("  Training new model...")
            # Import and train model
            backend_dir = os.path.dirname(os.path.dirname(__file__))
            train_model_path = os.path.join(backend_dir, 'train_model.py')
            
            if os.path.exists(train_model_path):
                import importlib.util
                spec = importlib.util.spec_from_file_location("train_model", train_model_path)
                if spec is not None and spec.loader is not None:
                    train_module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(train_module)
                    train_module.train_soil_model()
                    
                    if os.path.exists(MODEL_PATH):
                        model = joblib.load(MODEL_PATH)
                        print(f"✓ New model trained and loaded successfully!")
                    else:
                        raise Exception("Model training completed but file not found")
                else:
                    raise Exception(f"Could not load module spec from {train_model_path}")
            else:
                raise FileNotFoundError(f"train_model.py not found at {train_model_path}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print(traceback.format_exc())
        model = None
    
    return model

# Try to load model on startup
load_model()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@main.route('/')
def index():
    return "Welcome to Soil Productivity Prediction API!"

@main.route('/api/health', methods=['GET'])
def health_check():
    # Try to reload model if not loaded
    current_model = load_model()
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Soil Productivity Prediction API',
        'model_loaded': current_model is not None,
        'version': '1.0.0'
    }), 200

def preprocess_input(data):
    # Enhanced column mapping for flexibility
    column_mapping = {
        # Basic nutrients
        'N': 'nitrogen',
        'n': 'nitrogen', 
        'nitrogen': 'nitrogen',
        
        'P': 'phosphorus',
        'p': 'phosphorus',
        'phosphorus': 'phosphorus',
        
        'K': 'potassium',
        'k': 'potassium',
        'potassium': 'potassium',
        
        # Soil properties
        'pH': 'ph',
        'ph': 'ph',
        'ph_value': 'ph',
        'acidity': 'ph',
        
        # Organic matter
        'OC': 'organic_matter',
        'oc': 'organic_matter',
        'organic_carbon': 'organic_matter',
        
        # Environmental factors
        'Moisture': 'moisture',
        'moisture': 'moisture',
        'soil_moisture': 'moisture',
        'soilmoisture': 'moisture',
        'water_content': 'moisture',
        'watercontent': 'moisture',
        
        'Temp': 'temperature',
        'temp': 'temperature',
        'Temperature': 'temperature',  # Added for Excel files with capital T
        'temperature': 'temperature',
        'soil_temp': 'temperature',
        'soiltemp': 'temperature',
        
        # Electrical conductivity
        'EC': 'electricalConductivity',
        'ec': 'electricalConductivity',
        'electrical_conductivity': 'electricalConductivity',
        'conductivity': 'electricalConductivity',
        
        # Micronutrients
        'S': 'sulphur',
        's': 'sulphur',
        'sulphur': 'sulphur',
        'sulfur': 'sulphur',
        
        'Zn': 'zinc',
        'zn': 'zinc',
        'zinc': 'zinc',
        
        'Fe': 'iron',
        'fe': 'iron',
        'iron': 'iron',
        
        'Cu': 'copper',
        'cu': 'copper',
        'copper': 'copper',
        
        'Mn': 'manganese',
        'mn': 'manganese',
        'manganese': 'manganese',
        
        'B': 'boron',
        'b': 'boron',
        'boron': 'boron',
        
        # Humidity and Rainfall
        'Humidity': 'humidity',
        'humidity': 'humidity',
        'relative_humidity': 'humidity',
        
        'Rainfall': 'rainfall',
        'rain': 'rainfall',
        'precipitation': 'rainfall',
        
        # Soil type - Enhanced mapping for Excel files
        'soil_type': 'soilType',
        'soiltype': 'soilType',
        'texture': 'soilType',
        'soil type': 'soilType',
        'Soil Type': 'soilType',
        'soil': 'soilType',
        'Soil': 'soilType',
        'soil_classification': 'soilType',
        'soil_class': 'soilType',
        'SOIL_TYPE': 'soilType',
        'SOILTYPE': 'soilType',
        'SOIL TYPE': 'soilType',
        
        # Location
        'location': 'location',
        'site': 'location',
        'plot': 'location',
    }
    
    # Apply column mapping
    if isinstance(data, dict):
        mapped_data = {}
        for col, value in data.items():
            mapped_col = column_mapping.get(col, col)
            mapped_data[mapped_col] = value
        data = mapped_data
    else:
        # For DataFrames, rename columns
        data = data.copy()
        rename_dict = {col: column_mapping[col] for col in data.columns if col in column_mapping}
        if rename_dict:
            data = data.rename(columns=rename_dict)
    
    required_columns = ['nitrogen', 'phosphorus', 'potassium', 'ph', 
                       'organic_matter', 'electricalConductivity', 'sulphur', 'zinc', 'iron', 'copper', 'manganese', 'boron', 'moisture', 'temperature', 'humidity', 'rainfall']
    
    # Optional columns that may be present
    optional_columns = ['soilType']
    
    if isinstance(data, dict):
        missing_columns = [col for col in required_columns if col not in data]
        if missing_columns:
            raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
        df = pd.DataFrame([data])
    else:
        missing_columns = [col for col in required_columns if col not in data.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns in the file: {', '.join(missing_columns)}. Found columns: {', '.join(data.columns.tolist())}")
        
        # Include required columns plus optional columns for model prediction
        final_columns = required_columns.copy()
        # Add soilType if present (now included in trained model)
        if 'soilType' in data.columns:
            final_columns.append('soilType')
        df = data[final_columns].copy()
    
    for col in required_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Handle soilType as categorical feature
    # Always get the model features to ensure all soil type columns are present
    current_model = load_model()
    if current_model is None:
        raise ValueError("Model not loaded. Cannot process features.")
    
    model_features = current_model.feature_names_in_
    soil_type_features = [feat for feat in model_features if feat.startswith('soilType_')]
    
    # Preserve original soil type information before encoding
    original_soil_types = None
    if 'soilType' in df.columns:
        original_soil_types = df['soilType'].copy()
        
        # One-hot encode soilType for model prediction
        df = pd.get_dummies(df, columns=['soilType'], prefix='soilType')
        
        # Ensure all soil type columns from training are present
        for soil_feature in soil_type_features:
            if soil_feature not in df.columns:
                df[soil_feature] = 0
        
        # Remove any soil type columns that weren't in training
        soil_type_columns = [col for col in df.columns if col.startswith('soilType_')]
        for col in soil_type_columns:
            if col not in soil_type_features:
                df = df.drop(columns=[col])
    else:
        # If no soilType column in data, add all soil type columns as 0
        for soil_feature in soil_type_features:
            df[soil_feature] = 0
    
    # Reorder columns to match training order exactly
    df = df[model_features]
    
    # Store the original soil types as an attribute for later use
    if original_soil_types is not None:
        df.attrs['original_soil_types'] = original_soil_types
    
    # Check for null values in required columns only (exclude one-hot encoded soilType columns)
    columns_to_check = [col for col in df.columns if not col.startswith('soilType_')]
    if isinstance(df, pd.DataFrame) and len(columns_to_check) > 0:
        if df[columns_to_check].isnull().values.any():
            raise ValueError("Input contains invalid or missing values")
    
    return df

@main.route('/api/reload-model', methods=['POST'])
def reload_model():
    """Force reload the model"""
    try:
        load_model(force_reload=True)
        return jsonify({'message': 'Model reloaded successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to reload model: {str(e)}'}), 500

@main.route('/api/predict', methods=['POST'])
def predict():
    current_model = load_model()
    if current_model is None:
        return jsonify({'error': 'Prediction model not loaded. Please train the model first.'}), 503
    
    try:
        print(f"Request method: {request.method}")
        print(f"Request files: {request.files}")
        print(f"Request JSON: {request.is_json}")
        
        if 'file' in request.files:
            file = request.files['file']
            file_filename = file.filename
            if not file_filename or file_filename == '':
                return jsonify({'error': 'No selected file'}), 400
                
            if not allowed_file(file_filename):
                return jsonify({'error': 'File type not allowed. Allowed types: CSV, XLS, XLSX'}), 400
            
            filename = secure_filename(file_filename)
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            try:
                # Debug: Print file info
                print(f"Processing file: {filename}")
                print(f"File path: {filepath}")
                print(f"File exists: {os.path.exists(filepath)}")
                print(f"File size: {os.path.getsize(filepath) if os.path.exists(filepath) else 'N/A'} bytes")
                
                # Read file based on extension
                if filename.endswith('.csv'):
                    data = pd.read_csv(filepath)
                elif filename.endswith(('.xlsx', '.xls')):
                    try:
                        data = pd.read_excel(filepath)
                    except ImportError as e:
                        if 'openpyxl' in str(e):
                            return jsonify({
                                "error": "Missing dependency 'openpyxl' for Excel file processing. "
                                        "Please install it using: pip install openpyxl. "
                                        "Alternatively, save your file as CSV format and upload again.",
                                "traceback": str(e)
                            }), 400
                        else:
                            raise e
                else:
                    return jsonify({
                        "error": f"Unsupported file format: {filename}. "
                                "Please upload CSV or Excel files (.xlsx, .xls)."
                    }), 400
                
                print(f"Data shape: {data.shape}")
                print(f"Data columns: {list(data.columns)}")
                print(f"Data empty: {data.empty}")
                
                # Check if soilType column exists
                if 'soilType' in data.columns:
                    print(f"Soil type values: {data['soilType'].head().tolist()}")
                else:
                    print("No soilType column found in data")
                    # Check for similar column names
                    similar_cols = [col for col in data.columns if 'soil' in col.lower() or 'type' in col.lower()]
                    if similar_cols:
                        print(f"Similar columns found: {similar_cols}")
                
                if data.empty:
                    return jsonify({'error': 'File is empty or could not be parsed'}), 400
                
                # Store original data with soil type
                original_data = data.copy()
                
                processed_data = preprocess_input(data)
                predictions = current_model.predict(processed_data).tolist()
                
                # Ensure predictions are within reasonable range (0-100)
                predictions = [max(0, min(100, float(p))) for p in predictions]
                
                # Create result DataFrame with original data plus predictions
                result = original_data.copy()
                result['productivityScore'] = predictions
                result['productivityClass'] = ['High' if p > 70 else 'Medium' if p > 40 else 'Low' for p in predictions]
                
                # Map column names back to frontend format
                frontend_mapping = {
                    'nitrogen': 'nitrogen',
                    'phosphorus': 'phosphorus', 
                    'potassium': 'potassium',
                    'ph': 'ph',
                    'organic_matter': 'organicCarbon',
                    'electricalConductivity': 'electricalConductivity',
                    'sulphur': 'sulphur',
                    'zinc': 'zinc',
                    'iron': 'iron',
                    'copper': 'copper',
                    'manganese': 'manganese',
                    'boron': 'boron',
                    'moisture': 'soilMoisture',
                    'temperature': 'temperature',
                    'humidity': 'humidity',
                    'rainfall': 'rainfall',
                    'soilType': 'soilType'
                }
                
                # Rename columns back to frontend format
                result = result.rename(columns={v: k for k, v in frontend_mapping.items() if k != v})
                
                # Convert to records, handling all data types
                result_dict = result.head(1000).to_dict(orient='records')
                
                # Debug: Check if soilType is in the result
                if result_dict and len(result_dict) > 0:
                    print(f"First record keys: {list(result_dict[0].keys())}")
                    if 'soilType' in result_dict[0]:
                        print(f"First record soilType: {result_dict[0]['soilType']}")
                    else:
                        print("soilType not found in first record")
                
                return jsonify({
                    'message': 'File processed successfully',
                    'data': result_dict,
                    'total_records': len(result),
                    'average_productivity': float(np.mean(predictions)),
                    'min_productivity': float(np.min(predictions)),
                    'max_productivity': float(np.max(predictions))
                }), 200
                
            except ValueError as e:
                return jsonify({'error': f'Data validation error: {str(e)}'}), 400
            except Exception as e:
                return jsonify({'error': f'Processing error: {str(e)}', 'traceback': traceback.format_exc()}), 500
            finally:
                if os.path.exists(filepath):
                    try:
                        os.remove(filepath)
                    except:
                        pass
                    
        elif request.is_json:
            json_data = request.get_json()
            
            # Handle both single object and array of objects
            if isinstance(json_data, list):
                # Multiple predictions
                try:
                    results = []
                    for item in json_data:
                        processed_data = preprocess_input(item)
                        prediction = current_model.predict(processed_data)[0]
                        prediction = max(0, min(100, float(prediction)))
                        results.append({
                            'input': item,
                            'productivity_score': prediction,
                            'productivity_level': 'High' if prediction > 70 else ('Medium' if prediction > 40 else 'Low')
                        })
                    
                    return jsonify({
                        'message': 'Batch prediction successful',
                        'results': results,
                        'count': len(results),
                        'average_productivity': float(np.mean([r['productivity_score'] for r in results]))
                    }), 200
                except Exception as e:
                    return jsonify({'error': str(e)}), 400
            else:
                # Single prediction
                try:
                    processed_data = preprocess_input(json_data)
                    prediction = current_model.predict(processed_data)[0]
                    prediction = max(0, min(100, float(prediction)))
                    
                    return jsonify({
                        'message': 'Prediction successful',
                        'input': json_data,
                        'productivity_score': prediction,
                        'productivity_level': 'High' if prediction > 70 else ('Medium' if prediction > 40 else 'Low')
                    }), 200
                except ValueError as e:
                    return jsonify({'error': f'Data validation error: {str(e)}'}), 400
                except Exception as e:
                    return jsonify({'error': str(e)}), 400
                
        return jsonify({'error': 'No valid input provided. Send JSON data or upload a file.'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}', 'traceback': traceback.format_exc()}), 500

@main.route('/api/soil-types', methods=['GET'])
def get_soil_types():
    soil_types = ["Loam", "Clay", "Sandy", "Silt", "Peat", "Chalk", "Gravel", "Sand", "Clay Loam", "Sandy Loam", "Silty Clay", "Sandy Clay", "Loamy Sand", "Silt Loam", "Peat Loam", "Chalky Loam", "Gravelly Loam", "Silty Loam", "Clay Sand", "Humus", "Compost", "Topsoil", "Subsoil", "Black Soil", "Red Soil", "Yellow Soil", "Alluvial Soil", "Laterite Soil", "Saline Soil", "Acidic Soil", "Alkaline Soil"]
    return jsonify(soil_types), 200

@main.route('/api/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    current_model = load_model()
    if current_model is None:
        return jsonify({'error': 'Model not loaded'}), 503
    
    try:
        model_type = type(current_model).__name__
        if hasattr(current_model, 'n_estimators'):
            n_estimators = current_model.n_estimators
        else:
            n_estimators = None
        
        return jsonify({
            'model_type': model_type,
            'n_estimators': n_estimators,
            'model_path': MODEL_PATH,
            'model_exists': os.path.exists(MODEL_PATH)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main.route('/api/model/retrain', methods=['POST'])
def retrain_model():
    """Retrain model (admin endpoint)"""
    try:
        import sys
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from train_model import train_soil_model
        
        train_soil_model()
        global model
        model = joblib.load(MODEL_PATH)
        
        return jsonify({
            'message': 'Model retrained successfully',
            'model_path': MODEL_PATH
        }), 200
    except Exception as e:
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500
