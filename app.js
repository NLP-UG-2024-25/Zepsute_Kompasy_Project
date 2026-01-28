/* ===== GLOBAL STATE ===== */
let selectedDate = null;
let currentView = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() // 0–11
};

const el = {
  grid: document.getElementById("calendarGrid"),
  monthLabel: document.getElementById("monthLabel"),
  selectedDayLabel: document.getElementById("selectedDay"),
  releasesList: document.getElementById("releasesList"),
  lastUpdated: document.getElementById("lastUpdated"),
  dateInput: document.getElementById("dateInput"),
  monthSelect: document.getElementById("monthSelect"),
  yearSelect: document.getElementById("yearSelect"),
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

function updateMonthLabel() {
  if (el.monthLabel) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    el.monthLabel.textContent = `${monthNames[currentView.month]} ${currentView.year}`;
  }

  // Update selectors if they exist
  if (el.monthSelect) {
    el.monthSelect.value = currentView.month;
  }
  if (el.yearSelect) {
    el.yearSelect.value = currentView.year;
  }
}

function selectDateOnCalendar(dateStr) {
  // Remove previous selection
  [...el.grid.querySelectorAll(".day")].forEach(b => b.classList.remove("day--selected"));

  // Find and select the matching day
  [...el.grid.querySelectorAll(".day")].forEach(b => {
    const num = b.querySelector(".num")?.textContent;
    if (!num) return;
    const ds = `${currentView.year}-${pad2(currentView.month + 1)}-${pad2(parseInt(num))}`;
    if (ds === dateStr) {
      b.classList.add("day--selected");
    }
  });

  selectedDate = dateStr;
  setText(el.selectedDayLabel, `Selected: ${selectedDate}`);
  render();
}

function goToDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return;

  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // 0-indexed
  const day = parseInt(parts[2]);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return;
  if (month < 0 || month > 11) return;
  if (day < 1 || day > 31) return;

  // Update view to the date's month/year
  currentView.year = year;
  currentView.month = month;

  // Render the month and select the date
  renderMonth();
  selectDateOnCalendar(dateStr);
}

function renderMonth(){
  if (!el.grid) return;

  el.grid.innerHTML = "";

  const first = new Date(currentView.year, currentView.month, 1);
  const last = new Date(currentView.year, currentView.month + 1, 0);

  const startDay = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = last.getDate();

  updateMonthLabel();

  // empty cells before first day
  for (let i = 0; i < startDay; i++){
    const empty = document.createElement("button");
    empty.className = "day day--empty";
    empty.disabled = true;
    el.grid.appendChild(empty);
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad2(today.getMonth()+1)}-${pad2(today.getDate())}`;

  for (let d = 1; d <= daysInMonth; d++){
    const dateStr = `${currentView.year}-${pad2(currentView.month + 1)}-${pad2(d)}`;

    const btn = document.createElement("button");
    btn.className = "day";
    btn.innerHTML = `
      <div class="num">${d}</div>
      <div class="day__dot"></div>
    `;

    if (dateStr === todayStr){
      btn.classList.add("day--today");
    }

    if (dateStr === selectedDate) {
      btn.classList.add("day--selected");
    }

    btn.addEventListener("click", () => {
      selectDateOnCalendar(dateStr);

      // Update date input if exists
      if (el.dateInput) {
        el.dateInput.value = dateStr;
      }
    });

    el.grid.appendChild(btn);
  }
}

function prevMonth() {
  currentView.month--;
  if (currentView.month < 0){
    currentView.month = 11;
    currentView.year--;
  }
  selectedDate = null;
  setText(el.selectedDayLabel, "Pick a day in the calendar.");
  renderMonth();
  render();

  if (el.dateInput) {
    el.dateInput.value = "";
  }
}

function nextMonth() {
  currentView.month++;
  if (currentView.month > 11){
    currentView.month = 0;
    currentView.year++;
  }
  selectedDate = null;
  setText(el.selectedDayLabel, "Pick a day in the calendar.");
  renderMonth();
  render();

  if (el.dateInput) {
    el.dateInput.value = "";
  }
}

function goToToday() {
  const t = new Date();
  currentView.year = t.getFullYear();
  currentView.month = t.getMonth();
  const todayStr = `${t.getFullYear()}-${pad2(t.getMonth()+1)}-${pad2(t.getDate())}`;

  renderMonth();
  selectDateOnCalendar(todayStr);

  if (el.dateInput) {
    el.dateInput.value = todayStr;
  }
}

function setupNavigation() {
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const todayBtn = document.getElementById("todayBtn");

  if (prevBtn && !prevBtn.dataset.bound){
    prevBtn.dataset.bound = "1";
    prevBtn.addEventListener("click", prevMonth);
  }

  if (nextBtn && !nextBtn.dataset.bound){
    nextBtn.dataset.bound = "1";
    nextBtn.addEventListener("click", nextMonth);
  }

  if (todayBtn && !todayBtn.dataset.bound){
    todayBtn.dataset.bound = "1";
    todayBtn.addEventListener("click", goToToday);
  }
}

function setupDateInput() {
  // Re-get element in case DOM wasn't ready
  el.dateInput = document.getElementById("dateInput");

  if (el.dateInput && !el.dateInput.dataset.bound) {
    el.dateInput.dataset.bound = "1";

    el.dateInput.addEventListener("change", (e) => {
      const value = e.target.value;
      if (value) {
        goToDate(value);
      }
    });

    // Also handle Enter key
    el.dateInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const value = e.target.value;
        if (value) {
          goToDate(value);
        }
      }
    });
  }
}

function setupMonthYearSelectors() {
  el.monthSelect = document.getElementById("monthSelect");
  el.yearSelect = document.getElementById("yearSelect");

  if (el.monthSelect && !el.monthSelect.dataset.bound) {
    el.monthSelect.dataset.bound = "1";
    el.monthSelect.addEventListener("change", (e) => {
      currentView.month = parseInt(e.target.value);
      selectedDate = null;
      setText(el.selectedDayLabel, "Pick a day in the calendar.");
      renderMonth();
      render();
    });
  }

  if (el.yearSelect && !el.yearSelect.dataset.bound) {
    el.yearSelect.dataset.bound = "1";
    el.yearSelect.addEventListener("change", (e) => {
      currentView.year = parseInt(e.target.value);
      selectedDate = null;
      setText(el.selectedDayLabel, "Pick a day in the calendar.");
      renderMonth();
      render();
    });
  }
}

// ===== Month/Year Picker Modal =====
let modalYear = new Date().getFullYear();
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function openMonthPicker() {
  const modal = document.getElementById('monthPickerModal');
  if (!modal) return;

  modalYear = currentView.year;
  renderMonthPicker();
  modal.classList.add('active');
}

function closeMonthPicker() {
  const modal = document.getElementById('monthPickerModal');
  if (modal) modal.classList.remove('active');
}

function renderMonthPicker() {
  const yearLabel = document.getElementById('modalYear');
  const monthGrid = document.getElementById('monthGrid');

  if (yearLabel) yearLabel.textContent = modalYear;

  if (monthGrid) {
    monthGrid.innerHTML = '';
    monthNames.forEach((name, index) => {
      const btn = document.createElement('button');
      btn.className = 'month-btn';
      btn.textContent = name;

      // Highlight current selection
      if (modalYear === currentView.year && index === currentView.month) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        currentView.year = modalYear;
        currentView.month = index;
        selectedDate = null;
        setText(el.selectedDayLabel, "Pick a day in the calendar.");
        renderMonth();
        render();
        closeMonthPicker();
      });

      monthGrid.appendChild(btn);
    });
  }
}

function setupMonthPicker() {
  const monthLabel = document.getElementById('monthLabel');
  const closeBtn = document.getElementById('closeModalBtn');
  const prevYearBtn = document.getElementById('prevYearBtn');
  const nextYearBtn = document.getElementById('nextYearBtn');
  const modal = document.getElementById('monthPickerModal');

  if (monthLabel && !monthLabel.dataset.modalBound) {
    monthLabel.dataset.modalBound = '1';
    monthLabel.addEventListener('click', openMonthPicker);
  }

  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.dataset.bound = '1';
    closeBtn.addEventListener('click', closeMonthPicker);
  }

  if (prevYearBtn && !prevYearBtn.dataset.bound) {
    prevYearBtn.dataset.bound = '1';
    prevYearBtn.addEventListener('click', () => {
      modalYear--;
      renderMonthPicker();
    });
  }

  if (nextYearBtn && !nextYearBtn.dataset.bound) {
    nextYearBtn.dataset.bound = '1';
    nextYearBtn.addEventListener('click', () => {
      modalYear++;
      renderMonthPicker();
    });
  }

  // Close modal when clicking overlay
  if (modal && !modal.dataset.bound) {
    modal.dataset.bound = '1';
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeMonthPicker();
      }
    });
  }
}

function maybeBuildSimpleCalendar(){
  if (!el.grid) return;

  setupNavigation();
  setupDateInput();
  setupMonthYearSelectors();
  setupMonthPicker();
  renderMonth();
}


document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  setText(el.lastUpdated, now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  maybeBuildSimpleCalendar();
  render();
});

// ===== Theme toggle (Dark/Light) =====
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
