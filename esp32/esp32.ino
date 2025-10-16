#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22

#define MQ135_PIN 34
#define LDR_PIN 35
#define KY037_PIN 32

const char* ssid = "Nat Joe";
const char* password = "Nathan@6451";
const String serverName = "http://172.20.10.2:5000/update-sensor"; // Your PC IP

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int airQuality = analogRead(MQ135_PIN);
    int lightLevel = analogRead(LDR_PIN);
    int soundLevel = analogRead(KY037_PIN);

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read DHT sensor!");
      delay(2000);
      return;
    }

    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // JSON keys must match Flask sensor_data keys
    String jsonData = "{\"temperature\":" + String(temperature, 2) +
                      ",\"humidity\":" + String(humidity, 2) +
                      ",\"light\":" + String(lightLevel) +
                      ",\"noise\":" + String(soundLevel) +
                      ",\"co2\":" + String(airQuality) + "}";

    int httpResponseCode = http.POST(jsonData);
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  delay(5000); // send every 5 seconds
}