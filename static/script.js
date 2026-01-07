document.addEventListener("DOMContentLoaded", () => {
  // --- ATTENTION LEVEL LINE CHART ---
  let attentionChart;
  let attentionData = [];
  let timeLabels = [];
  let heatmapData = [];

  let sessionActive = false;
  let sessionPaused = false;
  let chartInterval = null;
  let sessionStartTime = null;
  let pausedAt = null;

  function initAttentionChart() {
    const canvas = document.getElementById("attentionChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    attentionChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: timeLabels,
        datasets: [{
          label: "Attentiveness (%)",
          data: attentionData,
          borderWidth: 2,
          tension: 0.35,
          fill: false
        }]
      },
      options: {
        animation: false,
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: "Attentiveness (%)" }
          },
          x: {
            title: { display: true, text: "Time (mm:ss)" }
          }
        }
      }
    });
  }

  function computeAttentiveness() {
    // Placeholder logic (replace with real model later)
    return Math.floor(60 + Math.random() * 30);
  }

  function startChartPlotting() {
    attentionData.length = 0;
    timeLabels.length = 0;
    attentionChart.update();
    heatmapData.length = 0;
    renderHeatmap(heatmapData);

    sessionStartTime = Date.now();
    sessionPaused = false;

    chartInterval = setInterval(() => {
      if (!sessionActive || sessionPaused) return;

      const elapsed = Date.now() - sessionStartTime;
      const min = String(Math.floor(elapsed / 60000)).padStart(2, "0");
      const sec = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");

      timeLabels.push(`${min}:${sec}`);
      const value = computeAttentiveness();
      attentionData.push(value);

      // Update heatmap with the same data source
      heatmapData.push(value);
      renderHeatmap(heatmapData);

      attentionChart.update();
    }, 5000);
  }

  function pauseChartPlotting() {
    sessionPaused = true;
    pausedAt = Date.now();
  }

  function resumeChartPlotting() {
    if (!sessionPaused) return;

    const pauseDuration = Date.now() - pausedAt;
    sessionStartTime += pauseDuration;
    sessionPaused = false;
  }

  function stopChartPlotting() {
    if (chartInterval) {
      clearInterval(chartInterval);
      chartInterval = null;
    }
    sessionActive = false;
    sessionPaused = false;
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

  // --- SESSION BUTTONS ---
  initAttentionChart();

  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stopBtn = document.getElementById("stopBtn");

  if (startBtn && pauseBtn && stopBtn) {

    startBtn.addEventListener("click", () => {
      if (sessionActive) return;

      sessionActive = true;
      startChartPlotting();
      console.log("Session started");
    });

    pauseBtn.addEventListener("click", () => {
      if (!sessionActive) return;

      if (!sessionPaused) {
        pauseChartPlotting();
        pauseBtn.textContent = "Resume";
        console.log("Session paused");
      } else {
        resumeChartPlotting();
        pauseBtn.textContent = "Pause";
        console.log("Session resumed");
      }
    });

    stopBtn.addEventListener("click", () => {
      if (!sessionActive) return;

      stopChartPlotting();
      pauseBtn.textContent = "Pause";
      console.log("Session stopped");
    });
  }

  // --- INIT TIMETABLE LOGIC ---
  loadTimetableData().then(() => {
    updateNavbarFromTimetable();
    setInterval(updateNavbarFromTimetable, 60000); // update every minute
  });
});

// Heatmap

function renderHeatmap(data) {
  const grid = document.getElementById("heatmapGrid");
  grid.innerHTML = "";

  let peak = 0;
  let sum = 0;

  const computedStyle = window.getComputedStyle(grid);
  const columns = computedStyle.gridTemplateColumns;

  const columnCount =
    columns && columns !== "none"
      ? columns.split(" ").length
      : 12; // fallback to design default

  // Trim data to max 3 rows
  const maxCells = columnCount * 3;
  const trimmedData = data.slice(-maxCells);

  trimmedData.forEach(val => {
    peak = Math.max(peak, val);
    sum += val;

    const cell = document.createElement("div");
    cell.className = "heatmap-cell";

    if (val < 40) cell.style.background = "#1f2933";
    else if (val < 60) cell.style.background = "rgba(167,139,250,0.35)";
    else if (val < 80) cell.style.background = "rgba(167,139,250,0.65)";
    else cell.style.background = "#a78bfa";

    cell.title = `${val}% attentiveness`;
    grid.appendChild(cell);
  });

  document.getElementById("avgEng").textContent = Math.round(sum / trimmedData.length);
  document.getElementById("peakEng").textContent = peak;
}