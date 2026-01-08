// ---------- Clock ----------
function updateClock() {
  const now = new Date();

  const sec = now.getSeconds();
  const min = now.getMinutes();
  const hr  = now.getHours() % 12;

  const secDeg = sec * 6;                       // 360 / 60
  const minDeg = (min + sec / 60) * 6;
  const hrDeg  = (hr + min / 60) * 30;          // 360 / 12

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
setInterval(updateClock, 250); // smooth enough, low cost

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
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

  // 6 rows * 7 days = 42 cells keeps layout stable in landscape.
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

// ---------- Wake Lock ----------
let wakeLock = null;
const wakeBtn = document.getElementById("wakeBtn");
const wakeStatus = document.getElementById("wakeStatus");

function setStatus(msg) {
  wakeStatus.textContent = msg;
}

async function requestWakeLock() {
  // Screen Wake Lock API requires a secure context (HTTPS) and user gesture.
  // It can be released when the page is hidden. Re-acquire on visibilitychange.
  try {
    if (!("wakeLock" in navigator)) {
      setStatus("Wake lock not supported here. Use Auto-Lock = Never as fallback.");
      return;
    }
    wakeLock = await navigator.wakeLock.request("screen");
    setStatus("Screen will stay awake while this page is open.");

    wakeLock.addEventListener("release", () => {
      setStatus("Wake lock released. Tap the button again if needed.");
      wakeLock = null;
    });
  } catch (err) {
    setStatus(`Wake lock failed: ${err?.name || "error"}.`);
  }
}

wakeBtn.addEventListener("click", requestWakeLock);

document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible" && wakeLock) {
    // Some browsers release wake lock when hidden.
    // Re-request if you still want it when returning.
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      setStatus("Screen will stay awake while this page is open.");
    } catch (err) {
      setStatus(`Wake lock re-request failed: ${err?.name || "error"}.`);
      wakeLock = null;
    }
  }
});
