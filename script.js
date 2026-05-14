const activityForm = document.getElementById('activityForm');
const activityDate = document.getElementById('activityDate');
const activityName = document.getElementById('activityName');
const activityNotes = document.getElementById('activityNotes');
const activityList = document.getElementById('activityList');
const totalCount = document.getElementById('totalCount');
const notesCount = document.getElementById('notesCount');
const streakCount = document.getElementById('streakCount');
const todayDisplay = document.getElementById('todayDisplay');
const themeToggle = document.getElementById('themeToggle');

const STORAGE_KEY = 'dailyActivities';

let activities = [];

// Format the current date to a human-readable label in the header.
function formatHeaderDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

// Load saved activities from localStorage and parse them safely.
function loadActivities() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Could not load stored activities:', error);
    return [];
  }
}

// Save the current activity list to localStorage.
function saveActivities() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

// Render the activity cards in the UI.
function renderActivities() {
  activityList.innerHTML = '';
  if (activities.length === 0) {
    activityList.innerHTML = '<p class="empty-state">No activities yet. Add one to start your streak.</p>';
    return;
  }

  activities.forEach((activity, index) => {
    const card = document.createElement('article');
    card.className = 'activity-card';
    card.innerHTML = `
      <div class="card-meta">
        <span class="card-date">${activity.date}</span>
        <button class="delete-btn" aria-label="Delete activity" data-index="${index}">✕</button>
      </div>
      <h3 class="card-title">${activity.title}</h3>
      <p class="card-notes">${activity.notes || 'No notes provided.'}</p>
    `;

    activityList.appendChild(card);
  });
}

// Update the progress summary metrics.
function refreshSummary() {
  const noteEntries = activities.filter((activity) => activity.notes && activity.notes.trim().length > 0).length;
  totalCount.textContent = activities.length.toString();
  notesCount.textContent = noteEntries.toString();
  streakCount.textContent = computeStreak() + ' days';
}

// Compute a simple streak based on consecutive days with activity.
function computeStreak() {
  if (activities.length === 0) return 0;

  const sorted = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 1;
  let currentDate = new Date(sorted[0].date);

  for (let i = 1; i < sorted.length; i += 1) {
    const nextDate = new Date(sorted[i].date);
    const diffDays = Math.round((currentDate - nextDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak += 1;
      currentDate = nextDate;
    } else if (diffDays === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

// Add a new activity from form input values.
function addActivity(event) {
  event.preventDefault();

  const title = activityName.value.trim();
  const date = activityDate.value;
  const notes = activityNotes.value.trim();

  if (!title || !date) return;

  activities.unshift({
    title,
    date,
    notes,
  });

  saveActivities();
  renderActivities();
  refreshSummary();
  activityForm.reset();
  activityDate.focus();
}

// Remove an activity by its index and refresh the UI.
function removeActivity(index) {
  activities.splice(index, 1);
  saveActivities();
  renderActivities();
  refreshSummary();
}

// Handle delete button clicks using event delegation.
function handleActivityClick(event) {
  const target = event.target;
  if (target.matches('.delete-btn')) {
    const index = Number(target.dataset.index);
    if (!Number.isNaN(index)) {
      removeActivity(index);
    }
  }
}

// Initialize theme from localStorage or system preference.
function initializeTheme() {
  const savedTheme = localStorage.getItem('themeMode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  if (activeTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️';
  } else {
    document.body.classList.remove('dark');
    themeToggle.textContent = '🌙';
  }
}

// Toggle theme and persist the user preference.
function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('themeMode', isDark ? 'dark' : 'light');
}

// Set the default date input to today for easier entry.
function setDefaultDate() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  activityDate.value = localDate.toISOString().split('T')[0];
}

// Run on page load to initialize data and attach event listeners.
function init() {
  todayDisplay.textContent = formatHeaderDate(new Date());
  initializeTheme();
  activities = loadActivities();
  renderActivities();
  refreshSummary();
  setDefaultDate();

  activityForm.addEventListener('submit', addActivity);
  activityList.addEventListener('click', handleActivityClick);
  themeToggle.addEventListener('click', toggleTheme);
}

init();
