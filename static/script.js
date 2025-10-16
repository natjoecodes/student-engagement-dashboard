// --- DUMMY PIE CHART SETUP ---
const ctx = document.getElementById('engagementPie').getContext('2d');
const engagementPie = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Highly Engaged', 'Moderately Engaged', 'Disengaged'],
    datasets: [{
      data: [40, 35, 25], // Static dummy values
      backgroundColor: [
        '#a78bfa', // base purple
        '#c4b5fd', // lighter shade
        '#7c3aed'  // darker shade
      ],
      borderColor: '#0d1117',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#c9d1d9',
          font: {
            size: 14
          }
        }
      }
    }
  }
});

// --- REAL-TIME CLOCK ---
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format

  const clockElement = document.getElementById('realtime-clock');
  if (clockElement) {
    clockElement.innerHTML = `Time: <b>${hours}:${minutes}:${seconds} ${ampm}</b>`;
  }
}

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// --- FETCH SENSOR DATA FROM FLASK ---
async function fetchSensorData() {
  try {
    const response = await fetch('http://172.20.10.2:5000/sensor-data');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();

    // Update dashboard cards
    document.getElementById('tempValue').innerText = `${data.temperature.toFixed(1)} °C`;
    document.getElementById('humValue').innerText = `${data.humidity.toFixed(1)} %`;
    document.getElementById('noiseValue').innerText = `${data.noise}`;
    document.getElementById('lightValue').innerText = `${data.light}`;
    document.getElementById('co2Value').innerText = `${data.co2}`;

  } catch (err) {
    console.error("Error fetching sensor data:", err);
  }
}

// Fetch sensor data every 3 seconds
setInterval(fetchSensorData, 3000);
// Fetch once on page load
fetchSensorData();