document.addEventListener("DOMContentLoaded", () => {
// --- DUMMY PIE CHART SETUP ---
const pieCanvas = document.getElementById('engagementPie');
if (pieCanvas) {
  const ctx = pieCanvas.getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Highly Engaged', 'Moderately Engaged', 'Disengaged'],
      datasets: [{
        data: [40, 35, 25],
        backgroundColor: ['#a78bfa', '#c4b5fd', '#7c3aed'],
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
            font: { size: 14 }
          }
        }
      }
    }
  });
}

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

  // --- LOGOUT CONFIRMATION MODAL ---
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const cancelLogout = document.getElementById("cancelLogout");
  const closeLogout = document.getElementById("closeLogout");

  function closeModal() {
    logoutModal.classList.remove("active");
    logoutBtn.focus();
  }

  if (logoutBtn && logoutModal && cancelLogout && closeLogout) {

    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutModal.classList.add("active");
    });

    cancelLogout.addEventListener("click", closeModal);
    closeLogout.addEventListener("click", closeModal);

    // ESC key support
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && logoutModal.classList.contains("active")) {
        closeModal();
      }
    });

    // Click outside modal closes it
    logoutModal.addEventListener("click", (e) => {
      if (e.target === logoutModal) {
        closeModal();
      }
    });
  }
});