// Optional: lock the calendar to a specific month for a “demo look”.
// Set DEMO = { year: 2017, monthIndex: 5 } for June 2017 (monthIndex is 0-11).
const DEMO = null;

// ---------- Build clock ticks + numbers ----------
function buildClockFace() {
  const ticks = document.getElementById("ticks");
  const numbers = document.getElementById("numbers");
  if (!ticks || !numbers) return;

  ticks.innerHTML = "";
  numbers.innerHTML = "";

  // 60 tick marks
  for (let i = 0; i < 60; i++) {
    const t = document.createElement("div");
    const isFive = (i % 5 === 0);
    const isQuarter = (i % 15 === 0);

    t.className = "tick" + (isFive ? " five" : "") + (isQuarter ? " quarter" : "");

    const deg = i * 6; // 360/60
    const radius = 47; // percent
    t.style.transform = `rotate(${deg}deg) translateY(-${radius}%)`;

    ticks.appendChild(t);
  }

  // 12 numbers
  for (let n = 1; n <= 12; n++) {
    const el = document.createElement("div");
    el.className = "num";
    el.textContent = String(n);

    // 12 at top => -90 degrees
    const angleDeg = (n * 30) - 90;
    const angleRad = angleDeg * (Math.PI / 180);

    // Position numbers similar to iOS clock
    const r = 0.40; // fraction of radius
    const x = 50 + (Math.cos(angleRad) * r * 100);
    const y = 50 + (Math.sin(angleRad) * r * 100);

    el.style.left = `${x}%`;
    el.style.top = `${y}%`;

    numbers.appendChild(el);
  }
}

buildClockFace();
window.addEventListener("resize", buildClockFace);

// ---------- Clock hands ----------
function updateClock() {
  const now = new Date();

  const sec = now.getSeconds();
  const min = now.getMinutes();
  const hr  = now.getHours() % 12;

  const secDeg = sec * 6;
  const minDeg = (min + sec / 60) * 6;
  const hrDeg  = (hr + min / 60) * 30;

  const hourHand = document.getElementById("hourHand");
  const minuteHand = document.getElementById("minuteHand");
  const secondHand = document.getElementById("secondHand");

  if (hourHand) hourHand.style.transform = `translateY(-50%) rotate(${hrDeg}deg)`;
  if (minuteHand) minuteHand.style.transform = `translateY(-50%) rotate(${minDeg}deg)`;
  if (secondHand) secondHand.style.transform = `translateY(-50%) rotate(${secDeg}deg)`;
}

updateClock();
setInterval(updateClock, 250);

// ---------- Calendar (StandBy-style month grid) ----------
function renderCalendar() {
  const monthTitle = document.getElementById("monthTitle");
  const calGrid = document.getElementById("calGrid");
  if (!monthTitle || !calGrid) return;

  const today = new Date();

  const base = DEMO
    ? new Date(DEMO.year, DEMO.monthIndex, 1)
    : new Date(today.getFullYear(), today.getMonth(), 1);

  const year = base.getFullYear();
  const month = base.getMonth();

  monthTitle.textContent = base.toLocaleDateString(undefined, { month: "long" }).toUpperCase();

  const first = new Date(year, month, 1);
  const startDow = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calGrid.innerHTML = "";

  // Fill a 6x7 grid (42 cells), like the image layout
  for (let i = 0; i < 42; i++) {
    const cell = document.createElement("div");
    cell.className = "dayCell";

    const dayNum = i - startDow + 1;

    if (dayNum <= 0 || dayNum > daysInMonth) {
      cell.classList.add("blank");
      cell.textContent = "0";
    } else {
      cell.textContent = String(dayNum);

      const isToday =
        !DEMO &&
        year === today.getFullYear() &&
        month === today.getMonth() &&
        dayNum === today.getDate();

      // If DEMO is enabled, highlight day 5 to mimic the sample image.
      const isDemoHighlight = !!DEMO && dayNum === 5;

      if (isToday || isDemoHighlight) {
        cell.classList.add("today");
      }
    }

    calGrid.appendChild(cell);
  }
}

renderCalendar();
