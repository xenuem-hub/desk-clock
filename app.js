// ---------- Build tick marks and numbers ----------
function buildTicksAndNumbers() {
  const ticks = document.getElementById("ticks");
  const numbers = document.getElementById("numbers");
  if (!ticks || !numbers) return;

  ticks.innerHTML = "";
  numbers.innerHTML = "";

  // 60 tick marks
  for (let i = 0; i < 60; i++) {
    const t = document.createElement("div");
    const isHour = (i % 5 === 0);
    t.className = isHour ? "tick hour" : "tick";

    // Place tick so it sits near the rim.
    // We rotate around center, then translate upward.
    const deg = i * 6; // 360/60
    const radius = isHour ? 44 : 46; // percent of clock radius
    t.style.transform = `rotate(${deg}deg) translateY(-${radius}%)`;

    ticks.appendChild(t);
  }

  // 12 numbers
  for (let n = 1; n <= 12; n++) {
    const el = document.createElement("div");
    el.className = "num";
    el.textContent = String(n);

    // Angles: 12 at top => -90 degrees
    const angleDeg = (n * 30) - 90;
    const angleRad = angleDeg * (Math.PI / 180);

    // Position numbers using percentage of container.
    // 0.0 = center, 0.5 = edge. Tune for aesthetics.
    const r = 0.38;
    const x = 50 + (Math.cos(angleRad) * r * 100);
    const y = 50 + (Math.sin(angleRad) * r * 100);

    el.style.left = `${x}%`;
    el.style.top = `${y}%`;

    numbers.appendChild(el);
  }
}

buildTicksAndNumbers();
window.addEventListener("resize", buildTicksAndNumbers);

// ---------- Clock ----------
function updateClock() {
  const now = new Date();

  const sec = now.getSeconds();
  const min = now.getMinutes();
  const hr  = now.getHours() % 12;

  const secDeg = sec * 6;
  const minDeg = (min + sec / 60) * 6;
  const hrDeg  = (hr + min / 60) * 30;

  document.getElementById("secondHand").style.transform =
    `translateY(-50%) rotate(${secDeg}deg)`;
  document.getElementById("minuteHand").style.transform =
    `translateY(-50%) rotate(${minDeg}deg)`;
  document.getElementById("hourHand").style.transform =
    `translateY(-50%) rotate(${hrDeg}deg)`;

  document.getElementById("dateLine").textContent =
    now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

updateClock();
setInterval(updateClock, 250);

// ---------- Calendar ----------
let view = new Date();
view.setDate(1);

function renderCalendar() {
  const grid = document.getElementById("calGrid");
  const title = document.getElementById("calTitle");
  grid.innerHTML = "";

  const year = view.getFullYear();
  const month = view.getMonth();

  title.textContent = view.toLocaleDateString(undefined, { year: "numeric", month: "long" });

  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

  for (let i = 0; i < 42; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    const dayIndex = i - startDow + 1;

    let dayNum;
    if (dayIndex <= 0) {
      dayNum = prevMonthDays + dayIndex;
      cell.classList.add("out");
    } else if (dayIndex > daysInMonth) {
      dayNum = dayIndex - daysInMonth;
      cell.classList.add("out");
    } else {
      dayNum = dayIndex;
      if (isThisMonth && dayNum === today.getDate()) {
        cell.classList.add("today");
      }
    }

    cell.textContent = String(dayNum);
    grid.appendChild(cell);
  }
}

document.getElementById("prevBtn").addEventListener("click", () => {
  view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
  renderCalendar();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
  renderCalendar();
});

renderCalendar();
