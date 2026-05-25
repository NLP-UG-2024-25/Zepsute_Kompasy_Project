/* ===== GLOBAL STATE ===== */
let selectedDate = null;
let currentView = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() // 0–11
};
let releasesData = {}; // { "2026-05-23": [ {title, artist, type, ...}, ... ] }

const el = {
  grid: document.getElementById("calendarGrid"),
  monthLabel: document.getElementById("monthLabel"),
  selectedDayLabel: document.getElementById("selectedDay"),
  releasesList: document.getElementById("releasesList"),
  lastUpdated: document.getElementById("lastUpdated"),
  dateInput: document.getElementById("dateInput"),
  monthSelect: document.getElementById("monthSelect"),
  yearSelect: document.getElementById("yearSelect"),
  searchInput: document.getElementById("searchInput")
};


function pad2(n){ return String(n).padStart(2, "0"); }

function setText(node, text){
  if (node) node.textContent = text;
}


function getReleases(date) {
  if (!date) return [];
  return releasesData[date] || [];
}

async function loadReleases() {
  try {
    const res = await fetch('data/releases.json');
    if (!res.ok) return;
    const json = await res.json();
    releasesData = json.by_date || {};
    if (el.lastUpdated && json.fetched_at) {
      const d = new Date(json.fetched_at);
      setText(el.lastUpdated, d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    renderMonth();
    render();
  } catch (e) {
    // No data file yet — keep empty state
  }
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

  const releases = getReleases(selectedDate);

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
    div.dataset.type = r.type || "album";
    div.dataset.genres = (r.genres || []).join(',').toLowerCase();

    if (r.image) {
      const img = document.createElement("img");
      img.src = r.image;
      img.alt = "";
      img.className = "release__img";
      div.appendChild(img);
    }

    const body = document.createElement("div");
    body.className = "release__body";

    const title = document.createElement("div");
    title.className = "release__title";
    title.textContent = r.title;
    body.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "release__meta";
    meta.textContent = `${r.artist} • ${r.type}${r.total_tracks ? ' • ' + r.total_tracks + ' tracks' : ''}`;
    body.appendChild(meta);

    if (r.url) {
      const link = document.createElement("a");
      link.href = r.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.className = "release__link";
      link.textContent = "Open in Spotify";
      body.appendChild(link);
    }

    div.appendChild(body);
    el.releasesList.appendChild(div);
  });
  applyFilters();
}

function updateMonthLabel() {
  if (el.monthLabel) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    el.monthLabel.textContent = `${monthNames[currentView.month]} ${currentView.year}`;
  }

  
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

  
  currentView.year = year;
  currentView.month = month;

 
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
    const dayReleases = releasesData[dateStr] || [];
    const count = dayReleases.length;

    const btn = document.createElement("button");
    btn.className = "day";

    const numDiv = document.createElement("div");
    numDiv.className = "num";
    numDiv.textContent = d;
    btn.appendChild(numDiv);

    if (count > 0) {
      const dotsDiv = document.createElement("div");
      dotsDiv.className = "day__dots-container";
      const dotCount = count <= 3 ? 1 : count <= 10 ? 2 : 3;
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement("span");
        dot.className = "dot" + (dotCount === 3 ? " dot--high" : "");
        dotsDiv.appendChild(dot);
      }
      btn.appendChild(dotsDiv);
    }

    if (dateStr === todayStr){
      btn.classList.add("day--today");
    }

    if (dateStr === selectedDate) {
      btn.classList.add("day--selected");
    }

    btn.addEventListener("click", () => {
      selectDateOnCalendar(dateStr);

     
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
  setText(el.lastUpdated, "Loading...");

  maybeBuildSimpleCalendar();
  render();
  loadReleases();
});


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

let selectedType = "all";
let selectedGenre = "all";

function setupFilters() {
  const genreChips = document.querySelectorAll("#genreChips .chip");
  const typeChips = document.querySelectorAll("#typeChips .chip");

  genreChips.forEach(chip => {
    chip.addEventListener("click", () => {
      genreChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      selectedGenre = chip.dataset.genre;
      applyFilters();
    });
  });

  typeChips.forEach(chip => {
    chip.addEventListener("click", () => {
      typeChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      selectedType = chip.dataset.type;
      applyFilters();
    });
  });

  if (el.searchInput) {
    el.searchInput.addEventListener("input", applyFilters);
  }
}

function applyFilters() {
  const releases = document.querySelectorAll(".release");
  const searchQuery = el.searchInput ? el.searchInput.value.toLowerCase().trim() : "";

  releases.forEach(release => {
    const type = release.dataset.type;
    const genres = release.dataset.genres || "";
    let visible = true;

    if (selectedType !== "all" && type !== selectedType) visible = false;
        
    if (searchQuery !== "") {
      const titleElement = release.querySelector('.release__title');
      const metaElement = release.querySelector('.release__meta');
      
      const titleText = titleElement ? titleElement.textContent.toLowerCase() : "";
      const metaText = metaElement ? metaElement.textContent.toLowerCase() : "";
      if (!titleText.includes(searchQuery) && !metaText.includes(searchQuery)) {
        visible = false;
      }
    }

    release.style.display = visible ? "flex" : "none";
  });
}

document.addEventListener("DOMContentLoaded", setupFilters);


document.addEventListener("DOMContentLoaded", setupFilters);

