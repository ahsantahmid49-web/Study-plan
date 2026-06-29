// script.js
// ===== StudyFlow Application =====

// ---------- Constants ----------
const QUOTES = [
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
  { text: "The mind is not a vessel to be filled but a fire to be kindled.", author: "Plutarch" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Develop a passion for learning. If you do, you will never cease to grow.", author: "Anthony J. D'Angelo" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "The only person who is educated is the one who has learned how to learn and change.", author: "Carl Rogers" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" }
];

const TIPS = [
  "Break your study sessions into 25-minute focused intervals with 5-minute breaks.",
  "Teach what you've learned to someone else — it reveals gaps in your understanding.",
  "Active recall is more effective than passive re-reading. Test yourself often.",
  "Spaced repetition beats cramming. Review material at increasing intervals.",
  "Sleep is when memories consolidate. Don't sacrifice it for late-night study.",
  "Exercise before studying boosts brain function and memory retention.",
  "Eliminate distractions: put your phone in another room while studying.",
  "Use mind maps to connect concepts visually.",
  "Study your most difficult subjects when your energy is highest.",
  "Take handwritten notes — they're processed more deeply than typed ones.",
  "The Feynman Technique: explain concepts in simple terms to identify gaps.",
  "Stay hydrated. Even mild dehydration impairs cognitive performance.",
  "Study in multiple short sessions rather than one long marathon.",
  "Use the 80/20 rule: focus on the 20% of material that yields 80% of results.",
  "Create a dedicated study space to signal your brain it's time to focus."
];

const ACHIEVEMENTS_DEF = [
  { id: 'first_session', name: 'First Step', desc: 'Complete your first study session', icon: 'fa-shoe-prints', check: d => d.sessions.length >= 1 },
  { id: 'five_sessions', name: 'Getting Started', desc: 'Complete 5 study sessions', icon: 'fa-seedling', check: d => d.sessions.length >= 5 },
  { id: 'ten_sessions', name: 'Building Momentum', desc: 'Complete 10 study sessions', icon: 'fa-leaf', check: d => d.sessions.length >= 10 },
  { id: 'five_hour_day', name: 'Powerhouse', desc: 'Study 5 hours in a single day', icon: 'fa-bolt', check: d => d.sessions.some(s => s.duration >= 300) || dailyHoursMax(d) >= 5 },
  { id: 'seven_day_streak', name: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: 'fa-shield-halved', check: d => d.streak.longest >= 7 },
  { id: 'thirty_day_streak', name: 'Unstoppable', desc: 'Maintain a 30-day streak', icon: 'fa-fire', check: d => d.streak.longest >= 30 },
  { id: 'hundred_hours', name: 'Century Scholar', desc: 'Study for 100 total hours', icon: 'fa-hourglass-half', check: d => totalHours(d) >= 100 },
  { id: 'all_tasks', name: 'Task Master', desc: 'Complete all tasks in a day', icon: 'fa-check-double', check: d => d.tasks.length >= 3 && d.tasks.every(t => t.completed) },
  { id: 'five_subjects', name: 'Polymath', desc: 'Create 5 study subjects', icon: 'fa-book-open', check: d => d.subjects.length >= 5 },
  { id: 'first_note', name: 'Note Taker', desc: 'Create your first note', icon: 'fa-pen', check: d => d.notes.length >= 1 },
  { id: 'ten_notes', name: 'Scholar', desc: 'Create 10 notes', icon: 'fa-feather', check: d => d.notes.length >= 10 },
  { id: 'flashcard_master', name: 'Card Master', desc: 'Create 20 flashcards', icon: 'fa-layer-group', check: d => d.flashcards.length >= 20 },
  { id: 'early_bird', name: 'Early Bird', desc: 'Study before 8 AM', icon: 'fa-mug-hot', check: d => d.sessions.some(s => new Date(s.date).getHours() < 8) },
  { id: 'night_owl', name: 'Night Owl', desc: 'Study after 10 PM', icon: 'fa-moon', check: d => d.sessions.some(s => new Date(s.date).getHours() >= 22) },
  { id: 'goal_crusher', name: 'Goal Crusher', desc: 'Complete 10 goals', icon: 'fa-bullseye', check: d => d.goals.filter(g => g.completed).length >= 10 }
];

const SUBJECT_ICONS = ['fa-book', 'fa-calculator', 'fa-flask', 'fa-atom', 'fa-dna', 'fa-microscope', 'fa-laptop-code', 'fa-language', 'fa-palette', 'fa-music', 'fa-earth-americas', 'fa-square-root-variable', 'fa-code', 'fa-brain', 'fa-heart-pulse', 'fa-landmark'];

const SUBJECT_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6', '#84cc16', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7', '#eab308'];

const DEFAULT_DATA = {
  subjects: [
    { id: 's1', name: 'Mathematics', color: '#10b981', icon: 'fa-square-root-variable', weeklyGoal: 10, totalHours: 0 },
    { id: 's2', name: 'Physics', color: '#0ea5e9', icon: 'fa-atom', weeklyGoal: 8, totalHours: 0 },
    { id: 's3', name: 'Computer Science', color: '#f59e0b', icon: 'fa-code', weeklyGoal: 12, totalHours: 0 }
  ],
  sessions: [],
  tasks: [],
  notes: [],
  calendarNotes: {},
  goals: [],
  flashcards: [
    { id: 'f1', front: 'What is the derivative of x²?', back: '2x', difficult: false },
    { id: 'f2', front: 'What does CPU stand for?', back: 'Central Processing Unit', difficult: false },
    { id: 'f3', front: "What is Newton's second law?", back: 'F = ma (Force = mass × acceleration)', difficult: true }
  ],
  achievements: [],
  streak: { current: 0, longest: 0, lastStudyDate: null, history: [] },
  settings: { theme: 'dark', accent: 'emerald', fontSize: 'medium', ambience: false },
  planner: [],
  currentCardIndex: 0,
  currentGoalTab: 'daily'
};

// ---------- State ----------
const State = {
  data: null,
  load() {
    try {
      const saved = localStorage.getItem('studyflow_data');
      if (saved) {
        this.data = { ...DEFAULT_DATA, ...JSON.parse(saved) };
        // Ensure nested objects exist
        this.data.streak = { ...DEFAULT_DATA.streak, ...this.data.streak };
        this.data.settings = { ...DEFAULT_DATA.settings, ...this.data.settings };
      } else {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.seedDemoData();
      }
    } catch (e) {
      console.error('Load error:', e);
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      this.seedDemoData();
    }
  },
  save() {
    try {
      localStorage.setItem('studyflow_data', JSON.stringify(this.data));
    } catch (e) { console.error('Save error:', e); }
  },
  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.seedDemoData();
    this.save();
  },
  seedDemoData() {
    // Generate sample sessions for the past 7 days
    const now = new Date();
    const subjectIds = this.data.subjects.map(s => s.id);
    const sessions = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const numSessions = i === 0 ? 1 : Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numSessions; j++) {
        const hour = 9 + j * 3 + Math.floor(Math.random() * 2);
        const start = new Date(day);
        start.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
        const duration = 25 + Math.floor(Math.random() * 35); // 25-60 min
        sessions.push({
          id: 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2),
          subjectId: subjectIds[Math.floor(Math.random() * subjectIds.length)],
          duration,
          date: start.toISOString(),
          startTime: start.toISOString()
        });
      }
    }
    this.data.sessions = sessions;
    // Update subject totals
    this.data.subjects.forEach(s => {
      s.totalHours = sessions.filter(x => x.subjectId === s.id).reduce((sum, x) => sum + x.duration, 0) / 60;
    });
    // Update streak
    Streaks.recompute();
    // Sample tasks
    this.data.tasks = [
      { id: 't1', title: 'Review calculus derivatives', priority: 'high', completed: true, subjectId: 's1', date: new Date().toISOString() },
      { id: 't2', title: 'Solve physics problem set 3', priority: 'medium', completed: false, subjectId: 's2', date: new Date().toISOString() },
      { id: 't3', title: 'Read chapter 5 of algorithms book', priority: 'low', completed: false, subjectId: 's3', date: new Date().toISOString() }
    ];
    // Sample notes
    this.data.notes = [
      { id: 'n1', title: 'Calculus Key Formulas', content: 'Power Rule: d/dx(x^n) = nx^(n-1)\nChain Rule: d/dx(f(g(x))) = f\'(g(x))·g\'(x)\nProduct Rule: d/dx(f·g) = f\'·g + f·g\'', pinned: true, date: new Date().toISOString() },
      { id: 'n2', title: 'Physics Laws', content: 'Newton\'s 1st Law: An object at rest stays at rest unless acted upon by a force.\nNewton\'s 2nd Law: F = ma\nNewton\'s 3rd Law: For every action, there is an equal and opposite reaction.', pinned: false, date: new Date().toISOString() }
    ];
    // Sample goals
    this.data.goals = [
      { id: 'g1', title: 'Study 4 hours today', type: 'daily', target: 4, progress: 2.5, completed: false },
      { id: 'g2', title: 'Complete 3 chapters this week', type: 'weekly', target: 3, progress: 1, completed: false },
      { id: 'g3', title: 'Finish course this month', type: 'monthly', target: 1, progress: 0.3, completed: false }
    ];
    // Sample planner
    this.data.planner = [
      { id: 'p1', day: 'Mon', startTime: '09:00', endTime: '10:30', title: 'Math Practice' },
      { id: 'p2', day: 'Mon', startTime: '14:00', endTime: '15:00', title: 'Physics Lab' },
      { id: 'p3', day: 'Tue', startTime: '10:00', endTime: '12:00', title: 'CS Project' },
      { id: 'p4', day: 'Wed', startTime: '15:00', endTime: '16:30', title: 'Review Session' },
      { id: 'p5', day: 'Thu', startTime: '09:00', endTime: '10:00', title: 'Math Homework' },
      { id: 'p6', day: 'Fri', startTime: '13:00', endTime: '15:00', title: 'Group Study' }
    ];
  }
};

// ---------- Helpers ----------
function uid(prefix = 'id') { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
function todayKey() { return new Date().toISOString().split('T')[0]; }
function dateKey(d) { return new Date(d).toISOString().split('T')[0]; }
function fmtDate(d, opts) { return new Date(d).toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtTime(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function fmtDuration(min) {
  if (min < 60) return min + 'm';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m === 0 ? h + 'h' : h + 'h ' + m + 'm';
}
function totalHours(d) { return d.sessions.reduce((s, x) => s + x.duration, 0) / 60; }
function dailyHoursMax(d) {
  const byDay = {};
  d.sessions.forEach(s => {
    const k = dateKey(s.date);
    byDay[k] = (byDay[k] || 0) + s.duration;
  });
  return Math.max(0, ...Object.values(byDay)) / 60;
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning, scholar';
  if (h < 18) return 'Good afternoon, scholar';
  return 'Good evening, scholar';
}

// ---------- UI ----------
const UI = {
  toast(msg, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icons = { success: 'fa-check-circle', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  modal(title, bodyHTML) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modal').classList.add('show');
    document.getElementById('modalBackdrop').classList.add('show');
  },
  closeModal() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('modalBackdrop').classList.remove('show');
  },
  confirm(message) {
    return new Promise(resolve => {
      this.modal('Confirm', `
        <p style="margin-bottom:20px;color:var(--text-secondary)">${escapeHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn-secondary" id="confirmCancel">Cancel</button>
          <button class="btn-danger" id="confirmOk">Confirm</button>
        </div>
      `);
      document.getElementById('confirmCancel').onclick = () => { this.closeModal(); resolve(false); };
      document.getElementById('confirmOk').onclick = () => { this.closeModal(); resolve(true); };
    });
  },
  emptyState(icon, message) {
    return `<div class="empty-state"><i class="fas ${icon}"></i><p>${escapeHtml(message)}</p></div>`;
  }
};

// ---------- Audio ----------
const AudioMgr = {
  ctx: null,
  ambienceNode: null,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
  beep() {
    this.init();
    const now = this.ctx.currentTime;
    [800, 1000, 800].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.2 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.18);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.2);
    });
  },
  startAmbience() {
    this.init();
    if (this.ambienceNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    source.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    source.start();
    this.ambienceNode = { source, gain };
  },
  stopAmbience() {
    if (this.ambienceNode) {
      this.ambienceNode.source.stop();
      this.ambienceNode = null;
    }
  }
};

// ---------- Streaks Logic ----------
const Streaks = {
  recompute() {
    const d = State.data;
    const studyDays = new Set(d.sessions.map(s => dateKey(s.date)));
    const sortedDays = Array.from(studyDays).sort();
    if (sortedDays.length === 0) {
      d.streak.current = 0; d.streak.longest = 0; d.streak.history = [];
      return;
    }
    d.streak.history = sortedDays;
    // Compute longest
    let longest = 1, current = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      // FIX 1: Use Math.round() to avoid DST floating-point errors where a
      // "1-day" difference might be 0.958 or 1.042 instead of exactly 1.
      if (Math.round(diff) === 1) { current++; longest = Math.max(longest, current); }
      else { current = 1; }
    }
    d.streak.longest = longest;
    // Compute current
    const today = todayKey();
    const yesterday = dateKey(new Date(Date.now() - 86400000));
    if (studyDays.has(today)) {
      let cur = 1;
      let dt = new Date();
      for (let i = 1; i < 365; i++) {
        dt = new Date(dt.getTime() - 86400000);
        if (studyDays.has(dateKey(dt))) cur++;
        else break;
      }
      d.streak.current = cur;
    } else if (studyDays.has(yesterday)) {
      let cur = 0;
      let dt = new Date();
      for (let i = 1; i < 365; i++) {
        dt = new Date(dt.getTime() - 86400000);
        if (studyDays.has(dateKey(dt))) cur++;
        else break;
      }
      d.streak.current = cur;
    } else {
      d.streak.current = 0;
    }
  },
  missedDays30() {
    const studyDays = new Set(State.data.sessions.map(s => dateKey(s.date)));
    let missed = 0;
    for (let i = 0; i < 30; i++) {
      const dt = new Date(Date.now() - i * 86400000);
      if (!studyDays.has(dateKey(dt))) missed++;
    }
    return missed;
  }
};

// ---------- Dashboard ----------
const Dashboard = {
  charts: {},
  init() {
    this.render();
    setInterval(() => this.updateClock(), 1000);
    document.getElementById('newTipBtn').onclick = () => this.setTip();
    document.querySelectorAll('.qa-btn').forEach(btn => {
      btn.onclick = () => {
        const a = btn.dataset.action;
        if (a === 'start-timer') App.navigate('timer');
        else if (a === 'add-task') { App.navigate('tasks'); setTimeout(() => document.getElementById('taskInput').focus(), 200); }
        else if (a === 'add-note') Notes.openEditor();
        else if (a === 'add-flashcard') { App.navigate('flashcards'); setTimeout(() => Flashcards.openEditor(), 200); }
      };
    });
  },
  render() {
    document.getElementById('heroGreeting').textContent = getGreeting();
    const now = new Date();
    document.getElementById('heroDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    this.updateClock();
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.querySelector('#heroQuote p').textContent = `"${q.text}" — ${q.author}`;
    this.setTip();
    this.renderStats();
    this.renderWeekChart();
    this.renderMiniHeatmap();
  },
  updateClock() {
    const now = new Date();
    document.getElementById('clockTime').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('clockDate').textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  },
  setTip() {
    document.getElementById('dashTip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  },
  renderStats() {
    const d = State.data;
    const today = todayKey();
    const todaySessions = d.sessions.filter(s => dateKey(s.date) === today);
    const todayMin = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    document.getElementById('statTodayHours').textContent = (todayMin / 60).toFixed(1) + 'h';
    document.getElementById('statTodaySessions').textContent = todaySessions.length + ' sessions';
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekSessions = d.sessions.filter(s => new Date(s.date) >= weekStart);
    const weekMin = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    document.getElementById('statWeekHours').textContent = (weekMin / 60).toFixed(1) + 'h';
    document.getElementById('statWeekSessions').textContent = weekSessions.length + ' sessions';
    const totalMin = d.sessions.reduce((sum, s) => sum + s.duration, 0);
    document.getElementById('statTotalHours').textContent = (totalMin / 60).toFixed(1) + 'h';
    document.getElementById('statTotalSessions').textContent = d.sessions.length + ' sessions';
    const completedSubjects = d.subjects.filter(s => {
      const weeklyMin = d.sessions.filter(x => x.subjectId === s.id && new Date(x.date) >= weekStart).reduce((sum, x) => sum + x.duration, 0);
      return weeklyMin >= s.weeklyGoal * 60;
    }).length;
    document.getElementById('statSubjectsDone').textContent = completedSubjects;
    document.getElementById('statSubjectsTotal').textContent = 'of ' + d.subjects.length + ' subjects';
    const tasksToday = d.tasks.filter(t => dateKey(t.date) === today);
    const tasksDone = tasksToday.filter(t => t.completed).length;
    const overallPct = tasksToday.length > 0 ? Math.round((tasksDone / tasksToday.length) * 100) : 0;
    document.getElementById('overallProgress').style.width = overallPct + '%';
    document.getElementById('overallBadge').textContent = overallPct + '%';
    document.getElementById('overallMeta').textContent = tasksDone + ' / ' + tasksToday.length + ' tasks today';
    const productivity = this.computeProductivity();
    document.getElementById('productivityScore').textContent = productivity;
    const circumference = 2 * Math.PI * 52;
    document.getElementById('productivityRing').style.strokeDashoffset = circumference - (productivity / 100) * circumference;
    document.getElementById('sidebarStreak').textContent = d.streak.current;
    document.getElementById('dashStreak').textContent = d.streak.current + ' days';
  },
  computeProductivity() {
    const d = State.data;
    let score = 0;
    score += Math.min(30, d.streak.current * 4);
    const todayMin = d.sessions.filter(s => dateKey(s.date) === todayKey()).reduce((sum, s) => sum + s.duration, 0);
    score += Math.min(30, (todayMin / 60) * 6);
    const todayTasks = d.tasks.filter(t => dateKey(t.date) === todayKey());
    if (todayTasks.length > 0) {
      score += Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 20);
    }
    const dailyGoals = d.goals.filter(g => g.type === 'daily');
    if (dailyGoals.length > 0) {
      const avgProgress = dailyGoals.reduce((sum, g) => sum + Math.min(100, (g.progress / g.target) * 100), 0) / dailyGoals.length;
      score += Math.round((avgProgress / 100) * 20);
    }
    return Math.min(100, Math.round(score));
  },
  renderWeekChart() {
    const ctx = document.getElementById('weekChart').getContext('2d');
    if (this.charts.week) this.charts.week.destroy();
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000);
      labels.push(dt.toLocaleDateString('en-US', { weekday: 'short' }));
      const min = State.data.sessions.filter(s => dateKey(s.date) === dateKey(dt)).reduce((sum, s) => sum + s.duration, 0);
      data.push((min / 60).toFixed(2));
    }
    this.charts.week = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
          borderRadius: 8,
          barThickness: 'flex',
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#9ca3af', callback: v => v + 'h' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
        }
      }
    });
  },
  renderMiniHeatmap() {
    const container = document.getElementById('dashHeatmap');
    container.innerHTML = '';
    const studyDays = {};
    State.data.sessions.forEach(s => {
      const k = dateKey(s.date);
      studyDays[k] = (studyDays[k] || 0) + s.duration;
    });
    for (let i = 44; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000);
      const k = dateKey(dt);
      const min = studyDays[k] || 0;
      const cell = document.createElement('div');
      cell.className = 'hm-cell';
      if (min > 0) {
        if (min < 30) cell.classList.add('l1');
        else if (min < 60) cell.classList.add('l2');
        else if (min < 120) cell.classList.add('l3');
        else cell.classList.add('l4');
      }
      cell.title = fmtDate(dt) + ': ' + fmtDuration(min);
      container.appendChild(cell);
    }
  }
};

// ---------- Subjects ----------
const Subjects = {
  init() {
    document.getElementById('addSubjectBtn').onclick = () => this.openEditor();
  },
  render() {
    const grid = document.getElementById('subjectsGrid');
    const d = State.data;
    if (d.subjects.length === 0) {
      grid.innerHTML = UI.emptyState('fa-book', 'No subjects yet. Add your first subject to start tracking!');
      return;
    }
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    grid.innerHTML = d.subjects.map(s => {
      const weeklyMin = d.sessions.filter(x => x.subjectId === s.id && new Date(x.date) >= weekStart).reduce((sum, x) => sum + x.duration, 0);
      const goalMin = s.weeklyGoal * 60;
      const pct = goalMin > 0 ? Math.min(100, Math.round((weeklyMin / goalMin) * 100)) : 0;
      const totalSessions = d.sessions.filter(x => x.subjectId === s.id).length;
      return `
        <div class="subject-card" style="--subject-color:${s.color}">
          <div class="subject-head">
            <div class="subject-icon-wrap"><i class="fas ${s.icon}"></i></div>
            <div class="subject-actions">
              <button onclick="Subjects.openEditor('${s.id}')" title="Edit"><i class="fas fa-pen"></i></button>
              <button class="del" onclick="Subjects.delete('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="subject-name">${escapeHtml(s.name)}</div>
          <div class="subject-meta">${totalSessions} sessions · ${s.totalHours.toFixed(1)}h total</div>
          <div class="subject-progress-text">
            <span>Weekly goal</span>
            <span><strong>${fmtDuration(weeklyMin)}</strong> / ${s.weeklyGoal}h</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%; background:linear-gradient(90deg, ${s.color}, ${s.color}aa)"></div></div>
          <div class="subject-progress-text" style="margin-top:6px">
            <span></span>
            <span>${pct}%</span>
          </div>
        </div>
      `;
    }).join('');
  },
  openEditor(id) {
    const d = State.data;
    const subj = id ? d.subjects.find(s => s.id === id) : null;
    // FIX 6: Mark the first option as active by default when creating a new
    // subject, so the UI reflects the default values held in chosenColor/chosenIcon.
    const colorHTML = SUBJECT_COLORS.map((c, i) => `<button class="color-opt ${subj ? (subj.color === c ? 'active' : '') : (i === 0 ? 'active' : '')}" data-color="${c}" style="--c:${c}"></button>`).join('');
    const iconHTML = SUBJECT_ICONS.map((ic, i) => `<button class="icon-opt ${subj ? (subj.icon === ic ? 'active' : '') : (i === 0 ? 'active' : '')}" data-icon="${ic}"><i class="fas ${ic}"></i></button>`).join('');
    UI.modal(id ? 'Edit Subject' : 'Add Subject', `
      <div class="form-group">
        <label>Subject Name</label>
        <input type="text" id="subjName" value="${subj ? escapeHtml(subj.name) : ''}" placeholder="e.g. Biology">
      </div>
      <div class="form-group">
        <label>Weekly Goal (hours)</label>
        <input type="number" id="subjGoal" min="1" max="100" value="${subj ? subj.weeklyGoal : 5}">
      </div>
      <div class="form-group">
        <label>Color</label>
        <div class="color-picker" id="colorPicker">${colorHTML}</div>
      </div>
      <div class="form-group">
        <label>Icon</label>
        <div class="icon-picker" id="iconPicker">${iconHTML}</div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn-primary" id="saveSubject">${id ? 'Save' : 'Add Subject'}</button>
      </div>
    `);
    let chosenColor = subj ? subj.color : SUBJECT_COLORS[0];
    let chosenIcon = subj ? subj.icon : SUBJECT_ICONS[0];
    document.querySelectorAll('#colorPicker .color-opt').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('#colorPicker .color-opt').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        chosenColor = b.dataset.color;
      };
    });
    document.querySelectorAll('#iconPicker .icon-opt').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('#iconPicker .icon-opt').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        chosenIcon = b.dataset.icon;
      };
    });
    document.getElementById('saveSubject').onclick = () => {
      const name = document.getElementById('subjName').value.trim();
      const goal = parseInt(document.getElementById('subjGoal').value) || 5;
      if (!name) { UI.toast('Please enter a subject name', 'error'); return; }
      if (id) {
        const s = State.data.subjects.find(x => x.id === id);
        s.name = name; s.color = chosenColor; s.icon = chosenIcon; s.weeklyGoal = goal;
        UI.toast('Subject updated', 'success');
      } else {
        State.data.subjects.push({ id: uid('s'), name, color: chosenColor, icon: chosenIcon, weeklyGoal: goal, totalHours: 0 });
        UI.toast('Subject added', 'success');
      }
      State.save();
      UI.closeModal();
      this.render();
      Achievements.check();
      App.refreshAll();
    };
  },
  delete(id) {
    UI.confirm('Delete this subject? Related sessions will remain but unlinked.').then(ok => {
      if (!ok) return;
      State.data.subjects = State.data.subjects.filter(s => s.id !== id);
      State.save();
      this.render();
      App.refreshAll();
      UI.toast('Subject deleted', 'success');
    });
  }
};

// ---------- Timer ----------
const Timer = {
  mode: 'pomodoro',
  duration: 25 * 60,
  remaining: 25 * 60,
  isRunning: false,
  isPaused: false,
  interval: null,
  phase: 'focus',
  selectedSubject: null,
  init() {
    document.querySelectorAll('.mode-btn').forEach(b => {
      b.onclick = () => this.setMode(b.dataset.mode);
    });
    document.getElementById('timerStart').onclick = () => this.toggle();
    document.getElementById('timerReset').onclick = () => this.reset();
    document.getElementById('timerStop').onclick = () => this.stop();
    document.getElementById('timerSubject').onchange = (e) => { this.selectedSubject = e.target.value; };
  },
  render() {
    const sel = document.getElementById('timerSubject');
    const current = sel.value;
    sel.innerHTML = State.data.subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    if (current && State.data.subjects.find(s => s.id === current)) sel.value = current;
    this.selectedSubject = sel.value;
    this.renderDisplay();
    this.renderHistory();
  },
  setMode(mode) {
    this.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    document.getElementById('customTimer').style.display = mode === 'custom' ? 'flex' : 'none';
    const presets = { pomodoro: 25, short: 15, long: 50 };
    const mins = mode === 'custom' ? parseInt(document.getElementById('customMinutes').value) || 30 : presets[mode];
    this.duration = mins * 60;
    this.remaining = mins * 60;
    this.phase = 'focus';
    this.updateDisplay();
  },
  toggle() {
    if (this.isRunning && !this.isPaused) this.pause();
    else this.start();
  },
  start() {
    if (this.isPaused) {
      this.isPaused = false;
      this.tick();
      document.getElementById('timerStart').innerHTML = '<i class="fas fa-pause"></i> Pause';
      return;
    }
    if (!this.selectedSubject) {
      UI.toast('Add a subject first', 'error');
      return;
    }
    if (this.mode === 'custom') {
      const mins = parseInt(document.getElementById('customMinutes').value) || 30;
      this.duration = mins * 60;
      this.remaining = this.duration;
    }
    this.isRunning = true;
    this.phase = 'focus';
    this.updateDisplay();
    document.getElementById('timerStart').innerHTML = '<i class="fas fa-pause"></i> Pause';
    UI.toast('Timer started — focus!', 'info');
    this.tick();
  },
  pause() {
    this.isPaused = true;
    clearInterval(this.interval);
    document.getElementById('timerStart').innerHTML = '<i class="fas fa-play"></i> Resume';
    UI.toast('Timer paused', 'info');
  },
  stop() {
    if (this.isRunning) {
      const elapsed = this.duration - this.remaining;
      if (elapsed >= 60) {
        this.logSession(elapsed);
      }
    }
    clearInterval(this.interval);
    this.isRunning = false;
    this.isPaused = false;
    this.remaining = this.duration;
    this.phase = 'focus';
    this.updateDisplay();
    document.getElementById('timerStart').innerHTML = '<i class="fas fa-play"></i> Start';
  },
  reset() {
    clearInterval(this.interval);
    this.isRunning = false;
    this.isPaused = false;
    this.remaining = this.duration;
    this.phase = 'focus';
    this.updateDisplay();
    document.getElementById('timerStart').innerHTML = '<i class="fas fa-play"></i> Start';
  },
  tick() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.remaining--;
      this.updateDisplay();
      if (this.remaining <= 0) {
        clearInterval(this.interval);
        this.complete();
      }
    }, 1000);
  },
  complete() {
    // FIX 4: Only log a study session when a focus phase ends.
    // Previously, logSession() was called unconditionally, meaning break time
    // was also counted as study time. Now session logging and toasts are
    // handled separately per phase.
    AudioMgr.beep();
    const elapsed = this.duration;
    if (this.phase === 'focus') {
      this.logSession(elapsed);
      UI.toast('Focus session complete! 🎉', 'success');
      const breakMins = this.mode === 'custom' ? (parseInt(document.getElementById('customBreak').value) || 5) : (this.mode === 'pomodoro' ? 5 : this.mode === 'short' ? 3 : 10);
      this.phase = 'break';
      this.duration = breakMins * 60;
      this.remaining = breakMins * 60;
      this.updateDisplay();
      UI.toast('Break time! Take a rest.', 'info');
      this.tick();
    } else {
      UI.toast('Break complete! Time to focus again. 🎉', 'success');
      this.phase = 'focus';
      this.reset();
    }
  },
  logSession(seconds) {
    if (!this.selectedSubject) return;
    const session = {
      id: uid('sess'),
      subjectId: this.selectedSubject,
      duration: Math.round(seconds / 60),
      date: new Date().toISOString(),
      startTime: new Date(Date.now() - seconds * 1000).toISOString()
    };
    State.data.sessions.push(session);
    const subj = State.data.subjects.find(s => s.id === this.selectedSubject);
    if (subj) subj.totalHours += session.duration / 60;
    Streaks.recompute();
    State.save();
    this.renderHistory();
    App.refreshAll();
    Achievements.check();
  },
  updateDisplay() {
    const mins = Math.floor(this.remaining / 60);
    const secs = this.remaining % 60;
    document.getElementById('timerMinutes').textContent = String(mins).padStart(2, '0');
    document.getElementById('timerSeconds').textContent = String(secs).padStart(2, '0');
    document.getElementById('timerPhase').textContent = this.phase === 'focus' ? 'Focus' : 'Break';
    const circumference = 2 * Math.PI * 90;
    const progress = (this.duration - this.remaining) / this.duration;
    document.getElementById('timerRing').style.strokeDashoffset = circumference * progress;
  },
  renderDisplay() { this.updateDisplay(); },
  renderHistory() {
    const list = document.getElementById('sessionList');
    const sessions = [...State.data.sessions].reverse().slice(0, 30);
    document.getElementById('sessionCount').textContent = State.data.sessions.length;
    if (sessions.length === 0) {
      list.innerHTML = UI.emptyState('fa-history', 'No sessions yet. Start studying!');
      return;
    }
    list.innerHTML = sessions.map(s => {
      const subj = State.data.subjects.find(x => x.id === s.subjectId);
      const color = subj ? subj.color : '#888';
      const name = subj ? subj.name : 'Unknown';
      return `
        <div class="session-item">
          <div class="session-dot" style="background:${color}"></div>
          <div class="session-info">
            <div class="session-subject">${escapeHtml(name)}</div>
            <div class="session-time">${fmtDate(s.date, { month: 'short', day: 'numeric' })} · ${fmtTime(s.date)}</div>
          </div>
          <div class="session-duration">${fmtDuration(s.duration)}</div>
        </div>
      `;
    }).join('');
  }
};

// ---------- Tasks ----------
const Tasks = {
  filter: 'all',
  init() {
    document.getElementById('addTaskBtn').onclick = () => this.add();
    document.getElementById('taskInput').addEventListener('keypress', e => { if (e.key === 'Enter') this.add(); });
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.onclick = () => {
        this.filter = b.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(x => x.classList.toggle('active', x === b));
        this.render();
      };
    });
  },
  render() {
    const sel = document.getElementById('taskSubject');
    const current = sel.value;
    sel.innerHTML = '<option value="">No subject</option>' + State.data.subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
    if (current) sel.value = current;
    const list = document.getElementById('taskList');
    let tasks = [...State.data.tasks].reverse();
    if (this.filter === 'active') tasks = tasks.filter(t => !t.completed);
    else if (this.filter === 'completed') tasks = tasks.filter(t => t.completed);
    else if (this.filter === 'high') tasks = tasks.filter(t => t.priority === 'high');
    if (tasks.length === 0) {
      list.innerHTML = UI.emptyState('fa-check-square', 'No tasks here. Add one above!');
    } else {
      list.innerHTML = tasks.map(t => {
        const subj = State.data.subjects.find(s => s.id === t.subjectId);
        return `
          <div class="task-item ${t.completed ? 'completed' : ''}">
            <div class="task-check ${t.completed ? 'done' : ''}" onclick="Tasks.toggle('${t.id}')">${t.completed ? '<i class="fas fa-check"></i>' : ''}</div>
            <div class="task-content">
              <div class="task-title">${escapeHtml(t.title)}</div>
              <div class="task-meta">
                <span class="task-priority ${t.priority}">${t.priority}</span>
                ${subj ? `<span class="task-subject-tag"><span class="dot" style="background:${subj.color}"></span>${escapeHtml(subj.name)}</span>` : ''}
                <span><i class="fas fa-calendar"></i> ${fmtDate(t.date, { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
            <div class="task-actions">
              <button onclick="Tasks.edit('${t.id}')"><i class="fas fa-pen"></i></button>
              <button class="del" onclick="Tasks.delete('${t.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `;
      }).join('');
    }
    const all = State.data.tasks;
    const done = all.filter(t => t.completed).length;
    const pct = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
    document.getElementById('taskProgressText').textContent = `${done} / ${all.length} done`;
    document.getElementById('taskProgressFill').style.width = pct + '%';
  },
  add() {
    const input = document.getElementById('taskInput');
    const title = input.value.trim();
    if (!title) { UI.toast('Enter a task title', 'error'); return; }
    const priority = document.getElementById('taskPriority').value;
    const subjectId = document.getElementById('taskSubject').value;
    State.data.tasks.push({ id: uid('t'), title, priority, completed: false, subjectId, date: new Date().toISOString() });
    input.value = '';
    State.save();
    this.render();
    App.refreshAll();
    Achievements.check();
    UI.toast('Task added', 'success');
  },
  toggle(id) {
    const t = State.data.tasks.find(x => x.id === id);
    if (t) {
      t.completed = !t.completed;
      State.save();
      this.render();
      App.refreshAll();
      Achievements.check();
      if (t.completed) UI.toast('Task completed!', 'success');
    }
  },
  edit(id) {
    const t = State.data.tasks.find(x => x.id === id);
    if (!t) return;
    UI.modal('Edit Task', `
      <div class="form-group">
        <label>Task Title</label>
        <input type="text" id="editTaskTitle" value="${escapeHtml(t.title)}">
      </div>
      <div class="form-group">
        <label>Priority</label>
        <select id="editTaskPriority">
          <option value="low" ${t.priority === 'low' ? 'selected' : ''}>Low</option>
          <option value="medium" ${t.priority === 'medium' ? 'selected' : ''}>Medium</option>
          <option value="high" ${t.priority === 'high' ? 'selected' : ''}>High</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn-primary" id="saveEditTask">Save</button>
      </div>
    `);
    document.getElementById('saveEditTask').onclick = () => {
      t.title = document.getElementById('editTaskTitle').value.trim();
      t.priority = document.getElementById('editTaskPriority').value;
      State.save();
      UI.closeModal();
      this.render();
      UI.toast('Task updated', 'success');
    };
  },
  delete(id) {
    State.data.tasks = State.data.tasks.filter(t => t.id !== id);
    State.save();
    this.render();
    App.refreshAll();
    UI.toast('Task deleted', 'success');
  }
};

// ---------- Calendar ----------
const Calendar = {
  viewDate: new Date(),
  selectedDate: null,
  init() {
    document.getElementById('calPrev').onclick = () => { this.viewDate.setMonth(this.viewDate.getMonth() - 1); this.render(); };
    document.getElementById('calNext').onclick = () => { this.viewDate.setMonth(this.viewDate.getMonth() + 1); this.render(); };
    document.getElementById('saveCalNote').onclick = () => this.saveNote();
  },
  render() {
    const d = State.data;
    document.getElementById('calMonthYear').textContent = this.viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayKey();
    const studyDays = {};
    d.sessions.forEach(s => {
      const k = dateKey(s.date);
      studyDays[k] = (studyDays[k] || 0) + s.duration;
    });
    let html = '';
    for (let i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === today;
      const hasStudy = studyDays[dateStr] !== undefined;
      const isSelected = this.selectedDate === dateStr;
      html += `<div class="cal-day ${isToday ? 'today' : ''} ${hasStudy ? 'has-study' : ''} ${isSelected ? 'selected' : ''}" onclick="Calendar.selectDay('${dateStr}')">${day}</div>`;
    }
    document.getElementById('calendarGrid').innerHTML = html;
    if (this.selectedDate) this.showDetail(this.selectedDate);
  },
  selectDay(dateStr) {
    this.selectedDate = dateStr;
    this.render();
    this.showDetail(dateStr);
  },
  showDetail(dateStr) {
    const dt = new Date(dateStr + 'T00:00:00');
    document.getElementById('calDetailDate').textContent = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const daySessions = State.data.sessions.filter(s => dateKey(s.date) === dateStr);
    const body = document.getElementById('calDetailBody');
    if (daySessions.length === 0) {
      body.innerHTML = '<p class="muted" style="text-align:center;padding:30px 0">No study sessions on this day</p>';
    } else {
      const totalMin = daySessions.reduce((sum, s) => sum + s.duration, 0);
      body.innerHTML = `
        <p style="margin-bottom:12px;color:var(--text-secondary);font-size:0.85rem">
          <strong style="color:var(--accent);font-size:1.1rem">${fmtDuration(totalMin)}</strong> total · ${daySessions.length} session${daySessions.length > 1 ? 's' : ''}
        </p>
        ${daySessions.map(s => {
          const subj = State.data.subjects.find(x => x.id === s.subjectId);
          return `
            <div class="session-item">
              <div class="session-dot" style="background:${subj ? subj.color : '#888'}"></div>
              <div class="session-info">
                <div class="session-subject">${subj ? escapeHtml(subj.name) : 'Unknown'}</div>
                <div class="session-time">${fmtTime(s.date)}</div>
              </div>
              <div class="session-duration">${fmtDuration(s.duration)}</div>
            </div>
          `;
        }).join('')}
      `;
    }
    document.getElementById('calNoteInput').value = State.data.calendarNotes[dateStr] || '';
  },
  saveNote() {
    if (!this.selectedDate) { UI.toast('Select a day first', 'error'); return; }
    const note = document.getElementById('calNoteInput').value.trim();
    if (note) State.data.calendarNotes[this.selectedDate] = note;
    else delete State.data.calendarNotes[this.selectedDate];
    State.save();
    UI.toast('Note saved', 'success');
  }
};

// ---------- Notes ----------
const Notes = {
  search: '',
  init() {
    document.getElementById('addNoteBtn').onclick = () => this.openEditor();
    document.getElementById('noteSearch').oninput = (e) => { this.search = e.target.value.toLowerCase(); this.render(); };
  },
  render() {
    const grid = document.getElementById('notesGrid');
    let notes = [...State.data.notes];
    if (this.search) {
      notes = notes.filter(n => n.title.toLowerCase().includes(this.search) || (n.content || '').toLowerCase().includes(this.search));
    }
    notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date));
    if (notes.length === 0) {
      grid.innerHTML = UI.emptyState('fa-sticky-note', this.search ? 'No notes match your search' : 'No notes yet. Create your first note!');
      return;
    }
    grid.innerHTML = notes.map(n => `
      <div class="note-card ${n.pinned ? 'pinned' : ''}">
        <button class="note-pin ${n.pinned ? 'active' : ''}" onclick="Notes.togglePin('${n.id}')"><i class="fas fa-thumbtack"></i></button>
        <div class="note-title">${escapeHtml(n.title)}</div>
        <div class="note-content rich">${n.content || ''}</div>
        <div class="note-date"><i class="fas fa-clock"></i> ${fmtDate(n.date)}</div>
        <div class="note-actions">
          <button onclick="Notes.openEditor('${n.id}')"><i class="fas fa-pen"></i> Edit</button>
          <button class="del" onclick="Notes.delete('${n.id}')"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    `).join('');
    // FIX 2: Note content is stored as innerHTML from the contenteditable rich
    // editor and therefore contains HTML markup. Using escapeHtml() was turning
    // tags into visible literal text (e.g. "<strong>hi</strong>"). Using the
    // raw value renders bold/italic/lists correctly in the card preview.
  },
  openEditor(id) {
    const note = id ? State.data.notes.find(n => n.id === id) : null;
    UI.modal(id ? 'Edit Note' : 'New Note', `
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="noteTitle" value="${note ? escapeHtml(note.title) : ''}" placeholder="Note title">
      </div>
      <div class="form-group">
        <label>Content</label>
        <div class="rich-toolbar">
          <button onclick="document.execCommand('bold')" title="Bold"><i class="fas fa-bold"></i></button>
          <button onclick="document.execCommand('italic')" title="Italic"><i class="fas fa-italic"></i></button>
          <button onclick="document.execCommand('underline')" title="Underline"><i class="fas fa-underline"></i></button>
          <button onclick="document.execCommand('insertUnorderedList')" title="Bullet List"><i class="fas fa-list-ul"></i></button>
          <button onclick="document.execCommand('insertOrderedList')" title="Numbered List"><i class="fas fa-list-ol"></i></button>
        </div>
        <div class="rich-editor" id="noteContent" contenteditable="true">${note ? note.content : ''}</div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn-primary" id="saveNote">${id ? 'Save' : 'Create'}</button>
      </div>
    `);
    setTimeout(() => document.getElementById('noteTitle').focus(), 100);
    document.getElementById('saveNote').onclick = () => {
      const title = document.getElementById('noteTitle').value.trim();
      const content = document.getElementById('noteContent').innerHTML.trim();
      if (!title) { UI.toast('Enter a note title', 'error'); return; }
      if (id) {
        const n = State.data.notes.find(x => x.id === id);
        n.title = title; n.content = content;
        UI.toast('Note updated', 'success');
      } else {
        State.data.notes.push({ id: uid('n'), title, content, pinned: false, date: new Date().toISOString() });
        UI.toast('Note created', 'success');
      }
      State.save();
      UI.closeModal();
      this.render();
      Achievements.check();
      App.refreshAll();
    };
  },
  togglePin(id) {
    const n = State.data.notes.find(x => x.id === id);
    if (n) { n.pinned = !n.pinned; State.save(); this.render(); }
  },
  delete(id) {
    State.data.notes = State.data.notes.filter(n => n.id !== id);
    State.save();
    this.render();
    App.refreshAll();
    UI.toast('Note deleted', 'success');
  }
};

// ---------- Analytics ----------
const Analytics = {
  charts: {},
  init() {},
  render() {
    const d = State.data;
    document.getElementById('anaLongest').textContent = d.streak.longest + ' days';
    const totalMin = d.sessions.reduce((s, x) => s + x.duration, 0);
    document.getElementById('anaAvgSession').textContent = d.sessions.length > 0 ? Math.round(totalMin / d.sessions.length) + ' min' : '0 min';
    const byDay = {};
    d.sessions.forEach(s => { const k = dateKey(s.date); byDay[k] = (byDay[k] || 0) + s.duration; });
    const bestDayMin = Math.max(0, ...Object.values(byDay));
    document.getElementById('anaBestDay').textContent = (bestDayMin / 60).toFixed(1) + 'h';
    document.getElementById('anaTotalSessions').textContent = d.sessions.length;
    this.renderDailyChart();
    this.renderWeeklyChart();
    this.renderSubjectChart();
    this.renderMonthlyChart();
  },
  renderDailyChart() {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    if (this.charts.daily) this.charts.daily.destroy();
    const labels = [], data = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(Date.now() - i * 86400000);
      labels.push(dt.toLocaleDateString('en-US', { weekday: 'short' }));
      const min = State.data.sessions.filter(s => dateKey(s.date) === dateKey(dt)).reduce((sum, s) => sum + s.duration, 0);
      data.push((min / 60).toFixed(2));
    }
    this.charts.daily = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), borderRadius: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }
    });
  },
  renderWeeklyChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    if (this.charts.weekly) this.charts.weekly.destroy();
    const labels = [], data = [];
    for (let i = 7; i >= 0; i--) {
      const weekEnd = new Date(Date.now() - i * 7 * 86400000);
      const weekStart = new Date(weekEnd.getTime() - 6 * 86400000);
      labels.push('W' + (8 - i));
      const min = State.data.sessions.filter(s => { const sd = new Date(s.date); return sd >= weekStart && sd <= weekEnd; }).reduce((sum, s) => sum + s.duration, 0);
      data.push((min / 60).toFixed(2));
    }
    this.charts.weekly = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ data, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), pointRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }
    });
  },
  renderSubjectChart() {
    // FIX 1: The original code called `ctx.canvas.parentElement.innerHTML = '...'`
    // when there was no data, which removed the <canvas> from the DOM entirely.
    // Every subsequent call to this function then hit `getElementById('subjectChart')`
    // returning null and threw a TypeError. Fix: keep the canvas in the DOM and
    // instead toggle its visibility alongside a separate empty-state element.
    const canvasEl = document.getElementById('subjectChart');
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (this.charts.subject) { this.charts.subject.destroy(); this.charts.subject = null; }
    const d = State.data;
    const subjects = d.subjects.map(s => ({
      name: s.name,
      color: s.color,
      min: d.sessions.filter(x => x.subjectId === s.id).reduce((sum, x) => sum + x.duration, 0)
    })).filter(s => s.min > 0);

    const wrapper = canvasEl.parentElement;
    const existingEmpty = wrapper.querySelector('.chart-empty-state');

    if (subjects.length === 0) {
      canvasEl.style.display = 'none';
      if (!existingEmpty) {
        const el = document.createElement('div');
        el.className = 'empty-state chart-empty-state';
        el.innerHTML = '<i class="fas fa-chart-pie"></i><p>No data yet</p>';
        wrapper.appendChild(el);
      }
      return;
    }

    // Data available — remove empty state and show the canvas
    if (existingEmpty) existingEmpty.remove();
    canvasEl.style.display = '';

    this.charts.subject = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: subjects.map(s => s.name), datasets: [{ data: subjects.map(s => (s.min / 60).toFixed(2)), backgroundColor: subjects.map(s => s.color), borderWidth: 0, hoverOffset: 10 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 12, usePointStyle: true } } } }
    });
  },
  renderMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    if (this.charts.monthly) this.charts.monthly.destroy();
    const labels = [], data = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(dt.toLocaleDateString('en-US', { month: 'short' }));
      const min = State.data.sessions.filter(s => {
        const sd = new Date(s.date);
        return sd.getFullYear() === dt.getFullYear() && sd.getMonth() === dt.getMonth();
      }).reduce((sum, s) => sum + s.duration, 0);
      data.push((min / 60).toFixed(2));
    }
    this.charts.monthly = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ data, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), pointRadius: 3 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }
    });
  }
};

// ---------- Achievements ----------
const Achievements = {
  init() {},
  render() {
    const d = State.data;
    const grid = document.getElementById('achievementsGrid');
    const unlockedSet = new Set(d.achievements.map(a => a.id));
    grid.innerHTML = ACHIEVEMENTS_DEF.map(a => {
      const unlocked = unlockedSet.has(a.id);
      return `
        <div class="ach-card ${unlocked ? 'unlocked' : 'locked'}">
          <div class="ach-icon"><i class="fas ${a.icon}"></i></div>
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc}</div>
          <div class="ach-status">${unlocked ? 'Unlocked' : 'Locked'}</div>
        </div>
      `;
    }).join('');
    const unlockedCount = unlockedSet.size;
    document.getElementById('achProgressText').textContent = `${unlockedCount} / ${ACHIEVEMENTS_DEF.length} unlocked`;
    document.getElementById('achProgressFill').style.width = (unlockedCount / ACHIEVEMENTS_DEF.length * 100) + '%';
  },
  check() {
    const d = State.data;
    const unlockedSet = new Set(d.achievements.map(a => a.id));
    let newlyUnlocked = [];
    ACHIEVEMENTS_DEF.forEach(a => {
      if (!unlockedSet.has(a.id) && a.check(d)) {
        d.achievements.push({ id: a.id, date: new Date().toISOString() });
        newlyUnlocked.push(a);
      }
    });
    if (newlyUnlocked.length > 0) {
      State.save();
      this.render();
      newlyUnlocked.forEach(a => {
        UI.toast(`Achievement unlocked: ${a.name}!`, 'success', 4000);
      });
    }
  }
};

// ---------- Streaks UI ----------
const StreaksUI = {
  init() {},
  render() {
    const d = State.data;
    document.getElementById('currentStreak').textContent = d.streak.current;
    document.getElementById('longestStreak').textContent = d.streak.longest;
    document.getElementById('missedDays').textContent = Streaks.missedDays30();
    const studyDays = new Set(d.sessions.map(s => dateKey(s.date)));
    document.getElementById('totalStudyDays').textContent = studyDays.size;
    const heatmap = document.getElementById('streakHeatmap');
    heatmap.innerHTML = '';
    const studyMinutes = {};
    d.sessions.forEach(s => {
      const k = dateKey(s.date);
      studyMinutes[k] = (studyMinutes[k] || 0) + s.duration;
    });
    const totalDays = 26 * 7;
    const today = new Date();
    const startDay = today.getDay();
    for (let i = totalDays - startDay - 1; i >= 0; i--) {
      const dt = new Date(today.getTime() - i * 86400000);
      const k = dateKey(dt);
      const min = studyMinutes[k] || 0;
      const cell = document.createElement('div');
      cell.className = 'hm-cell';
      if (min > 0) {
        if (min < 30) cell.classList.add('l1');
        else if (min < 60) cell.classList.add('l2');
        else if (min < 120) cell.classList.add('l3');
        else cell.classList.add('l4');
      }
      cell.title = fmtDate(dt) + ': ' + fmtDuration(min);
      heatmap.appendChild(cell);
    }
  }
};

// ---------- Goals ----------
const Goals = {
  init() {
    document.getElementById('addGoalBtn').onclick = () => this.openEditor();
    document.querySelectorAll('.goal-tab').forEach(t => {
      t.onclick = () => {
        State.data.currentGoalTab = t.dataset.type;
        document.querySelectorAll('.goal-tab').forEach(x => x.classList.toggle('active', x === t));
        this.render();
      };
    });
  },
  render() {
    const tab = State.data.currentGoalTab || 'daily';
    document.querySelectorAll('.goal-tab').forEach(t => t.classList.toggle('active', t.dataset.type === tab));
    const list = document.getElementById('goalsList');
    const goals = State.data.goals.filter(g => g.type === tab);
    if (goals.length === 0) {
      list.innerHTML = UI.emptyState('fa-bullseye', `No ${tab} goals yet. Add one to get started!`);
      return;
    }
    list.innerHTML = goals.map(g => {
      const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
      return `
        <div class="goal-card ${g.completed ? 'completed' : ''}">
          <div class="goal-check ${g.completed ? 'done' : ''}" onclick="Goals.toggle('${g.id}')">${g.completed ? '<i class="fas fa-check"></i>' : ''}</div>
          <div class="goal-content">
            <div class="goal-title">${escapeHtml(g.title)}</div>
            <div class="goal-meta">${g.type} goal · ${pct}% complete</div>
            <div class="goal-progress-wrap">
              <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
              <input type="number" value="${g.progress}" min="0" step="0.5" onchange="Goals.updateProgress('${g.id}', this.value)">
              <span style="font-size:0.78rem;color:var(--text-muted)">/ ${g.target}</span>
            </div>
          </div>
          <div class="goal-actions">
            <button onclick="Goals.openEditor('${g.id}')"><i class="fas fa-pen"></i></button>
            <button class="del" onclick="Goals.delete('${g.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
    }).join('');
  },
  openEditor(id) {
    const g = id ? State.data.goals.find(x => x.id === id) : null;
    UI.modal(id ? 'Edit Goal' : 'New Goal', `
      <div class="form-group">
        <label>Goal Title</label>
        <input type="text" id="goalTitle" value="${g ? escapeHtml(g.title) : ''}" placeholder="e.g. Study 4 hours daily">
      </div>
      <div class="form-group">
        <label>Goal Type</label>
        <select id="goalType">
          <option value="daily" ${g && g.type === 'daily' ? 'selected' : ''}>Daily</option>
          <option value="weekly" ${g && g.type === 'weekly' ? 'selected' : ''}>Weekly</option>
          <option value="monthly" ${g && g.type === 'monthly' ? 'selected' : ''}>Monthly</option>
        </select>
      </div>
      <div class="form-group">
        <label>Target Value</label>
        <input type="number" id="goalTarget" value="${g ? g.target : 4}" min="0.5" step="0.5">
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn-primary" id="saveGoal">${id ? 'Save' : 'Create'}</button>
      </div>
    `);
    document.getElementById('saveGoal').onclick = () => {
      const title = document.getElementById('goalTitle').value.trim();
      const type = document.getElementById('goalType').value;
      const target = parseFloat(document.getElementById('goalTarget').value) || 1;
      if (!title) { UI.toast('Enter a goal title', 'error'); return; }
      if (id) {
        const goal = State.data.goals.find(x => x.id === id);
        goal.title = title; goal.type = type; goal.target = target;
        goal.completed = goal.progress >= target;
      } else {
        State.data.goals.push({ id: uid('g'), title, type, target, progress: 0, completed: false });
      }
      State.save();
      UI.closeModal();
      this.render();
      App.refreshAll();
      UI.toast('Goal saved', 'success');
    };
  },
  updateProgress(id, val) {
    const g = State.data.goals.find(x => x.id === id);
    if (g) {
      g.progress = parseFloat(val) || 0;
      g.completed = g.progress >= g.target;
      State.save();
      this.render();
      App.refreshAll();
      Achievements.check();
      if (g.completed) UI.toast('Goal completed! 🎉', 'success');
    }
  },
  toggle(id) {
    const g = State.data.goals.find(x => x.id === id);
    if (g) {
      g.completed = !g.completed;
      if (g.completed) g.progress = g.target;
      State.save();
      this.render();
      App.refreshAll();
      Achievements.check();
    }
  },
  delete(id) {
    State.data.goals = State.data.goals.filter(g => g.id !== id);
    State.save();
    this.render();
    App.refreshAll();
    UI.toast('Goal deleted', 'success');
  }
};

// ---------- Flashcards ----------
const Flashcards = {
  search: '',
  difficultOnly: false,
  viewIndex: 0,
  filtered: [],
  init() {
    document.getElementById('addCardBtn').onclick = () => this.openEditor();
    document.getElementById('cardSearch').oninput = (e) => { this.search = e.target.value.toLowerCase(); this.applyFilter(); };
    document.getElementById('shuffleCards').onclick = () => { this.shuffle(); };
    document.getElementById('filterDifficult').onclick = (e) => {
      this.difficultOnly = !this.difficultOnly;
      e.currentTarget.classList.toggle('active', this.difficultOnly);
      this.applyFilter();
    };
    document.getElementById('prevCard').onclick = () => this.prev();
    document.getElementById('nextCard').onclick = () => this.next();
    document.getElementById('markDifficult').onclick = () => this.toggleDifficult();
    document.getElementById('deleteCard').onclick = () => this.deleteCurrent();
    document.getElementById('flashcard').onclick = () => this.flip();
  },
  render() {
    this.applyFilter();
  },
  applyFilter() {
    let cards = [...State.data.flashcards];
    if (this.difficultOnly) cards = cards.filter(c => c.difficult);
    if (this.search) cards = cards.filter(c => c.front.toLowerCase().includes(this.search) || c.back.toLowerCase().includes(this.search));
    this.filtered = cards;
    this.viewIndex = 0;
    this.showCard();
  },
  showCard() {
    const card = this.filtered[this.viewIndex];
    const fc = document.getElementById('flashcard');
    fc.classList.remove('flipped');
    if (!card) {
      document.getElementById('cardFront').textContent = 'No cards yet';
      document.getElementById('cardBack').textContent = 'Add your first flashcard';
      document.getElementById('cardCounter').textContent = '0 / 0';
      return;
    }
    setTimeout(() => {
      document.getElementById('cardFront').textContent = card.front;
      document.getElementById('cardBack').textContent = card.back;
    }, 100);
    document.getElementById('cardCounter').textContent = `${this.viewIndex + 1} / ${this.filtered.length}`;
    const markBtn = document.getElementById('markDifficult');
    markBtn.classList.toggle('active', card.difficult);
    if (card.difficult) markBtn.innerHTML = '<i class="fas fa-star"></i> Difficult';
    else markBtn.innerHTML = '<i class="far fa-star"></i> Mark Difficult';
  },
  flip() {
    document.getElementById('flashcard').classList.toggle('flipped');
  },
  prev() {
    if (this.filtered.length === 0) return;
    this.viewIndex = (this.viewIndex - 1 + this.filtered.length) % this.filtered.length;
    this.showCard();
  },
  next() {
    if (this.filtered.length === 0) return;
    this.viewIndex = (this.viewIndex + 1) % this.filtered.length;
    this.showCard();
  },
  shuffle() {
    const cards = this.filtered;
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    this.viewIndex = 0;
    this.showCard();
    UI.toast('Cards shuffled', 'info');
  },
  toggleDifficult() {
    const card = this.filtered[this.viewIndex];
    if (!card) return;
    const original = State.data.flashcards.find(c => c.id === card.id);
    if (original) {
      original.difficult = !original.difficult;
      card.difficult = original.difficult;
      State.save();
      this.showCard();
      UI.toast(original.difficult ? 'Marked as difficult' : 'Removed from difficult', 'info');
    }
  },
  deleteCurrent() {
    const card = this.filtered[this.viewIndex];
    if (!card) return;
    UI.confirm('Delete this flashcard?').then(ok => {
      if (!ok) return;
      State.data.flashcards = State.data.flashcards.filter(c => c.id !== card.id);
      State.save();
      this.applyFilter();
      UI.toast('Card deleted', 'success');
    });
  },
  openEditor() {
    UI.modal('New Flashcard', `
      <div class="form-group">
        <label>Question (Front)</label>
        <textarea id="cardFrontInput" placeholder="What's on the front?"></textarea>
      </div>
      <div class="form-group">
        <label>Answer (Back)</label>
        <textarea id="cardBackInput" placeholder="What's on the back?"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn-primary" id="saveCard">Create Card</button>
      </div>
    `);
    document.getElementById('saveCard').onclick = () => {
      const front = document.getElementById('cardFrontInput').value.trim();
      const back = document.getElementById('cardBackInput').value.trim();
      if (!front || !back) { UI.toast('Fill in both sides', 'error'); return; }
      State.data.flashcards.push({ id: uid('f'), front, back, difficult: false });
      State.save();
      UI.closeModal();
      this.applyFilter();
      App.refreshAll();
      Achievements.check();
      UI.toast('Flashcard added', 'success');
    };
  }
};

// ---------- Planner ----------
const Planner = {
  init() {
    document.getElementById('addPlannerBtn').onclick = () => this.openEditor();
  },
  render() {
    const grid = document.getElementById('plannerGrid');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const todayIdx = today === 0 ? 6 : today - 1;
    grid.innerHTML = days.map((day, idx) => {
      const blocks = State.data.planner.filter(p => p.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
      return `
        <div class="planner-day">
          <div class="planner-day-header ${idx === todayIdx ? 'today' : ''}">${day}</div>
          <div class="planner-blocks" data-day="${day}" ondrop="Planner.drop(event, '${day}')" ondragover="Planner.dragOver(event)" ondragleave="Planner.dragLeave(event)">
            ${blocks.map(b => `
              <div class="planner-block" draggable="true" ondragstart="Planner.dragStart(event, '${b.id}')" ondragend="Planner.dragEnd(event)" onclick="Planner.edit('${b.id}')">
                <button class="planner-block-del" onclick="event.stopPropagation();Planner.delete('${b.id}')"><i class="fas fa-times"></i></button>
                <div class="planner-block-time">${b.startTime} - ${b.endTime}</div>
                <div class="planner-block-title">${escapeHtml(b.title)}</div>
              </div>
            `).join('')}
            <button class="planner-add-block" onclick="Planner.openEditor(null, '${day}')"><i class="fas fa-plus"></i> Add block</button>
          </div>
        </div>
      `;
    }).join('');
  },
  dragStart(e, id) {
    e.dataTransfer.setData('text/plain', id);
    e.currentTarget.classList.add('dragging');
  },
  // FIX 5: The 'dragging' CSS class was added in dragStart but never removed,
  // leaving the element visually stuck in a dragging state after the operation.
  // This handler removes it when the drag ends (whether dropped or cancelled).
  dragEnd(e) {
    e.currentTarget.classList.remove('dragging');
  },
  dragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  },
  dragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  },
  drop(e, day) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const id = e.dataTransfer.getData('text/plain');
    const block = State.data.planner.find(p => p.id === id);
    if (block) {
      block.day = day;
      State.save();
      this.render();
      UI.toast('Block moved', 'success');
    }
  },
  openEditor(id, presetDay) {
    const b = id ? State.data.planner.find(p => p.id === id) : null;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    UI.modal(id ? 'Edit Block' : 'Add Block', `
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="plannerTitle" value="${b ? escapeHtml(b.title) : ''}" placeholder="e.g. Math Practice">
      </div>
      <div class="form-group">
        <label>Day</label>
        <select id="plannerDay">
          ${days.map(d => `<option value="${d}" ${(b ? b.day : presetDay) === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:10px">
        <div class="form-group" style="flex:1">
          <label>Start Time</label>
          <input type="time" id="plannerStart" value="${b ? b.startTime : '09:00'}">
        </div>
        <div class="form-group" style="flex:1">
          <label>End Time</label>
          <input type="time" id="plannerEnd" value="${b ? b.endTime : '10:00'}">
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="UI.closeModal()">Cancel</button>
        <button class="btn-primary" id="savePlanner">${id ? 'Save' : 'Add'}</button>
      </div>
    `);
    document.getElementById('savePlanner').onclick = () => {
      const title = document.getElementById('plannerTitle').value.trim();
      const day = document.getElementById('plannerDay').value;
      const startTime = document.getElementById('plannerStart').value;
      const endTime = document.getElementById('plannerEnd').value;
      if (!title) { UI.toast('Enter a title', 'error'); return; }
      if (id) {
        const bl = State.data.planner.find(p => p.id === id);
        bl.title = title; bl.day = day; bl.startTime = startTime; bl.endTime = endTime;
      } else {
        State.data.planner.push({ id: uid('p'), title, day, startTime, endTime });
      }
      State.save();
      UI.closeModal();
      this.render();
      UI.toast('Block saved', 'success');
    };
  },
  edit(id) { this.openEditor(id); },
  delete(id) {
    State.data.planner = State.data.planner.filter(p => p.id !== id);
    State.save();
    this.render();
    UI.toast('Block deleted', 'success');
  }
};

// ---------- Settings ----------
const Settings = {
  init() {
    document.querySelectorAll('.theme-opt').forEach(b => {
      b.onclick = () => this.setTheme(b.dataset.theme);
    });
    document.querySelectorAll('.fs-opt').forEach(b => {
      b.onclick = () => this.setFontSize(b.dataset.size);
    });
    document.getElementById('exportData').onclick = () => this.export();
    document.getElementById('importData').onclick = () => document.getElementById('importFile').click();
    document.getElementById('importFile').onchange = (e) => this.import(e);
    document.getElementById('clearData').onclick = () => this.clear();
  },
  render() {
    const d = State.data.settings;
    document.querySelectorAll('.theme-opt').forEach(b => b.classList.toggle('active', b.dataset.theme === d.theme));
    document.querySelectorAll('.fs-opt').forEach(b => b.classList.toggle('active', b.dataset.size === d.fontSize));
    document.querySelectorAll('.accent-opt').forEach(b => b.classList.toggle('active', b.dataset.accent === d.accent));
  },
  setTheme(theme) {
    State.data.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggle').innerHTML = theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    State.save();
    this.render();
    App.refreshAll();
  },
  setAccent(accent) {
    State.data.settings.accent = accent;
    document.documentElement.setAttribute('data-accent', accent);
    State.save();
    this.render();
    App.refreshAll();
  },
  setFontSize(size) {
    State.data.settings.fontSize = size;
    document.documentElement.setAttribute('data-fontsize', size);
    State.save();
    this.render();
  },
  export() {
    const data = JSON.stringify(State.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow_backup_${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.toast('Data exported', 'success');
  },
  import(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        UI.confirm('Import will replace all current data. Continue?').then(ok => {
          if (!ok) return;
          State.data = { ...DEFAULT_DATA, ...imported };
          State.data.streak = { ...DEFAULT_DATA.streak, ...imported.streak };
          State.data.settings = { ...DEFAULT_DATA.settings, ...imported.settings };
          Streaks.recompute();
          State.save();
          App.applySettings();
          App.refreshAll();
          UI.toast('Data imported successfully', 'success');
        });
      } catch (err) {
        UI.toast('Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  },
  clear() {
    UI.confirm('This will permanently delete all your data. Continue?').then(ok => {
      if (!ok) return;
      State.reset();
      App.applySettings();
      App.refreshAll();
      UI.toast('All data cleared', 'success');
    });
  }
};

// ---------- App ----------
const App = {
  currentSection: 'dashboard',
  init() {
    State.load();
    this.applySettings();
    Dashboard.init();
    Subjects.init();
    Timer.init();
    Tasks.init();
    Calendar.init();
    Notes.init();
    Analytics.init();
    Achievements.init();
    StreaksUI.init();
    Goals.init();
    Flashcards.init();
    Planner.init();
    Settings.init();
    document.querySelectorAll('[data-section]').forEach(el => {
      el.onclick = (e) => {
        e.preventDefault();
        this.navigate(el.dataset.section);
      };
    });
    document.getElementById('menuToggle').onclick = () => this.toggleSidebar(true);
    document.getElementById('sidebarClose').onclick = () => this.toggleSidebar(false);
    document.getElementById('sidebarOverlay').onclick = () => this.toggleSidebar(false);
    document.getElementById('moreBtn').onclick = (e) => {
      e.preventDefault();
      document.getElementById('moreMenu').classList.add('show');
    };
    document.getElementById('closeMore').onclick = () => document.getElementById('moreMenu').classList.remove('show');
    document.querySelectorAll('.more-item').forEach(item => {
      item.onclick = (e) => {
        e.preventDefault();
        document.getElementById('moreMenu').classList.remove('show');
        this.navigate(item.dataset.section);
      };
    });
    document.getElementById('themeToggle').onclick = () => {
      const newTheme = State.data.settings.theme === 'dark' ? 'light' : 'dark';
      Settings.setTheme(newTheme);
    };
    document.getElementById('accentBtn').onclick = (e) => {
      e.stopPropagation();
      document.getElementById('accentDropdown').classList.toggle('show');
    };
    document.querySelectorAll('.accent-opt').forEach(b => {
      b.onclick = () => {
        Settings.setAccent(b.dataset.accent);
        document.getElementById('accentDropdown').classList.remove('show');
      };
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.accent-wrap')) {
        document.getElementById('accentDropdown').classList.remove('show');
      }
    });
    document.getElementById('tipBtn').onclick = () => {
      const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
      UI.toast(tip, 'info', 6000);
    };
    document.getElementById('focusBtn').onclick = () => {
      document.body.classList.toggle('focus-mode');
      const isFocus = document.body.classList.contains('focus-mode');
      UI.toast(isFocus ? 'Focus mode on. Stay concentrated!' : 'Focus mode off', 'info');
      if (isFocus && document.body.requestFullscreen) document.body.requestFullscreen().catch(() => {});
      else if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
    document.getElementById('ambienceBtn').onclick = (e) => {
      State.data.settings.ambience = !State.data.settings.ambience;
      if (State.data.settings.ambience) {
        AudioMgr.startAmbience();
        e.currentTarget.classList.add('active');
        UI.toast('Ambience sound on', 'info');
      } else {
        AudioMgr.stopAmbience();
        e.currentTarget.classList.remove('active');
        UI.toast('Ambience sound off', 'info');
      }
      State.save();
    };
    document.getElementById('modalClose').onclick = () => UI.closeModal();
    document.getElementById('modalBackdrop').onclick = () => UI.closeModal();
    const search = document.getElementById('globalSearch');
    search.oninput = (e) => this.globalSearch(e.target.value);
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    Achievements.check();
    this.refreshAll();
    setTimeout(() => {
      document.getElementById('loader').classList.add('hide');
    }, 800);
  },
  applySettings() {
    const s = State.data.settings;
    document.documentElement.setAttribute('data-theme', s.theme);
    document.documentElement.setAttribute('data-accent', s.accent);
    document.documentElement.setAttribute('data-fontsize', s.fontSize);
    document.getElementById('themeToggle').innerHTML = s.theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    if (s.ambience) {
      AudioMgr.startAmbience();
      document.getElementById('ambienceBtn').classList.add('active');
    }
  },
  navigate(section) {
    this.currentSection = section;
    document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === section));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
    document.querySelectorAll('.bn-item').forEach(n => n.classList.toggle('active', n.dataset.section === section));
    this.refreshAll();
    this.toggleSidebar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  refreshAll() {
    Dashboard.render();
    Subjects.render();
    Timer.render();
    Tasks.render();
    Calendar.render();
    Notes.render();
    Analytics.render();
    Achievements.render();
    StreaksUI.render();
    Goals.render();
    Flashcards.render();
    Planner.render();
    Settings.render();
  },
  toggleSidebar(open) {
    document.getElementById('sidebar').classList.toggle('open', open);
    document.getElementById('sidebarOverlay').classList.toggle('show', open);
  },
  handleKeyboard(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.key === '/') { e.preventDefault(); document.getElementById('globalSearch').focus(); }
    else if (e.key === 't' || e.key === 'T') { Settings.setTheme(State.data.settings.theme === 'dark' ? 'light' : 'dark'); }
    else if (e.key === 'Escape') { UI.closeModal(); document.getElementById('moreMenu').classList.remove('show'); }
    else if (e.key === ' ' && this.currentSection === 'timer') { e.preventDefault(); Timer.toggle(); }
    else if (e.key === 'ArrowRight' && this.currentSection === 'flashcards') { Flashcards.next(); }
    else if (e.key === 'ArrowLeft' && this.currentSection === 'flashcards') { Flashcards.prev(); }
    else if (e.key >= '1' && e.key <= '9') {
      const sections = ['dashboard', 'subjects', 'timer', 'tasks', 'calendar', 'notes', 'analytics', 'achievements', 'streaks'];
      const idx = parseInt(e.key) - 1;
      if (sections[idx]) this.navigate(sections[idx]);
    }
  },
  globalSearch(query) {
    const input = document.getElementById('globalSearch');
    // FIX 7: Always reset the keydown handler first. Previously, if the user
    // typed a query that found results and then edited it to find nothing, the
    // old handler stayed active and pressing Enter would navigate to a stale
    // section. Now the handler is cleared before evaluating new results.
    input.onkeydown = null;
    if (!query.trim()) return;
    const q = query.toLowerCase();
    const results = [];
    State.data.notes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))
        results.push({ type: 'Note', title: n.title, section: 'notes' });
    });
    State.data.tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q))
        results.push({ type: 'Task', title: t.title, section: 'tasks' });
    });
    State.data.subjects.forEach(s => {
      if (s.name.toLowerCase().includes(q))
        results.push({ type: 'Subject', title: s.name, section: 'subjects' });
    });
    State.data.flashcards.forEach(c => {
      if (c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q))
        results.push({ type: 'Flashcard', title: c.front, section: 'flashcards' });
    });
    if (results.length > 0) {
      input.onkeydown = (ev) => {
        if (ev.key === 'Enter') {
          this.navigate(results[0].section);
          input.value = '';
          input.onkeydown = null;
        }
      };
    }
  }
};

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => App.init());
