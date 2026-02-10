# Custom Dataset Guide

This guide explains how to use your own soil dataset with the Soil Productivity Prediction application.

## Supported Column Names

The application automatically recognizes various column naming conventions. Here are the supported columns:

### 📊 **Expected Columns**
- **Nitrogen**: `n`, `nitrogen`
- **Phosphorus**: `p`, `phosphorus` 
- **Potassium**: `k`, `potassium`
- **pH**: `ph`, `ph_value`, `acidity`
- **Organic Carbon**: `oc`, `organic_carbon`, `organic_matter`
- **Electrical Conductivity**: `ec`, `electrical_conductivity`, `conductivity`
- **Sulphur**: `s`, `sulphur`, `sulfur`
- **Zinc**: `zn`, `zinc`
- **Iron**: `fe`, `iron`
- **Copper**: `cu`, `copper`
- **Manganese**: `mn`, `manganese`
- **Boron**: `b`, `boron`
- **Moisture**: `moisture`, `soil_moisture`, `water_content`
- **Temperature**: `temp`, `temperature`, `soil_temp`
- **Humidity**: `humidity`, `relative_humidity`
- **Rainfall**: `rainfall`, `rain`, `precipitation`
- **Productivity Score**: `productivity`, `productivity_score`, `yield`, `crop_yield`

### 🏷️ **Additional Fields (Optional)**
- **Soil Type**: `soil_type`, `soiltype`, `texture`
- **Location**: `location`, `site`, `plot`

## File Format

### CSV Format
```csv
nitrogen,phosphorus,potassium,ph,organic_carbon,soil_moisture,temperature
150,30,200,6.5,2.0,45,25
180,35,220,7.0,2.5,50,28
120,25,180,6.2,1.8,40,22
```

### Excel Format (.xlsx, .xls)
Same column structure as CSV, but in Excel format.

## How to Upload

1. **Prepare your dataset** with the supported column names
2. **Save as CSV or Excel** format
3. **Drag and drop** the file onto the upload area
4. **Check the console** for column mapping information
5. **Review the results** after processing

## What Happens During Upload

1. **Column Detection**: The app automatically detects and maps your columns
2. **Data Validation**: Invalid or missing values are handled with intelligent defaults
3. **Processing**: Uses ML model if backend is available, otherwise client-side processing
4. **Results**: Shows statistics and visualizations of your soil data

## Default Values for Missing Data

If some columns are missing in your dataset, the app uses these agricultural standards:

- **Nitrogen**: 0 kg/ha
- **Phosphorus**: 0 kg/ha  
- **Potassium**: 0 kg/ha
- **pH**: 6.5 (neutral)
- **Organic Carbon**: 0.5%
- **Electrical Conductivity**: 1.0 dS/m
- **Soil Moisture**: 60%
- **Temperature**: 25°C
- **Humidity**: 50%
- **Rainfall**: 100mm

## Tips for Best Results

✅ **Use consistent column names** from the supported list  
✅ **Ensure numeric values** for measurement columns  
✅ **Remove extra headers** or empty rows  
✅ **Check data quality** before uploading  
✅ **Start with a small dataset** to test the mapping  

## Example Datasets

### Minimal Dataset (Basic nutrients only)
```csv
n,p,k,ph
150,30,200,6.5
180,35,220,7.0
```

### Complete Dataset
```csv
nitrogen,phosphorus,potassium,ph,organic_carbon,electrical_conductivity,sulphur,zinc,iron,copper,manganese,boron,soil_moisture,temperature,humidity,rainfall,soil_type,location
150,30,200,6.5,2.0,1.2,10,2.5,5.0,1.2,3.0,0.5,45,25,60,120,Loam,Field_A
180,35,220,7.0,2.5,1.5,12,3.0,6.0,1.5,3.5,0.8,50,28,65,150,Clay Loam,Field_B
200,40,180,6.8,2.2,1.3,11,2.8,5.5,1.3,3.2,0.6,48,26,62,140,Sandy Loam,Field_C
220,45,190,6.7,2.1,1.4,10.5,2.6,5.2,1.4,3.1,0.7,46,27,61,130,Black Soil,Field_D
```

## Troubleshooting

### Issues with Column Mapping
- Check console logs for detected columns
- Verify column names match the supported list
- Ensure no extra spaces in column names

### Data Processing Errors
- Check for non-numeric values in numeric columns
- Verify file format is correct (CSV/Excel)
- Remove any special characters in headers

### Performance Issues
- Use smaller datasets for testing
- Ensure backend server is running for ML predictions
- Check network connection if using remote backend

## Need Help?

If your dataset has unique column names or needs special handling:
1. Check the console logs for column detection results
2. Review the mapping in the browser developer tools
3. Consider renaming columns to match supported conventions
4. Contact support for custom mapping requirements
