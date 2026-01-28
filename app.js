/* ===== GLOBAL STATE ===== */
let selectedDate = null;

const el = {
  grid: document.getElementById("calendarGrid"),
  monthLabel: document.getElementById("monthLabel"),
  selectedDayLabel: document.getElementById("selectedDay"),
  releasesList: document.getElementById("releasesList"),
  lastUpdated: document.getElementById("lastUpdated"),
};


function pad2(n){ return String(n).padStart(2, "0"); }

function setText(node, text){
  if (node) node.textContent = text;
}


function getDemoReleases(date){
  if (!date) return [];
  return [
    { title: "New Album", artist: "Demo Artist", type: "Album" },
    { title: "Fresh Single", artist: "Another Artist", type: "Single" },
    { title: "EP Drop", artist: "SoundCalendar", type: "EP" },
  ];
}

function render(){
  if (!el.releasesList) return;

  el.releasesList.innerHTML = "";

  if (!selectedDate){
    el.releasesList.innerHTML = `
      <div class="emptyState">
        Pick a day in the calendar to see releases.
      </div>
    `;
    return;
  }

  const releases = getDemoReleases(selectedDate);

  if (!releases.length){
    el.releasesList.innerHTML = `
      <div class="emptyState">
        No releases for this day.
      </div>
    `;
    return;
  }

  releases.forEach(r => {
    const div = document.createElement("div");
    div.className = "release";
    div.innerHTML = `
      <div class="release__title">${r.title}</div>
      <div class="release__meta">${r.artist} • ${r.type}</div>
    `;
    el.releasesList.appendChild(div);
  });
}


function maybeBuildSimpleCalendar(){
  if (!el.grid) return;

  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const todayBtn = document.getElementById("todayBtn");

  let view = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() // 0–11
  };

  function renderMonth(){
    el.grid.innerHTML = "";

    const first = new Date(view.year, view.month, 1);
    const last = new Date(view.year, view.month + 1, 0);

    const startDay = (first.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = last.getDate();

    if (el.monthLabel){
      el.monthLabel.textContent = ${view.year}-${pad2(view.month + 1)};
    }

    // empty cells before first day
    for (let i = 0; i < startDay; i++){
      const empty = document.createElement("button");
      empty.className = "day";
      empty.disabled = true;
      el.grid.appendChild(empty);
    }

    const today = new Date();
    const todayStr = ${today.getFullYear()}-${pad2(today.getMonth()+1)}-${pad2(today.getDate())};

    for (let d = 1; d <= daysInMonth; d++){
      const dateStr = ${view.year}-${pad2(view.month + 1)}-${pad2(d)};

      const btn = document.createElement("button");
      btn.className = "day";
      btn.innerHTML = `
        <div class="num">${d}</div>
        <div class="day__dot"></div>
      `;

      if (dateStr === todayStr){
        btn.classList.add("day--today");
      }

      btn.addEventListener("click", () => {
        [...el.grid.querySelectorAll(".day")].forEach(b => b.classList.remove("day--selected"));
        btn.classList.add("day--selected");

        selectedDate = dateStr;
        setText(el.selectedDayLabel, Selected: ${selectedDate});
        render();
      });

      el.grid.appendChild(btn);
    }
  }


  if (prevBtn && !prevBtn.dataset.bound){
    prevBtn.dataset.bound = "1";
    prevBtn.addEventListener("click", () => {
      view.month--;
      if (view.month < 0){
        view.month = 11;
        view.year--;
      }
      selectedDate = null;
      setText(el.selectedDayLabel, "Pick a day in the calendar.");
      renderMonth();
      render();
    });
  }

  if (nextBtn && !nextBtn.dataset.bound){
    nextBtn.dataset.bound = "1";
    nextBtn.addEventListener("click", () => {
      view.month++;
      if (view.month > 11){
        view.month = 0;
        view.year++;
      }
      selectedDate = null;
      setText(el.selectedDayLabel, "Pick a day in the calendar.");
      renderMonth();
      render();
    });
  }

  if (todayBtn && !todayBtn.dataset.bound){
    todayBtn.dataset.bound = "1";
    todayBtn.addEventListener("click", () => {
      const t = new Date();
      view.year = t.getFullYear();
      view.month = t.getMonth();
      selectedDate = ${t.getFullYear()}-${pad2(t.getMonth()+1)}-${pad2(t.getDate())};

      renderMonth();

      // mark today as selected
      [...el.grid.querySelectorAll(".day")].forEach(b => {
        const num = b.querySelector(".num")?.textContent;
        if (!num) return;
        const ds = ${view.year}-${pad2(view.month+1)}-${pad2(num)};
        if (ds === selectedDate) b.classList.add("day--selected");
      });

      setText(el.selectedDayLabel, Selected: ${selectedDate});
      render();
    });
  }

  renderMonth();
}


document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  setText(el.lastUpdated, now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  maybeBuildSimpleCalendar();
  render();
});

// ===== Theme toggle (Dark/Light) – FIX after calendar changes =====
(function () {
  const btn = document.getElementById("themeToggle");
  const label = document.getElementById("themeLabel");
  if (!btn) return;

  const STORAGE_KEY = "sc_theme";
  const root = document.documentElement;

  function apply(theme) {
    const isLight = theme === "light";
    root.classList.toggle("theme-light", isLight);
    btn.setAttribute("aria-pressed", isLight ? "true" : "false");
    if (label) label.textContent = isLight ? "Light" : "Dark";
    const dot = btn.querySelector(".toggle__dot");
    if (dot) dot.style.transform = isLight ? "translateX(18px)" : "translateX(0)";
  }


  apply(localStorage.getItem(STORAGE_KEY) || "dark");

  btn.addEventListener("click", () => {
    const next = root.classList.contains("theme-light") ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  });
})();