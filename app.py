from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) to allow requests from the browser
CORS(app)

# A dictionary to store the most recent sensor data
sensor_data = {
    "temperature": 0,
    "humidity": 0,
    "light": 0,
    "noise": 0,
    "co2": 0
}

# Route for the main dashboard page
@app.route('/')
def index():
    """Renders the main dashboard HTML page."""
    # Flask's render_template function looks in the 'templates' folder
    return render_template('dashboard.html')

# Route for the ESP32 to send data to
@app.route('/update-sensor', methods=['POST'])
def update_sensor():
    """Receives sensor data from the ESP32 via a POST request."""
    data = request.get_json()
    if not data:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400

    # Update the global sensor_data dictionary with new values
    for key in sensor_data.keys():
        if key in data:
            sensor_data[key] = data[key]

    print(f"Received data: {sensor_data}") # Log received data to the console
    return jsonify({"status": "success", "message": "Data received"}), 200

# Route for the dashboard's JavaScript to fetch data from
@app.route('/sensor-data')
def get_sensor_data():
    """Provides the latest sensor data to the frontend."""
    return jsonify(sensor_data)

# Run the app
if __name__ == '__main__':
    # Running on 0.0.0.0 makes the server accessible from other devices on your network
    app.run(host='0.0.0.0', port=5000, debug=True)
