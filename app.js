// Force US Eastern time regardless of the phone’s timezone.
// If you want “use my phone time”, set TIME_ZONE = null.
const TIME_ZONE = "America/New_York";

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function partsInTZ(date, timeZone) {
  const opts = timeZone
    ? { timeZone, year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short", hourCycle: "h23" }
    : { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short", hourCycle: "h23" };

  const dtf = new Intl.DateTimeFormat("en-US", opts);
  const p = dtf.formatToParts(date);

  const get = (type) => p.find(x => x.type === type)?.value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),     // 1-12
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
    weekday: get("weekday")          // "Mon", etc
  };
}

// Find a real Date instant whose formatted TZ date equals the requested Y-M-D.
// (Used only to get the correct weekday alignment for the calendar.)
function findInstantForTZDate(year, month1to12, day, timeZone) {
  // Start near midday UTC to avoid DST edge cases.
  let dt = new Date(Date.UTC(year, month1to12 - 1, day, 12, 0, 0));
  const targetKey = year * 10000 + month1to12 * 100 + day;

  for (let i = 0; i < 48; i++) {
    const p = partsInTZ(dt, timeZone);
    const key = p.year * 10000 + p.month * 100 + p.day;
    if (key === targetKey) return dt;

    // Move in the direction that brings the TZ date toward the target.
    if (key < targetKey) dt = new Date(dt.getTime() + 60 * 60 * 1000);
    else dt = new Date(dt.getTime() - 60 * 60 * 1000);
  }
  return dt;
}

// ---------- CLOCK FACE (SVG) ----------
function buildClockFace() {
  const tickGroup = document.getElementById("tickGroup");
  const numGroup = document.getElementById("numGroup");
  if (!tickGroup || !numGroup) return;

  tickGroup.innerHTML = "";
  numGroup.innerHTML = "";

  const cx = 100, cy = 100;

  // Ticks at the outer rim
  for (let i = 0; i < 60; i++) {
    const isMajor = (i % 5 === 0);
    const isQuarter = (i % 15 === 0);

    const outerR = 96;
    const innerR = isQuarter ? 84 : (isMajor ? 86 : 90);

    const ang = (i * 6 - 90) * Math.PI / 180;
    const x1 = cx + outerR * Math.cos(ang);
    const y1 = cy + outerR * Math.sin(ang);
    const x2 = cx + innerR * Math.cos(ang);
    const y2 = cy + innerR * Math.sin(ang);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1.toFixed(2));
    line.setAttribute("y1", y1.toFixed(2));
    line.setAttribute("x2", x2.toFixed(2));
    line.setAttribute("y2", y2.toFixed(2));
    line.setAttribute("class", isQuarter ? "tickQuarter" : (isMajor ? "tickMajor" : "tickMinor"));
    tickGroup.appendChild(line);
  }

  // Numbers 1–12
  for (let n = 1; n <= 12; n++) {
    const ang = (n * 30 - 90) * Math.PI / 180;
    const r = 70;
    const x = cx + r * Math.cos(ang);
    const y = cy + r * Math.sin(ang);

    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x.toFixed(2));
    t.setAttribute("y", y.toFixed(2));
    t.setAttribute("class", "clockNum");
    t.textContent = String(n);
    numGroup.appendChild(t);
  }
}

buildClockFace();

// ---------- CLOCK HANDS ----------
function setHand(id, angleDeg, length, backLength = 0) {
  const el = document.getElementById(id);
  if (!el) return;

  const cx = 100, cy = 100;
  const ang = (angleDeg - 90) * Math.PI / 180;

  const x2 = cx + length * Math.cos(ang);
  const y2 = cy + length * Math.sin(ang);

  const x1 = cx - backLength * Math.cos(ang);
  const y1 = cy - backLength * Math.sin(ang);

  el.setAttribute("x1", x1.toFixed(2));
  el.setAttribute("y1", y1.toFixed(2));
  el.setAttribute("x2", x2.toFixed(2));
  el.setAttribute("y2", y2.toFixed(2));
}

function updateClock() {
  const now = new Date();
  const p = partsInTZ(now, TIME_ZONE);

  const hr12 = p.hour % 12;
  const sec = p.second;
  const min = p.minute;

  const secDeg = sec * 6;
  const minDeg = (min + sec / 60) * 6;
  const hrDeg = (hr12 + min / 60 + sec / 3600) * 30;

  // Match StandBy proportions: hour shorter, minute longer, second longest
  setHand("hourHand", hrDeg, 34, 6);
  setHand("minuteHand", minDeg, 52, 8);
  setHand("secondHand", secDeg, 62, 10);
}

// Smooth updates without “trails” (SVG redraws cleanly)
updateClock();
setInterval(updateClock, 250);

// ---------- CALENDAR ----------
function renderCalendar() {
  const monthTitle = document.getElementById("monthTitle");
  const calGrid = document.getElementById("calGrid");
  if (!monthTitle || !calGrid) return;

  const now = new Date();
  const today = partsInTZ(now, TIME_ZONE);

  const year = today.year;
  const month1to12 = today.month;         // 1-12
  const monthIndex = month1to12 - 1;

  // Month title in Eastern time
  const monthName = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE || undefined,
    month: "long"
  }).format(now);

  monthTitle.textContent = monthName.toUpperCase();

  // Days in month
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  // Weekday of the 1st day in the target TZ
  const firstInstant = TIME_ZONE
    ? findInstantForTZDate(year, month1to12, 1, TIME_ZONE)
    : new Date(year, monthIndex, 1);

  const firstWk = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE || undefined,
    weekday: "short"
  }).format(firstInstant);

  const startDow = WEEKDAY_INDEX[firstWk] ?? 0; // 0=Sun

  calGrid.innerHTML = "";

  // 42 cells (6 rows) like StandBy
  for (let i = 0; i < 42; i++) {
    const dayNum = i - startDow + 1;

    const cell = document.createElement("div");
    cell.className = "dayCell";

    if (dayNum < 1 || dayNum > daysInMonth) {
      cell.classList.add("blank");
      cell.textContent = ""; // no zeros
    } else {
      cell.textContent = String(dayNum);

      if (dayNum === today.day) {
        cell.classList.add("today"); // orange highlight
      }
    }

    calGrid.appendChild(cell);
  }
}

renderCalendar();
