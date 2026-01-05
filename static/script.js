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

// --- REAL-TIME DATE/TIME ---
function updateDateTime() {
  const now = new Date();

  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const date = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const el = document.getElementById("realtime-datetime");
  if (el) {
    el.textContent = `${date} · ${time}`;
  }
}

// --- TIMETABLE + FACULTY DATA ---
let timetableData = {};
let facultyData = {};

async function loadTimetableData() {
  try {
    const timetableRes = await fetch("/static/data/timetable.json");
    timetableData = await timetableRes.json();

    const facultyRes = await fetch("/static/data/faculty.json");
    facultyData = await facultyRes.json();
  } catch (err) {
    console.error("Error loading timetable data:", err);
  }
}

function getCurrentClassFromTimetable() {
  const now = new Date();
  const day = now.toLocaleDateString("en-GB", { weekday: "long" });
  const time = now.toTimeString().slice(0, 5); // HH:MM

  const todaySchedule = timetableData[day];
  if (!todaySchedule) {
    return { subject: "No Scheduled Class", faculty: "—" };
  }

  for (const slot of todaySchedule) {
    if (time >= slot.start && time < slot.end) {

      if (slot.type === "BREAK") {
        return { subject: slot.label, faculty: "—" };
      }

      const facultyNames = slot.faculty
        .map(code => facultyData[code] || code)
        .join(", ");

      return {
        subject: slot.subject,
        faculty: facultyNames
      };
    }
  }

  return { subject: "No Scheduled Class", faculty: "—" };
}

function updateNavbarFromTimetable() {
  const subjectEl = document.getElementById("subjectName");
  const facultyEl = document.getElementById("facultyName");

  if (!subjectEl || !facultyEl) return;

  const current = getCurrentClassFromTimetable();
  subjectEl.textContent = current.subject;
  facultyEl.textContent = current.faculty;
}

updateDateTime();
setInterval(updateDateTime, 1000);

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

// --- INIT TIMETABLE LOGIC ---
loadTimetableData().then(() => {
  updateNavbarFromTimetable();
  setInterval(updateNavbarFromTimetable, 60000); // update every minute
});
});