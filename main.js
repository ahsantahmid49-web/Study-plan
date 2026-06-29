// script.js
// ===== StudyFlow Application =====

// ---------- Guard: Chart.js fallback ----------
if (typeof Chart === 'undefined') {
  console.warn('Chart.js not loaded. Charts will be disabled.');
  window.Chart = function() { return { destroy: function() {} }; };
}

// ---------- Constants ----------
var QUOTES = [
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
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" }
];

var TIPS = [
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

var ACHIEVEMENTS_DEF = [
  { id: 'first_session', name: 'First Step', desc: 'Complete your first study session', icon: 'fa-shoe-prints', check: function(d) { return d.sessions.length >= 1; } },
  { id: 'five_sessions', name: 'Getting Started', desc: 'Complete 5 study sessions', icon: 'fa-seedling', check: function(d) { return d.sessions.length >= 5; } },
  { id: 'ten_sessions', name: 'Building Momentum', desc: 'Complete 10 study sessions', icon: 'fa-leaf', check: function(d) { return d.sessions.length >= 10; } },
  { id: 'five_hour_day', name: 'Powerhouse', desc: 'Study 5 hours in a single day', icon: 'fa-bolt', check: function(d) { return dailyHoursMax(d) >= 5; } },
  { id: 'seven_day_streak', name: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: 'fa-shield-halved', check: function(d) { return d.streak.longest >= 7; } },
  { id: 'thirty_day_streak', name: 'Unstoppable', desc: 'Maintain a 30-day streak', icon: 'fa-fire', check: function(d) { return d.streak.longest >= 30; } },
  { id: 'hundred_hours', name: 'Century Scholar', desc: 'Study for 100 total hours', icon: 'fa-hourglass-half', check: function(d) { return totalHours(d) >= 100; } },
  { id: 'all_tasks', name: 'Task Master', desc: 'Complete all tasks in a day', icon: 'fa-check-double', check: function(d) { return d.tasks.length >= 3 && d.tasks.every(function(t) { return t.completed; }); } },
  { id: 'five_subjects', name: 'Polymath', desc: 'Create 5 study subjects', icon: 'fa-book-open', check: function(d) { return d.subjects.length >= 5; } },
  { id: 'first_note', name: 'Note Taker', desc: 'Create your first note', icon: 'fa-pen', check: function(d) { return d.notes.length >= 1; } },
  { id: 'ten_notes', name: 'Scholar', desc: 'Create 10 notes', icon: 'fa-feather', check: function(d) { return d.notes.length >= 10; } },
  { id: 'flashcard_master', name: 'Card Master', desc: 'Create 20 flashcards', icon: 'fa-layer-group', check: function(d) { return d.flashcards.length >= 20; } },
  { id: 'early_bird', name: 'Early Bird', desc: 'Study before 8 AM', icon: 'fa-mug-hot', check: function(d) { return d.sessions.some(function(s) { return new Date(s.date).getHours() < 8; }); } },
  { id: 'night_owl', name: 'Night Owl', desc: 'Study after 10 PM', icon: 'fa-moon', check: function(d) { return d.sessions.some(function(s) { return new Date(s.date).getHours() >= 22; }); } },
  { id: 'goal_crusher', name: 'Goal Crusher', desc: 'Complete 10 goals', icon: 'fa-bullseye', check: function(d) { return d.goals.filter(function(g) { return g.completed; }).length >= 10; } }
];

var SUBJECT_ICONS = ['fa-book', 'fa-calculator', 'fa-flask', 'fa-atom', 'fa-dna', 'fa-microscope', 'fa-laptop-code', 'fa-language', 'fa-palette', 'fa-music', 'fa-earth-americas', 'fa-square-root-variable', 'fa-code', 'fa-brain', 'fa-heart-pulse', 'fa-landmark'];

var SUBJECT_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6', '#84cc16', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7', '#eab308'];

// ---------- State ----------
var State = {
  data: null,
  load: function() {
    try {
      var saved = localStorage.getItem('studyflow_data');
      if (saved) {
        var parsed = JSON.parse(saved);
        this.data = this.mergeDefaults(parsed);
      } else {
        this.data = this.getDefaults();
        this.seedDemoData();
      }
    } catch (e) {
      console.error('Load error:', e);
      this.data = this.getDefaults();
      this.seedDemoData();
    }
  },
  mergeDefaults: function(saved) {
    var defaults = this.getDefaults();
    return {
      subjects: saved.subjects || defaults.subjects,
      sessions: saved.sessions || [],
      tasks: saved.tasks || [],
      notes: saved.notes || [],
      calendarNotes: saved.calendarNotes || {},
      goals: saved.goals || [],
      flashcards: saved.flashcards || defaults.flashcards,
      achievements: saved.achievements || [],
      streak: Object.assign({}, defaults.streak, saved.streak || {}),
      settings: Object.assign({}, defaults.settings, saved.settings || {}),
      planner: saved.planner || [],
      currentCardIndex: 0,
      currentGoalTab: saved.currentGoalTab || 'daily'
    };
  },
  getDefaults: function() {
    return {
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
        { id: 'f3', front: 'What is Newton\'s second law?', back: 'F = ma (Force = mass × acceleration)', difficult: true }
      ],
      achievements: [],
      streak: { current: 0, longest: 0, lastStudyDate: null, history: [] },
      settings: { theme: 'dark', accent: 'emerald', fontSize: 'medium', ambience: false },
      planner: [],
      currentCardIndex: 0,
      currentGoalTab: 'daily'
    };
  },
  save: function() {
    try {
      localStorage.setItem('studyflow_data', JSON.stringify(this.data));
    } catch (e) { console.error('Save error:', e); }
  },
  reset: function() {
    this.data = this.getDefaults();
    this.seedDemoData();
    this.save();
  },
  seedDemoData: function() {
    var now = new Date();
    var subjectIds = this.data.subjects.map(function(s) { return s.id; });
    var sessions = [];
    for (var i = 6; i >= 0; i--) {
      var day = new Date(now);
      day.setDate(now.getDate() - i);
      var numSessions = i === 0 ? 1 : Math.floor(Math.random() * 3) + 1;
      for (var j = 0; j < numSessions; j++) {
        var hour = 9 + j * 3 + Math.floor(Math.random() * 2);
        var start = new Date(day);
        start.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
        var duration = 25 + Math.floor(Math.random() * 35);
        sessions.push({
          id: 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2),
          subjectId: subjectIds[Math.floor(Math.random() * subjectIds.length)],
          duration: duration,
          date: start.toISOString(),
          startTime: start.toISOString()
        });
      }
    }
    this.data.sessions = sessions;
    var self = this;
    this.data.subjects.forEach(function(s) {
      s.totalHours = sessions.filter(function(x) { return x.subjectId === s.id; }).reduce(function(sum, x) { return sum + x.duration; }, 0) / 60;
    });
    Streaks.recompute();
    this.data.tasks = [
      { id: 't1', title: 'Review calculus derivatives', priority: 'high', completed: true, subjectId: 's1', date: new Date().toISOString() },
      { id: 't2', title: 'Solve physics problem set 3', priority: 'medium', completed: false, subjectId: 's2', date: new Date().toISOString() },
      { id: 't3', title: 'Read chapter 5 of algorithms book', priority: 'low', completed: false, subjectId: 's3', date: new Date().toISOString() }
    ];
    this.data.notes = [
      { id: 'n1', title: 'Calculus Key Formulas', content: 'Power Rule: d/dx(x^n) = nx^(n-1)\nChain Rule: d/dx(f(g(x))) = f\'(g(x))·g\'(x)\nProduct Rule: d/dx(f·g) = f\'·g + f·g\'', pinned: true, date: new Date().toISOString() },
      { id: 'n2', title: 'Physics Laws', content: 'Newton\'s 1st Law: An object at rest stays at rest unless acted upon by a force.\nNewton\'s 2nd Law: F = ma\nNewton\'s 3rd Law: For every action, there is an equal and opposite reaction.', pinned: false, date: new Date().toISOString() }
    ];
    this.data.goals = [
      { id: 'g1', title: 'Study 4 hours today', type: 'daily', target: 4, progress: 2.5, completed: false },
      { id: 'g2', title: 'Complete 3 chapters this week', type: 'weekly', target: 3, progress: 1, completed: false },
      { id: 'g3', title: 'Finish course this month', type: 'monthly', target: 1, progress: 0.3, completed: false }
    ];
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
function uid(prefix) { return (prefix || 'id') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }
function todayKey() { return new Date().toISOString().split('T')[0]; }
function dateKey(d) {
  var dt = new Date(d);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
}
function fmtDate(d, opts) { return new Date(d).toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric', year: 'numeric' }); }
function fmtTime(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function fmtDuration(min) {
  if (min < 60) return min + 'm';
  var h = Math.floor(min / 60);
  var m = Math.round(min % 60);
  return m === 0 ? h + 'h' : h + 'h ' + m + 'm';
}
function totalHours(d) { return d.sessions.reduce(function(s, x) { return s + x.duration; }, 0) / 60; }
function dailyHoursMax(d) {
  var byDay = {};
  d.sessions.forEach(function(s) {
    var k = dateKey(s.date);
    byDay[k] = (byDay[k] || 0) + s.duration;
  });
  var vals = Object.keys(byDay).map(function(k) { return byDay[k]; });
  return vals.length > 0 ? Math.max.apply(null, vals) / 60 : 0;
}
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good morning, scholar';
  if (h < 18) return 'Good afternoon, scholar';
  return 'Good evening, scholar';
}
function getAccentColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#10b981';
}

// ---------- UI ----------
var UI = {
  toast: function(msg, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var icons = { success: 'fa-check-circle', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + escapeHtml(msg) + '</span>';
    container.appendChild(toast);
    setTimeout(function() {
      toast.classList.add('hide');
      setTimeout(function() { toast.remove(); }, 300);
    }, duration);
  },
  modal: function(title, bodyHTML) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHTML;
    document.getElementById('modal').classList.add('show');
    document.getElementById('modalBackdrop').classList.add('show');
  },
  closeModal: function() {
    document.getElementById('modal').classList.remove('show');
    document.getElementById('modalBackdrop').classList.remove('show');
  },
  confirm: function(message, callback) {
    var self = this;
    this.modal('Confirm', 
      '<p style="margin-bottom:20px;color:var(--text-secondary)">' + escapeHtml(message) + '</p>' +
      '<div class="modal-actions">' +
        '<button class="btn-secondary" id="confirmCancel">Cancel</button>' +
        '<button class="btn-danger" id="confirmOk">Confirm</button>' +
      '</div>'
    );
    document.getElementById('confirmCancel').onclick = function() { self.closeModal(); callback(false); };
    document.getElementById('confirmOk').onclick = function() { self.closeModal(); callback(true); };
  },
  emptyState: function(icon, message) {
    return '<div class="empty-state"><i class="fas ' + icon + '"></i><p>' + escapeHtml(message) + '</p></div>';
  }
};

// ---------- Audio ----------
var AudioMgr = {
  ctx: null,
  ambienceNode: null,
  init: function() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { console.warn('AudioContext not available'); } } },
  beep: function() {
    this.init();
    if (!this.ctx) return;
    var now = this.ctx.currentTime;
    var freqs = [800, 1000, 800];
    for (var i = 0; i < freqs.length; i++) {
      (function(freq, delay) {
        var osc = AudioMgr.ctx.createOscillator();
        var gain = AudioMgr.ctx.createGain();
        osc.connect(gain); gain.connect(AudioMgr.ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
        osc.start(now + delay);
        osc.stop(now + delay + 0.2);
      })(freqs[i], i * 0.2);
    }
  },
  startAmbience: function() {
    this.init();
    if (!this.ctx || this.ambienceNode) return;
    var bufferSize = 2 * this.ctx.sampleRate;
    var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    var output = buffer.getChannelData(0);
    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    var source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    var gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    var filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    source.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    source.start();
    this.ambienceNode = { source: source, gain: gain };
  },
  stopAmbience: function() {
    if (this.ambienceNode) {
      try { this.ambienceNode.source.stop(); } catch(e) {}
      this.ambienceNode = null;
    }
  }
};

// ---------- Streaks Logic ----------
var Streaks = {
  recompute: function() {
    var d = State.data;
    var studyDays = {};
    d.sessions.forEach(function(s) {
      var k = dateKey(s.date);
      studyDays[k] = true;
    });
    var sortedDays = Object.keys(studyDays).sort();
    if (sortedDays.length === 0) {
      d.streak.current = 0; d.streak.longest = 0; d.streak.history = [];
      return;
    }
    d.streak.history = sortedDays;
    var longest = 1, current = 1;
    for (var i = 1; i < sortedDays.length; i++) {
      var prev = new Date(sortedDays[i - 1]);
      var curr = new Date(sortedDays[i]);
      var diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) { current++; longest = Math.max(longest, current); }
      else { current = 1; }
    }
    d.streak.longest = longest;
    var today = todayKey();
    var yesterday = dateKey(new Date(Date.now() - 86400000));
    if (studyDays[today]) {
      var cur = 1;
      var dt = new Date();
      for (var j = 1; j < 365; j++) {
        dt = new Date(dt.getTime() - 86400000);
        if (studyDays[dateKey(dt)]) cur++;
        else break;
      }
      d.streak.current = cur;
    } else if (studyDays[yesterday]) {
      var cur2 = 0;
      var dt2 = new Date();
      for (var k = 1; k < 365; k++) {
        dt2 = new Date(dt2.getTime() - 86400000);
        if (studyDays[dateKey(dt2)]) cur2++;
        else break;
      }
      d.streak.current = cur2;
    } else {
      d.streak.current = 0;
    }
  },
  missedDays30: function() {
    var studyDays = {};
    State.data.sessions.forEach(function(s) { studyDays[dateKey(s.date)] = true; });
    var missed = 0;
    for (var i = 0; i < 30; i++) {
      var dt = new Date(Date.now() - i * 86400000);
      if (!studyDays[dateKey(dt)]) missed++;
    }
    return missed;
  }
};

// ---------- Dashboard ----------
var Dashboard = {
  charts: {},
  clockInterval: null,
  init: function() {
    var self = this;
    this.render();
    this.clockInterval = setInterval(function() { self.updateClock(); }, 1000);
    document.getElementById('newTipBtn').onclick = function() { self.setTip(); };
    document.querySelectorAll('.qa-btn').forEach(function(btn) {
      btn.onclick = function() {
        var a = btn.dataset.action;
        if (a === 'start-timer') App.navigate('timer');
        else if (a === 'add-task') { App.navigate('tasks'); setTimeout(function() { document.getElementById('taskInput').focus(); }, 200); }
        else if (a === 'add-note') Notes.openEditor();
        else if (a === 'add-flashcard') { App.navigate('flashcards'); setTimeout(function() { Flashcards.openEditor(); }, 200); }
      };
    });
  },
  render: function() {
    document.getElementById('heroGreeting').textContent = getGreeting();
    var now = new Date();
    document.getElementById('heroDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    this.updateClock();
    var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.querySelector('#heroQuote p').textContent = '"' + q.text + '" — ' + q.author;
    this.setTip();
    this.renderStats();
    this.renderWeekChart();
    this.renderMiniHeatmap();
  },
  updateClock: function() {
    var now = new Date();
    var ct = document.getElementById('clockTime');
    var cd = document.getElementById('clockDate');
    if (ct) ct.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (cd) cd.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  },
  setTip: function() {
    document.getElementById('dashTip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  },
  renderStats: function() {
    var d = State.data;
    var today = todayKey();
    var todaySessions = d.sessions.filter(function(s) { return dateKey(s.date) === today; });
    var todayMin = todaySessions.reduce(function(sum, s) { return sum + s.duration; }, 0);
    document.getElementById('statTodayHours').textContent = (todayMin / 60).toFixed(1) + 'h';
    document.getElementById('statTodaySessions').textContent = todaySessions.length + ' sessions';
    var weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    var weekSessions = d.sessions.filter(function(s) { return new Date(s.date) >= weekStart; });
    var weekMin = weekSessions.reduce(function(sum, s) { return sum + s.duration; }, 0);
    document.getElementById('statWeekHours').textContent = (weekMin / 60).toFixed(1) + 'h';
    document.getElementById('statWeekSessions').textContent = weekSessions.length + ' sessions';
    var totalMin = d.sessions.reduce(function(sum, s) { return sum + s.duration; }, 0);
    document.getElementById('statTotalHours').textContent = (totalMin / 60).toFixed(1) + 'h';
    document.getElementById('statTotalSessions').textContent = d.sessions.length + ' sessions';
    var completedSubjects = d.subjects.filter(function(s) {
      var weeklyMin = d.sessions.filter(function(x) { return x.subjectId === s.id && new Date(x.date) >= weekStart; }).reduce(function(sum, x) { return sum + x.duration; }, 0);
      return weeklyMin >= s.weeklyGoal * 60;
    }).length;
    document.getElementById('statSubjectsDone').textContent = completedSubjects;
    document.getElementById('statSubjectsTotal').textContent = 'of ' + d.subjects.length + ' subjects';
    var dailyGoals = d.goals.filter(function(g) { return g.type === 'daily'; });
    var completedDaily = dailyGoals.filter(function(g) { return g.completed; }).length;
    var tasksToday = d.tasks.filter(function(t) { return dateKey(t.date) === today; });
    var tasksDone = tasksToday.filter(function(t) { return t.completed; }).length;
    var overallPct = tasksToday.length > 0 ? Math.round((tasksDone / tasksToday.length) * 100) : 0;
    document.getElementById('overallProgress').style.width = overallPct + '%';
    document.getElementById('overallBadge').textContent = overallPct + '%';
    document.getElementById('overallMeta').textContent = tasksDone + ' / ' + tasksToday.length + ' tasks today';
    var productivity = this.computeProductivity();
    document.getElementById('productivityScore').textContent = productivity;
    var circumference = 2 * Math.PI * 52;
    document.getElementById('productivityRing').style.strokeDashoffset = circumference - (productivity / 100) * circumference;
    document.getElementById('sidebarStreak').textContent = d.streak.current;
    document.getElementById('dashStreak').textContent = d.streak.current + ' days';
  },
  computeProductivity: function() {
    var d = State.data;
    var score = 0;
    score += Math.min(30, d.streak.current * 4);
    var todayMin = d.sessions.filter(function(s) { return dateKey(s.date) === todayKey(); }).reduce(function(sum, s) { return sum + s.duration; }, 0);
    score += Math.min(30, (todayMin / 60) * 6);
    var todayTasks = d.tasks.filter(function(t) { return dateKey(t.date) === todayKey(); });
    if (todayTasks.length > 0) {
      score += Math.round((todayTasks.filter(function(t) { return t.completed; }).length / todayTasks.length) * 20);
    }
    var dailyGoals = d.goals.filter(function(g) { return g.type === 'daily'; });
    if (dailyGoals.length > 0) {
      var avgProgress = dailyGoals.reduce(function(sum, g) { return sum + Math.min(100, (g.progress / g.target) * 100); }, 0) / dailyGoals.length;
      score += Math.round((avgProgress / 100) * 20);
    }
    return Math.min(100, Math.round(score));
  },
  renderWeekChart: function() {
    var ctx = document.getElementById('weekChart');
    if (!ctx) return;
    if (this.charts.week) this.charts.week.destroy();
    var labels = [];
    var data = [];
    for (var i = 6; i >= 0; i--) {
      var dt = new Date(Date.now() - i * 86400000);
      labels.push(dt.toLocaleDateString('en-US', { weekday: 'short' }));
      var min = State.data.sessions.filter(function(s) { return dateKey(s.date) === dateKey(dt); }).reduce(function(sum, s) { return sum + s.duration; }, 0);
      data.push((min / 60).toFixed(2));
    }
    this.charts.week = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: getAccentColor(),
          borderRadius: 8,
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#9ca3af', callback: function(v) { return v + 'h'; } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
        }
      }
    });
  },
  renderMiniHeatmap: function() {
    var container = document.getElementById('dashHeatmap');
    if (!container) return;
    container.innerHTML = '';
    var studyDays = {};
    State.data.sessions.forEach(function(s) {
      var k = dateKey(s.date);
      studyDays[k] = (studyDays[k] || 0) + s.duration;
    });
    for (var i = 44; i >= 0; i--) {
      var dt = new Date(Date.now() - i * 86400000);
      var k = dateKey(dt);
      var min = studyDays[k] || 0;
      var cell = document.createElement('div');
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
var Subjects = {
  init: function() {
    document.getElementById('addSubjectBtn').onclick = function() { Subjects.openEditor(); };
  },
  render: function() {
    var grid = document.getElementById('subjectsGrid');
    if (!grid) return;
    var d = State.data;
    if (d.subjects.length === 0) {
      grid.innerHTML = UI.emptyState('fa-book', 'No subjects yet. Add your first subject to start tracking!');
      return;
    }
    var weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    grid.innerHTML = d.subjects.map(function(s) {
      var weeklyMin = d.sessions.filter(function(x) { return x.subjectId === s.id && new Date(x.date) >= weekStart; }).reduce(function(sum, x) { return sum + x.duration; }, 0);
      var goalMin = s.weeklyGoal * 60;
      var pct = goalMin > 0 ? Math.min(100, Math.round((weeklyMin / goalMin) * 100)) : 0;
      var totalSessions = d.sessions.filter(function(x) { return x.subjectId === s.id; }).length;
      return '<div class="subject-card" style="--subject-color:' + s.color + '">' +
        '<div class="subject-head">' +
          '<div class="subject-icon-wrap"><i class="fas ' + s.icon + '"></i></div>' +
          '<div class="subject-actions">' +
            '<button onclick="Subjects.openEditor(\'' + s.id + '\')" title="Edit"><i class="fas fa-pen"></i></button>' +
            '<button class="del" onclick="Subjects.delete(\'' + s.id + '\')" title="Delete"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</div>' +
        '<div class="subject-name">' + escapeHtml(s.name) + '</div>' +
        '<div class="subject-meta">' + totalSessions + ' sessions · ' + s.totalHours.toFixed(1) + 'h total</div>' +
        '<div class="subject-progress-text"><span>Weekly goal</span><span><strong>' + fmtDuration(weeklyMin) + '</strong> / ' + s.weeklyGoal + 'h</span></div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%; background:linear-gradient(90deg, ' + s.color + ', ' + s.color + 'aa)"></div></div>' +
        '<div class="subject-progress-text" style="margin-top:6px"><span></span><span>' + pct + '%</span></div>' +
      '</div>';
    }).join('');
  },
  openEditor: function(id) {
    var d = State.data;
    var subj = id ? d.subjects.find(function(s) { return s.id === id; }) : null;
    var colorHTML = SUBJECT_COLORS.map(function(c) {
      return '<button class="color-opt ' + (subj && subj.color === c ? 'active' : '') + '" data-color="' + c + '" style="--c:' + c + '"></button>';
    }).join('');
    var iconHTML = SUBJECT_ICONS.map(function(ic) {
      return '<button class="icon-opt ' + (subj && subj.icon === ic ? 'active' : '') + '" data-icon="' + ic + '"><i class="fas ' + ic + '"></i></button>';
    }).join('');
    UI.modal(id ? 'Edit Subject' : 'Add Subject',
      '<div class="form-group"><label>Subject Name</label><input type="text" id="subjName" value="' + (subj ? escapeHtml(subj.name) : '') + '" placeholder="e.g. Biology"></div>' +
      '<div class="form-group"><label>Weekly Goal (hours)</label><input type="number" id="subjGoal" min="1" max="100" value="' + (subj ? subj.weeklyGoal : 5) + '"></div>' +
      '<div class="form-group"><label>Color</label><div class="color-picker" id="colorPicker">' + colorHTML + '</div></div>' +
      '<div class="form-group"><label>Icon</label><div class="icon-picker" id="iconPicker">' + iconHTML + '</div></div>' +
      '<div class="modal-actions"><button class="btn-secondary" onclick="UI.closeModal()">Cancel</button><button class="btn-primary" id="saveSubject">' + (id ? 'Save' : 'Add Subject') + '</button></div>'
    );
    var chosenColor = subj ? subj.color : SUBJECT_COLORS[0];
    var chosenIcon = subj ? subj.icon : SUBJECT_ICONS[0];
    document.querySelectorAll('#colorPicker .color-opt').forEach(function(b) {
      b.onclick = function() {
        document.querySelectorAll('#colorPicker .color-opt').forEach(function(x) { x.classList.remove('active'); });
        b.classList.add('active');
        chosenColor = b.dataset.color;
      };
    });
    document.querySelectorAll('#iconPicker .icon-opt').forEach(function(b) {
      b.onclick = function() {
        document.querySelectorAll('#iconPicker .icon-opt').forEach(function(x) { x.classList.remove('active'); });
        b.classList.add('active');
        chosenIcon = b.dataset.icon;
      };
    });
    document.getElementById('saveSubject').onclick = function() {
      var name = document.getElementById('subjName').value.trim();
      var goal = parseInt(document.getElementById('subjGoal').value) || 5;
      if (!name) { UI.toast('Please enter a subject name', 'error'); return; }
      if (id) {
        var s = State.data.subjects.find(function(x) { return x.id === id; });
        s.name = name; s.color = chosenColor; s.icon = chosenIcon; s.weeklyGoal = goal;
        UI.toast('Subject updated', 'success');
      } else {
        State.data.subjects.push({ id: uid('s'), name: name, color: chosenColor, icon: chosenIcon, weeklyGoal: goal, totalHours: 0 });
        UI.toast('Subject added', 'success');
      }
      State.save();
      UI.closeModal();
      Subjects.render();
      Achievements.check();
      App.refreshAll();
    };
  },
  delete: function(id) {
    UI.confirm('Delete this subject? Related sessions will remain but unlinked.', function(ok) {
      if (!ok) return;
      State.data.subjects = State.data.subjects.filter(function(s) { return s.id !== id; });
      State.save();
      Subjects.render();
      App.refreshAll();
      UI.toast('Subject deleted', 'success');
    });
  }
};

// ---------- Timer ----------
var Timer = {
  mode: 'pomodoro',
  duration: 25 * 60,
  remaining: 25 * 60,
  isRunning: false,
  isPaused: false,
  interval: null,
  phase: 'focus',
  selectedSubject: null,
  init: function() {
    var self = this;
    document.querySelectorAll('.mode-btn').forEach(function(b) {
      b.onclick = function() { self.setMode(b.dataset.mode); };
    });
    document.getElementById('timerStart').onclick = function() { self.toggle(); };
    document.getElementById('timerReset').onclick = function() { self.reset(); };
    document.getElementById('timerStop').onclick = function() { self.stop(); };
    document.getElementById('timerSubject').onchange = function(e) { self.selectedSubject = e.target.value; };
  },
  render: function() {
    var sel = document.getElementById('timerSubject');
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = State.data.subjects.map(function(s) { return '<option value="' + s.id + '">' + escapeHtml(s.name) + '</option>'; }).join('');
    if (current && State.data.subjects.find(function(s) { return s.id === current; })) sel.value = current;
    this.selectedSubject = sel.value;
    this.updateDisplay();
    this.renderHistory();
  },
  setMode: function(mode) {
    this.mode = mode;
    var self = this;
    document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.mode === mode); });
    document.getElementById('customTimer').style.display = mode === 'custom' ? 'flex' : 'none';
    var presets = { pomodoro: 25, short: 15, long: 50 };
    var mins = mode === 'custom' ? (parseInt(document.getElementById('customMinutes').value) || 30) : presets[mode];
    this.duration = mins * 60;
    this.remaining = mins * 60;
    this.phase = 'focus';
    this.updateDisplay();
  },
  toggle: function() {
    if (this.isRunning && !this.isPaused) this.pause();
    else this.start();
  },
  start: function() {
    var self = this;
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
      var mins = parseInt(document.getElementById('customMinutes').value) || 30;
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
  pause: function() {
    this.isPaused = true;
    clearInterval(this.interval);
    document.getElementById('timerStart').innerHTML = '<i class="fas fa-play"></i> Resume';
    UI.toast('Timer paused', 'info');
  },
  stop: function() {
    if (this.isRunning) {
      var elapsed = this.duration - this.remaining;
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
  reset: function() {
    clearInterval(this.interval);
    this.isRunning = false;
    this.isPaused = false;
    this.remaining = this.duration;
    this.phase = 'focus';
    this.updateDisplay();
    document.getElementById('timerStart').innerHTML = '<i class="fas fa-play"></i> Start';
  },
  tick: function() {
    var self = this;
    clearInterval(this.interval);
    this.interval = setInterval(function() {
      self.remaining--;
      self.updateDisplay();
      if (self.remaining <= 0) {
        clearInterval(self.interval);
        self.complete();
      }
    }, 1000);
  },
  complete: function() {
    var self = this;
    AudioMgr.beep();
    var elapsed = this.duration;
    this.logSession(elapsed);
    UI.toast((this.phase === 'focus' ? 'Focus' : 'Break') + ' session complete! 🎉', 'success');
    if (this.phase === 'focus') {
      var breakMins = this.mode === 'custom' ? (parseInt(document.getElementById('customBreak').value) || 5) : (this.mode === 'pomodoro' ? 5 : this.mode === 'short' ? 3 : 10);
      this.phase = 'break';
      this.duration = breakMins * 60;
      this.remaining = breakMins * 60;
      this.updateDisplay();
      UI.toast('Break time! Take a rest.', 'info');
      this.tick();
    } else {
      this.phase = 'focus';
      this.reset();
    }
  },
  logSession: function(seconds) {
    if (!this.selectedSubject) return;
    var session = {
      id: uid('sess'),
      subjectId: this.selectedSubject,
      duration: Math.round(seconds / 60),
      date: new Date().toISOString(),
      startTime: new Date(Date.now() - seconds * 1000).toISOString()
    };
    State.data.sessions.push(session);
    var subj = State.data.subjects.find(function(s) { return s.id === self.selectedSubject; });
    if (subj) subj.totalHours += session.duration / 60;
    Streaks.recompute();
    State.save();
    this.renderHistory();
    App.refreshAll();
    Achievements.check();
  },
  updateDisplay: function() {
    var mins = Math.floor(this.remaining / 60);
    var secs = this.remaining % 60;
    document.getElementById('timerMinutes').textContent = String(mins).padStart(2, '0');
    document.getElementById('timerSeconds').textContent = String(secs).padStart(2, '0');
    document.getElementById('timerPhase').textContent = this.phase === 'focus' ? 'Focus' : 'Break';
    var circumference = 2 * Math.PI * 90;
    var progress = (this.duration - this.remaining) / this.duration;
    document.getElementById('timerRing').style.strokeDashoffset = circumference * progress;
  },
  renderHistory: function() {
    var list = document.getElementById('sessionList');
    if (!list) return;
    var sessions = State.data.sessions.slice().reverse().slice(0, 30);
    document.getElementById('sessionCount').textContent = State.data.sessions.length;
    if (sessions.length === 0) {
      list.innerHTML = UI.emptyState('fa-history', 'No sessions yet. Start studying!');
      return;
    }
    list.innerHTML = sessions.map(function(s) {
      var subj = State.data.subjects.find(function(x) { return x.id === s.subjectId; });
      var color = subj ? subj.color : '#888';
      var name = subj ? subj.name : 'Unknown';
      return '<div class="session-item">' +
        '<div class="session-dot" style="background:' + color + '"></div>' +
        '<div class="session-info"><div class="session-subject">' + escapeHtml(name) + '</div>' +
        '<div class="session-time">' + fmtDate(s.date, { month: 'short', day: 'numeric' }) + ' · ' + fmtTime(s.date) + '</div></div>' +
        '<div class="session-duration">' + fmtDuration(s.duration) + '</div>' +
      '</div>';
    }).join('');
  }
};

// ---------- Tasks ----------
var Tasks = {
  filter: 'all',
  init: function() {
    var self = this;
    document.getElementById('addTaskBtn').onclick = function() { self.add(); };
    document.getElementById('taskInput').addEventListener('keypress', function(e) { if (e.key === 'Enter') self.add(); });
    document.querySelectorAll('.filter-btn').forEach(function(b) {
      b.onclick = function() {
        self.filter = b.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(function(x) { x.classList.toggle('active', x === b); });
        self.render();
      };
    });
  },
  render: function() {
    var sel = document.getElementById('taskSubject');
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = '<option value="">No subject</option>' + State.data.subjects.map(function(s) { return '<option value="' + s.id + '">' + escapeHtml(s.name) + '</option>'; }).join('');
    if (current) sel.value = current;
    var list = document.getElementById('taskList');
    var tasks = State.data.tasks.slice().reverse();
    if (this.filter === 'active') tasks = tasks.filter(function(t) { return !t.completed; });
    else if (this.filter === 'completed') tasks = tasks.filter(function(t) { return t.completed; });
    else if (this.filter === 'high') tasks = tasks.filter(function(t) { return t.priority === 'high'; });
    if (tasks.length === 0) {
      list.innerHTML = UI.emptyState('fa-check-square', 'No tasks here. Add one above!');
    } else {
      list.innerHTML = tasks.map(function(t) {
        var subj = State.data.subjects.find(function(s) { return s.id === t.subjectId; });
        return '<div class="task-item ' + (t.completed ? 'completed' : '') + '">' +
          '<div class="task-check ' + (t.completed ? 'done' : '') + '" onclick="Tasks.toggle(\'' + t.id + '\')">' + (t.completed ? '<i class="fas fa-check"></i>' : '') + '</div>' +
          '<div class="task-content"><div class="task-title">' + escapeHtml(t.title) + '</div>' +
          '<div class="task-meta"><span class="task-priority ' + t.priority + '">' + t.priority + '</span>' +
          (subj ? '<span class="task-subject-tag"><span class="dot" style="background:' + subj.color + '"></span>' + escapeHtml(subj.name) + '</span>' : '') +
          '<span><i class="fas fa-calendar"></i> ' + fmtDate(t.date, { month: 'short', day: 'numeric' }) + '</span></div></div>' +
          '<div class="task-actions"><button onclick="Tasks.edit(\'' + t.id + '\')"><i class="fas fa-pen"></i></button>' +
          '<button class="del" onclick="Tasks.delete(\'' + t.id + '\')"><i class="fas fa-trash"></i></button></div>' +
        '</div>';
      }).join('');
    }
    var all = State.data.tasks;
    var done = all.filter(function(t) { return t.completed; }).length;
    var pct = all.length > 0 ? Math.round((done / all.length) * 100) : 0;
    document.getElementById('taskProgressText').textContent = done + ' / ' + all.length + ' done';
    document.getElementById('taskProgressFill').style.width = pct + '%';
  },
  add: function() {
    var input = document.getElementById('taskInput');
    var title = input.value.trim();
    if (!title) { UI.toast('Enter a task title', 'error'); return; }
    var priority = document.getElementById('taskPriority').value;
    var subjectId = document.getElementById('taskSubject').value;
    State.data.tasks.push({ id: uid('t'), title: title, priority: priority, completed: false, subjectId: subjectId, date: new Date().toISOString() });
    input.value = '';
    State.save();
    this.render();
    App.refreshAll();
    Achievements.check();
    UI.toast('Task added', 'success');
  },
  toggle: function(id) {
    var t = State.data.tasks.find(function(x) { return x.id === id; });
    if (t) {
      t.completed = !t.completed;
      State.save();
      this.render();
      App.refreshAll();
      Achievements.check();
      if (t.completed) UI.toast('Task completed!', 'success');
    }
  },
  edit: function(id) {
    var t = State.data.tasks.find(function(x) { return x.id === id; });
    if (!t) return;
    UI.modal('Edit Task',
      '<div class="form-group"><label>Task Title</label><input type="text" id="editTaskTitle" value="' + escapeHtml(t.title) + '"></div>' +
      '<div class="form-group"><label>Priority</label><select id="editTaskPriority">' +
        '<option value="low" ' + (t.priority === 'low' ? 'selected' : '') + '>Low</option>' +
        '<option value="medium" ' + (t.priority === 'medium' ? 'selected' : '') + '>Medium</option>' +
        '<option value="high" ' + (t.priority === 'high' ? 'selected' : '') + '>High</option>' +
      '</select></div>' +
      '<div class="modal-actions"><button class="btn-secondary" onclick="UI.closeModal()">Cancel</button><button class="btn-primary" id="saveEditTask">Save</button></div>'
    );
    document.getElementById('saveEditTask').onclick = function() {
      t.title = document.getElementById('editTaskTitle').value.trim();
      t.priority = document.getElementById('editTaskPriority').value;
      State.save();
      UI.closeModal();
      Tasks.render();
      UI.toast('Task updated', 'success');
    };
  },
  delete: function(id) {
    State.data.tasks = State.data.tasks.filter(function(t) { return t.id !== id; });
    State.save();
    this.render();
    App.refreshAll();
    UI.toast('Task deleted', 'success');
  }
};

// ---------- Calendar ----------
var Calendar = {
  viewDate: new Date(),
  selectedDate: null,
  init: function() {
    var self = this;
    document.getElementById('calPrev').onclick = function() { self.viewDate.setMonth(self.viewDate.getMonth() - 1); self.render(); };
    document.getElementById('calNext').onclick = function() { self.viewDate.setMonth(self.viewDate.getMonth() + 1); self.render(); };
    document.getElementById('saveCalNote').onclick = function() { self.saveNote(); };
  },
  render: function() {
    var d = State.data;
    document.getElementById('calMonthYear').textContent = this.viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    var year = this.viewDate.getFullYear();
    var month = this.viewDate.getMonth();
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = todayKey();
    var studyDays = {};
    d.sessions.forEach(function(s) {
      var k = dateKey(s.date);
      studyDays[k] = (studyDays[k] || 0) + s.duration;
    });
    var html = '';
    for (var i = 0; i < firstDay; i++) html += '<div class="cal-day empty"></div>';
    for (var day = 1; day <= daysInMonth; day++) {
      var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var isToday = dateStr === today;
      var hasStudy = studyDays[dateStr] !== undefined;
      var isSelected = this.selectedDate === dateStr;
      html += '<div class="cal-day ' + (isToday ? 'today' : '') + ' ' + (hasStudy ? 'has-study' : '') + ' ' + (isSelected ? 'selected' : '') + '" onclick="Calendar.selectDay(\'' + dateStr + '\')">' + day + '</div>';
    }
    document.getElementById('calendarGrid').innerHTML = html;
    if (this.selectedDate) this.showDetail(this.selectedDate);
  },
  selectDay: function(dateStr) {
    this.selectedDate = dateStr;
    this.render();
    this.showDetail(dateStr);
  },
  showDetail: function(dateStr) {
    var dt = new Date(dateStr + 'T00:00:00');
    document.getElementById('calDetailDate').textContent = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    var daySessions = State.data.sessions.filter(function(s) { return dateKey(s.date) === dateStr; });
    var body = document.getElementById('calDetailBody');
    if (daySessions.length === 0) {
      body.innerHTML = '<p class="muted" style="text-align:center;padding:30px 0">No study sessions on this day</p>';
    } else {
      var totalMin = daySessions.reduce(function(sum, s) { return sum + s.duration; }, 0);
      body.innerHTML = '<p style="margin-bottom:12px;color:var(--text-secondary);font-size:0.85rem"><strong style="color:var(--accent);font-size:1.1rem">' + fmtDuration(totalMin) + '</strong> total · ' + daySessions.length + ' session' + (daySessions.length > 1 ? 's' : '') + '</p>' +
        daySessions.map(function(s) {
          var subj = State.data.subjects.find(function(x) { return x.id === s.subjectId; });
          return '<div class="session-item"><div class="session-dot" style="background:' + (subj ? subj.color : '#888') + '"></div>' +
            '<div class="session-info"><div class="session-subject">' + (subj ? escapeHtml(subj.name) : 'Unknown') + '</div>' +
            '<div class="session-time">' + fmtTime(s.date) + '</div></div>' +
            '<div class="session-duration">' + fmtDuration(s.duration) + '</div></div>';
        }).join('');
    }
    document.getElementById('calNoteInput').value = State.data.calendarNotes[dateStr] || '';
  },
  saveNote: function() {
    if (!this.selectedDate) { UI.toast('Select a day first', 'error'); return; }
    var note = document.getElementById('calNoteInput').value.trim();
    if (note) State.data.calendarNotes[this.selectedDate] = note;
    else delete State.data.calendarNotes[this.selectedDate];
    State.save();
    UI.toast('Note saved', 'success');
  }
};

// ---------- Notes ----------
var Notes = {
  search: '',
  init: function() {
    var self = this;
    document.getElementById('addNoteBtn').onclick = function() { self.openEditor(); };
    document.getElementById('noteSearch').oninput = function(e) { self.search = e.target.value.toLowerCase(); self.render(); };
  },
  render: function() {
    var grid = document.getElementById('notesGrid');
    if (!grid) return;
    var notes = State.data.notes.slice();
    if (this.search) {
      notes = notes.filter(function(n) {
        return n.title.toLowerCase().indexOf(self.search) >= 0 || (n.content || '').toLowerCase().indexOf(self.search) >= 0;
      });
    }
    notes.sort(function(a, b) {
      return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date);
    });
    if (notes.length === 0) {
      grid.innerHTML = UI.emptyState('fa-sticky-note', this.search ? 'No notes match your search' : 'No notes yet. Create your first note!');
      return;
    }
    grid.innerHTML = notes.map(function(n) {
      return '<div class="note-card ' + (n.pinned ? 'pinned' : '') + '">' +
        '<button class="note-pin ' + (n.pinned ? 'active' : '') + '" onclick="Notes.togglePin(\'' + n.id + '\')"><i class="fas fa-thumbtack"></i></button>' +
        '<div class="note-title">' + escapeHtml(n.title) + '</div>' +
        '<div class="note-content rich">' + escapeHtml(n.content) + '</div>' +
        '<div class="note-date"><i class="fas fa-clock"></i> ' + fmtDate(n.date) + '</div>' +
        '<div class="note-actions"><button onclick="Notes.openEditor(\'' + n.id + '\')"><i class="fas fa-pen"></i> Edit</button>' +
        '<button class="del" onclick="Notes.delete(\'' + n.id + '\')"><i class="fas fa-trash"></i> Delete</button></div>' +
      '</div>';
    }).join('');
  },
  openEditor: function(id) {
    var note = id ? State.data.notes.find(function(n) { return n.id === id; }) : null;
    UI.modal(id ? 'Edit Note' : 'New Note',
      '<div class="form-group"><label>Title</label><input type="text" id="noteTitle" value="' + (note ? escapeHtml(note.title) : '') + '" placeholder="Note title"></div>' +
      '<div class="form-group"><label>Content</label>' +
        '<div class="rich-toolbar">' +
          '<button onclick="document.execCommand(\'bold\')" title="Bold"><i class="fas fa-bold"></i></button>' +
          '<button onclick="document.execCommand(\'italic\')" title="Italic"><i class="fas fa-italic"></i></button>' +
          '<button onclick="document.execCommand(\'underline\')" title="Underline"><i class="fas fa-underline"></i></button>' +
          '<button onclick="document.execCommand(\'insertUnorderedList\')" title="Bullet List"><i class="fas fa-list-ul"></i></button>' +
          '<button onclick="document.execCommand(\'insertOrderedList\')" title="Numbered List"><i class="fas fa-list-ol"></i></button>' +
        '</div>' +
        '<div class="rich-editor" id="noteContent" contenteditable="true">' + (note ? note.content : '') + '</div>' +
      '</div>' +
      '<div class="modal-actions"><button class="btn-secondary" onclick="UI.closeModal()">Cancel</button><button class="btn-primary" id="saveNote">' + (id ? 'Save' : 'Create') + '</button></div>'
    );
    setTimeout(function() { document.getElementById('noteTitle').focus(); }, 100);
    document.getElementById('saveNote').onclick = function() {
      var title = document.getElementById('noteTitle').value.trim();
      var content = document.getElementById('noteContent').innerHTML.trim();
      if (!title) { UI.toast('Enter a note title', 'error'); return; }
      if (id) {
        var n = State.data.notes.find(function(x) { return x.id === id; });
        n.title = title; n.content = content;
        UI.toast('Note updated', 'success');
      } else {
        State.data.notes.push({ id: uid('n'), title: title, content: content, pinned: false, date: new Date().toISOString() });
        UI.toast('Note created', 'success');
      }
      State.save();
      UI.closeModal();
      Notes.render();
      Achievements.check();
      App.refreshAll();
    };
  },
  togglePin: function(id) {
    var n = State.data.notes.find(function(x) { return x.id === id; });
    if (n) { n.pinned = !n.pinned; State.save(); this.render(); }
  },
  delete: function(id) {
    State.data.notes = State.data.notes.filter(function(n) { return n.id !== id; });
    State.save();
    this.render();
    App.refreshAll();
    UI.toast('Note deleted', 'success');
  }
};

// ---------- Analytics ----------
var Analytics = {
  charts: {},
  init: function() {},
  render: function() {
    var d = State.data;
    document.getElementById('anaLongest').textContent = d.streak.longest + ' days';
    var totalMin = d.sessions.reduce(function(s, x) { return s + x.duration; }, 0);
    document.getElementById('anaAvgSession').textContent = d.sessions.length > 0 ? Math.round(totalMin / d.sessions.length) + ' min' : '0 min';
    var byDay = {};
    d.sessions.forEach(function(s) { var k = dateKey(s.date); byDay[k] = (byDay[k] || 0) + s.duration; });
    var bestDayMin = 0;
    for (var k in byDay) { if (byDay[k] > bestDayMin) bestDayMin = byDay[k]; }
    document.getElementById('anaBestDay').textContent = (bestDayMin / 60).toFixed(1) + 'h';
    document.getElementById('anaTotalSessions').textContent = d.sessions.length;
    this.renderDailyChart();
    this.renderWeeklyChart();
    this.renderSubjectChart();
    this.renderMonthlyChart();
  },
  renderDailyChart: function() {
    var canvas = document.getElementById('dailyChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (this.charts.daily) this.charts.daily.destroy();
    var labels = [], data = [];
    for (var i = 6; i >= 0; i--) {
      var dt = new Date(Date.now() - i * 86400000);
      labels.push(dt.toLocaleDateString('en-US', { weekday: 'short' }));
      var min = State.data.sessions.filter(function(s) { return dateKey(s.date) === dateKey(dt); }).reduce(function(sum, s) { return sum + s.duration; }, 0);
      data.push((min / 60).toFixed(2));
    }
    this.charts.daily = new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: [{ data: data, backgroundColor: getAccentColor(), borderRadius: 8 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }
    });
  },
  renderWeeklyChart: function() {
    var canvas = document.getElementById('weeklyChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (this.charts.weekly) this.charts.weekly.destroy();
    var labels = [], data = [];
    for (var i = 7; i >= 0; i--) {
      var weekEnd = new Date(Date.now() - i * 7 * 86400000);
      var weekStart = new Date(weekEnd.getTime() - 6 * 86400000);
      labels.push('W' + (8 - i));
      var min = State.data.sessions.filter(function(s) { var sd = new Date(s.date); return sd >= weekStart && sd <= weekEnd; }).reduce(function(sum, s) { return sum + s.duration; }, 0);
      data.push((min / 60).toFixed(2));
    }
    this.charts.weekly = new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: [{ data: data, borderColor: getAccentColor(), backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: getAccentColor(), pointRadius: 4 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }
    });
  },
  renderSubjectChart: function() {
    var canvas = document.getElementById('subjectChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (this.charts.subject) this.charts.subject.destroy();
    var d = State.data;
    var subjects = d.subjects.map(function(s) {
      return { name: s.name, color: s.color, min: d.sessions.filter(function(x) { return x.subjectId === s.id; }).reduce(function(sum, x) { return sum + x.duration; }, 0) };
    }).filter(function(s) { return s.min > 0; });
    if (subjects.length === 0) {
      canvas.parentElement.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><p>No data yet</p></div>';
      return;
    }
    this.charts.subject = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: subjects.map(function(s) { return s.name; }), datasets: [{ data: subjects.map(function(s) { return (s.min / 60).toFixed(2); }), backgroundColor: subjects.map(function(s) { return s.color; }), borderWidth: 0, hoverOffset: 10 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 12, usePointStyle: true } } } }
    });
  },
  renderMonthlyChart: function() {
    var canvas = document.getElementById('monthlyChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (this.charts.monthly) this.charts.monthly.destroy();
    var labels = [], data = [];
    var now = new Date();
    for (var i = 11; i >= 0; i--) {
      var dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(dt.toLocaleDateString('en-US', { month: 'short' }));
      var min = State.data.sessions.filter(function(s) {
        var sd = new Date(s.date);
        return sd.getFullYear() === dt.getFullYear() && sd.getMonth() === dt.getMonth();
      }).reduce(function(sum, s) { return sum + s.duration; }, 0);
      data.push((min / 60).toFixed(2));
    }
    this.charts.monthly = new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: [{ data: data, borderColor: getAccentColor(), backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointBackgroundColor: getAccentColor(), pointRadius: 3 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#9ca3af' }, grid: { display: false } } } }
    });
  }
};

// ---------- Achievements ----------
var Achievements = {
  init: function() {},
  render: function() {
    var d = State.data;
    var grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    var unlockedSet = {};
    d.achievements.forEach(function(a) { unlockedSet[a.id] = true; });
    grid.innerHTML = ACHIEVEMENTS_DEF.map(function(a) {
      var unlocked = unlockedSet[a.id];
      return '<div class="ach-card ' + (unlocked ? 'unlocked' : 'locked') + '">' +
        '<div class="ach-icon"><i class="fas ' + a.icon + '"></i></div>' +
        '<div class="ach-name">' + a.name + '</div>' +
        '<div class="ach-desc">' + a.desc + '</div>' +
        '<div class="ach-status">' + (unlocked ? 'Unlocked' : 'Locked') + '</div>' +
      '</div>';
    }).join('');
    var unlockedCount = d.achievements.length;
    document.getElementById('achProgressText').textContent = unlockedCount + ' / ' + ACHIEVEMENTS_DEF.length + ' unlocked';
    document.getElementById('achProgressFill').style.width = (unlockedCount / ACHIEVEMENTS_DEF.length * 100) + '%';
  },
  check: function() {
    var d = State.data;
    var unlockedSet = {};
    d.achievements.forEach(function(a) { unlockedSet[a.id] = true; });
    var newlyUnlocked = [];
    ACHIEVEMENTS_DEF.forEach(function(a) {
      if (!unlockedSet[a.id] && a.check(d)) {
        d.achievements.push({ id: a.id, date: new Date().toISOString() });
        newlyUnlocked.push(a);
      }
    });
    if (newlyUnlocked.length > 0) {
      State.save();
      this.render();
      newlyUnlocked.forEach(function(a) {
        UI.toast('Achievement unlocked: ' + a.name + '!', 'success', 4000);
      });
    }
  }
};

// ---------- Streaks UI ----------
var StreaksUI = {
  init: function() {},
  render: function() {
    var d = State.data;
    document.getElementById('currentStreak').textContent = d.streak.current;
    document.getElementById('longestStreak').textContent = d.streak.longest;
    document.getElementById('missedDays').textContent = Streaks.missedDays30();
    var studyDays = {};
    d.sessions.forEach(function(s) { studyDays[dateKey(s.date)] = true; });
    document.getElementById('totalStudyDays').textContent = Object.keys(studyDays).length;
    var heatmap = document.getElementById('streakHeatmap');
    if (!heatmap) return;
    heatmap.innerHTML = '';
    var studyMinutes = {};
    d.sessions.forEach(function(s) {
      var k = dateKey(s.date);
      studyMinutes[k] = (studyMinutes[k] || 0) + s.duration;
    });
    var totalDays = 26 * 7;
    var today = new Date();
    var startDay = today.getDay();
    for (var i = totalDays - startDay - 1; i >= 0; i--) {
      var dt = new Date(today.getTime() - i * 86400000);
      var k = dateKey(dt);
      var min = studyMinutes[k] || 0;
      var cell = document.createElement('div');
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
var Goals = {
  init: function() {
    var self = this;
    document.getElementById('addGoalBtn').onclick = function() { self.openEditor(); };
    document.querySelectorAll('.goal-tab').forEach(function(t) {
      t.onclick = function() {
        State.data.currentGoalTab = t.dataset.type;
        document.querySelectorAll('.goal-tab').forEach(function(x) { x.classList.toggle('active', x === t); });
        self.render();
      };
    });
  },
  render: function() {
    var tab = State.data.currentGoalTab || 'daily';
    document.querySelectorAll('.goal-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.type === tab); });
    var list = document.getElementById('goalsList');
    if (!list) return;
    var goals = State.data.goals.filter(function(g) { return g.type === tab; });
    if (goals.length === 0) {
      list.innerHTML = UI.emptyState('fa-bullseye', 'No ' + tab + ' goals yet. Add one to get started!');
      return;
    }
    list.innerHTML = goals.map(function(g) {
      var pct = Math.min(100, Math.round((g.progress / g.target) * 100));
      return '<div class="goal-card ' + (g.completed ? 'completed' : '') + '">' +
        '<div class="goal-check ' + (g.completed ? 'done' : '') + '" onclick="Goals.toggle(\'' + g.id + '\')">' + (g.completed ? '<i class="fas fa-check"></i>' : '') + '</div>' +
        '<div class="goal-content"><div class="goal-title">' + escapeHtml(g.title) + '</div>' +
        '<div class="goal-meta">' + g.type + ' goal · ' + pct + '% complete</div>' +
        '<div class="goal-progress-wrap"><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        '<input type="number" value="' + g.progress + '" min="0" step="0.5" onchange="Goals.updateProgress(\'' + g.id + '\', this.value)">' +
        '<span style="font-size:0.78rem;color:var(--text-muted)">/ ' + g.target + '</span></div></div>' +
        '<div class="goal-actions"><button onclick="Goals.openEditor(\'' + g.id + '\')"><i class="fas fa-pen"></i></button>' +
        '<button class="del" onclick="Goals.delete(\'' + g.id + '\')"><i class="fas fa-trash"></i></button></div>' +
      '</div>';
    }).join('');
  },
  openEditor: function(id) {
    var g = id ? State.data.goals.find(function(x) { return x.id === id; }) : null;
    var tab = State.data.currentGoalTab || 'daily';
    UI.modal(id ? 'Edit Goal' : 'New Goal',
      '<div class="form-group"><label>Goal Title</label><input type="text" id="goalTitle" value="' + (g ? escapeHtml(g.title) : '') + '" placeholder="e.g. Study 4 hours daily"></div>' +
      '<div class="form-group"><label>Goal Type</label><select id="goalType">' +
        '<option value="daily" ' + (g && g.type === 'daily' ? 'selected' : '') + '>Daily</option>' +
        '<option value="weekly" ' + (g && g.type === 'weekly' ? 'selected' : '') + '>Weekly</option>' +
        '<option value="monthly" ' + (g && g.type === 'monthly' ? 'selected' : '') + '>Monthly</option>' +
      '</select></div>' +
      '<div class="form-group"><label>Target Value</label><input type="number" id="goalTarget" value="' + (g ? g.target : 4) + '" min="0.5" step="0.5"></div>' +
      '<div class="modal-actions"><button class="btn-secondary" onclick="UI.closeModal()">Cancel</button><button class="btn-primary" id="saveGoal">' + (id ? 'Save' : 'Create') + '</button></div>'
    );
    document.getElementById('saveGoal').onclick = function() {
      var title = document.getElementById('goalTitle').value.trim();
      var type = document.getElementById('goalType').value;
      var target = parseFloat(document.getElementById('goalTarget').value) || 1;
      if (!title) { UI.toast('Enter a goal title', 'error'); return; }
      if (id) {
        var goal = State.data.goals.find(function(x) { return x.id === id; });
        goal.title = title; goal.type = type; goal.target = target;
        goal.completed = goal.progress >= target;
      } else {
        State.data.goals.push({ id: uid('g'), title: title, type: type, target: target, progress: 0, completed: false });
      }
      State.save();
      UI.closeModal();
      Goals.render();
      App.refreshAll();
      UI.toast('Goal saved', 'success');
    };
  },
  updateProgress: function(id, val) {
    var g = State.data.goals.find(function(x) { return x.id === id; });
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
  toggle: function(id) {
    var g = State.data.goals.find(function(x) { return x.id === id; });
    if (g) {
      g.completed = !g.completed;
      if (g.completed) g.progress = g.target;
      State.save();
      this.render();
      App.refreshAll();
      Achievements.check();
    }
  },
  delete: function(id) {
    State.data.goals = State.data.goals.filter(function(g) { return g.id !== id; });
    State.save();
    this.render();
    App.refreshAll();
    UI.toast('Goal deleted', 'success');
  }
};

// ---------- Flashcards ----------
var Flashcards = {
  search: '',
  difficultOnly: false,
  viewIndex: 0,
  filtered: [],
  init: function() {
    var self = this;
    document.getElementById('addCardBtn').onclick = function() { self.openEditor(); };
    document.getElementById('cardSearch').oninput = function(e) { self.search = e.target.value.toLowerCase(); self.applyFilter(); };
    document.getElementById('shuffleCards').onclick = function() { self.shuffle(); };
    document.getElementById('filterDifficult').onclick = function(e) {
      self.difficultOnly = !self.difficultOnly;
      e.currentTarget.classList.toggle('active', self.difficultOnly);
      self.applyFilter();
    };
    document.getElementById('prevCard').onclick = function() { self.prev(); };
    document.getElementById('nextCard').onclick = function() { self.next(); };
    document.getElementById('markDifficult').onclick = function() { self.toggleDifficult(); };
    document.getElementById('deleteCard').onclick = function() { self.deleteCurrent(); };
    document.getElementById('flashcard').onclick = function() { self.flip(); };
  },
  render: function() { this.applyFilter(); },
  applyFilter: function() {
    var cards = State.data.flashcards.slice();
    var s = this.search;
    if (this.difficultOnly) cards = cards.filter(function(c) { return c.difficult; });
    if (s) cards = cards.filter(function(c) { return c.front.toLowerCase().indexOf(s) >= 0 || c.back.toLowerCase().indexOf(s) >= 0; });
    this.filtered = cards;
    this.viewIndex = 0;
    this.showCard();
  },
  showCard: function() {
    var card = this.filtered[this.viewIndex];
    var fc = document.getElementById('flashcard');
    fc.classList.remove('flipped');
    if (!card) {
      document.getElementById('cardFront').textContent = 'No cards yet';
      document.getElementById('cardBack').textContent = 'Add your first flashcard';
      document.getElementById('cardCounter').textContent = '0 / 0';
      return;
    }
    var front = document.getElementById('cardFront');
    var back = document.getElementById('cardBack');
    setTimeout(function() {
      front.textContent = card.front;
      back.textContent = card.back;
    }, 100);
    document.getElementById('cardCounter').textContent = (this.viewIndex + 1) + ' / ' + this.filtered.length;
    var markBtn = document.getElementById('markDifficult');
    if (card.difficult) {
      markBtn.classList.add('active');
      markBtn.innerHTML = '<i class="fas fa-star"></i> Difficult';
    } else {
      markBtn.classList.remove('active');
      markBtn.innerHTML = '<i class="far fa-star"></i> Mark Difficult';
    }
  },
  flip: function() { document.getElementById('flashcard').classList.toggle('flipped'); },
  prev: function() {
    if (this.filtered.length === 0) return;
    this.viewIndex = (this.viewIndex - 1 + this.filtered.length) % this.filtered.length;
    this.showCard();
  },
  next: function() {
    if (this.filtered.length === 0) return;
    this.viewIndex = (this.viewIndex + 1) % this.filtered.length;
    this.showCard();
  },
  shuffle: function() {
    var cards = this.filtered;
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cards[i]; cards[i] = cards[j]; cards[j] = temp;
    }
    this.viewIndex = 0;
    this.showCard();
    UI.toast('Cards shuffled', 'info');
  },
  toggleDifficult: function() {
    var card = this.filtered[this.viewIndex];
    if (!card) return;
    var original = State.data.flashcards.find(function(c) { return c.id === card.id; });
    if (original) {
      original.difficult = !original.difficult;
      card.difficult = original.difficult;
      State.save();
      this.showCard();
      UI.toast(original.difficult ? 'Marked as difficult' : 'Removed from difficult', 'info');
    }
  },
  deleteCurrent: function() {
    var card = this.filtered[this.viewIndex];
    if (!card) return;
    UI.confirm('Delete this flashcard?', function(ok) {
      if (!ok) return;
      State.data.flashcards = State.data.flashcards.filter(function(c) { return c.id !== card.id; });
      State.save();
      Flashcards.applyFilter();
      UI.toast('Card deleted', 'success');
    });
  },
  openEditor: function() {
    UI.modal('New Flashcard',
      '<div class="form-group"><label>Question (Front)</label><textarea id="cardFrontInput" placeholder="What\'s on the front?"></textarea></div>' +
      '<div class="form-group"><label>Answer (Back)</label><textarea id="cardBackInput" placeholder="What\'s on the back?"></textarea></div>' +
      '<div class="modal-actions"><button class="btn-secondary" onclick="UI.closeModal()">Cancel</button><button class="btn-primary" id="saveCard">Create Card</button></div>'
    );
    document.getElementById('saveCard').onclick = function() {
      var front = document.getElementById('cardFrontInput').value.trim();
      var back = document.getElementById('cardBackInput').value.trim();
      if (!front || !back) { UI.toast('Fill in both sides', 'error'); return; }
      State.data.flashcards.push({ id: uid('f'), front: front, back: back, difficult: false });
      State.save();
      UI.closeModal();
      Flashcards.applyFilter();
      App.refreshAll();
      Achievements.check();
      UI.toast('Flashcard added', 'success');
    };
  }
};

// ---------- Planner ----------
var Planner = {
  init: function() {
    document.getElementById('addPlannerBtn').onclick = function() { Planner.openEditor(); };
  },
  render: function() {
    var grid = document.getElementById('plannerGrid');
    if (!grid) return;
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var today = new Date().getDay();
    var todayIdx = today === 0 ? 6 : today - 1;
    grid.innerHTML = days.map(function(day, idx) {
      var blocks = State.data.planner.filter(function(p) { return p.day === day; }).sort(function(a, b) { return a.startTime.localeCompare(b.startTime); });
      return '<div class="planner-day">' +
        '<div class="planner-day-header ' + (idx === todayIdx ? 'today' : '') + '">' + day + '</div>' +
        '<div class="planner-blocks" data-day="' + day + '" ondrop="Planner.drop(event, \'' + day + '\')" ondragover="Planner.dragOver(event)" ondragleave="Planner.dragLeave(event)">' +
          blocks.map(function(b) {
            return '<div class="planner-block" draggable="true" ondragstart="Planner.dragStart(event, \'' + b.id + '\')" onclick="Planner.edit(\'' + b.id + '\')">' +
              '<button class="planner-block-del" onclick="event.stopPropagation();Planner.delete(\'' + b.id + '\')"><i class="fas fa-times"></i></button>' +
              '<div class="planner-block-time">' + b.startTime + ' - ' + b.endTime + '</div>' +
              '<div class="planner-block-title">' + escapeHtml(b.title) + '</div>' +
            '</div>';
          }).join('') +
          '<button class="planner-add-block" onclick="Planner.openEditor(null, \'' + day + '\')"><i class="fas fa-plus"></i> Add block</button>' +
        '</div>' +
      '</div>';
    }).join('');
  },
  dragStart: function(e, id) {
    e.dataTransfer.setData('text/plain', id);
    e.currentTarget.classList.add('dragging');
  },
  dragOver: function(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  },
  dragLeave: function(e) {
    e.currentTarget.classList.remove('drag-over');
  },
  drop: function(e, day) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    var id = e.dataTransfer.getData('text/plain');
    var block = State.data.planner.find(function(p) { return p.id === id; });
    if (block) {
      block.day = day;
      State.save();
      this.render();
      UI.toast('Block moved', 'success');
    }
  },
  openEditor: function(id, presetDay) {
    var b = id ? State.data.planner.find(function(p) { return p.id === id; }) : null;
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    UI.modal(id ? 'Edit Block' : 'Add Block',
      '<div class="form-group"><label>Title</label><input type="text" id="plannerTitle" value="' + (b ? escapeHtml(b.title) : '') + '" placeholder="e.g. Math Practice"></div>' +
      '<div class="form-group"><label>Day</label><select id="plannerDay">' +
        days.map(function(d) { return '<option value="' + d + '" ' + ((b ? b.day : presetDay) === d ? 'selected' : '') + '>' + d + '</option>'; }).join('') +
      '</select></div>' +
      '<div style="display:flex;gap:10px">' +
        '<div class="form-group" style="flex:1"><label>Start Time</label><input type="time" id="plannerStart" value="' + (b ? b.startTime : '09:00') + '"></div>' +
        '<div class="form-group" style="flex:1"><label>End Time</label><input type="time" id="plannerEnd" value="' + (b ? b.endTime : '10:00') + '"></div>' +
      '</div>' +
      '<div class="modal-actions"><button class="btn-secondary" onclick="UI.closeModal()">Cancel</button><button class="btn-primary" id="savePlanner">' + (id ? 'Save' : 'Add') + '</button></div>'
    );
    document.getElementById('savePlanner').onclick = function() {
      var title = document.getElementById('plannerTitle').value.trim();
      var day = document.getElementById('plannerDay').value;
      var startTime = document.getElementById('plannerStart').value;
      var endTime = document.getElementById('plannerEnd').value;
      if (!title) { UI.toast('Enter a title', 'error'); return; }
      if (id) {
        var bl = State.data.planner.find(function(p) { return p.id === id; });
        bl.title = title; bl.day = day; bl.startTime = startTime; bl.endTime = endTime;
      } else {
        State.data.planner.push({ id: uid('p'), title: title, day: day, startTime: startTime, endTime: endTime });
      }
      State.save();
      UI.closeModal();
      Planner.render();
      UI.toast('Block saved', 'success');
    };
  },
  edit: function(id) { this.openEditor(id); },
  delete: function(id) {
    State.data.planner = State.data.planner.filter(function(p) { return p.id !== id; });
    State.save();
    this.render();
    UI.toast('Block deleted', 'success');
  }
};

// ---------- Settings ----------
var Settings = {
  init: function() {
    var self = this;
    document.querySelectorAll('.theme-opt').forEach(function(b) {
      b.onclick = function() { self.setTheme(b.dataset.theme); };
    });
    document.querySelectorAll('.fs-opt').forEach(function(b) {
      b.onclick = function() { self.setFontSize(b.dataset.size); };
    });
    document.getElementById('exportData').onclick = function() { self.export(); };
    document.getElementById('importData').onclick = function() { document.getElementById('importFile').click(); };
    document.getElementById('importFile').onchange = function(e) { self.import(e); };
    document.getElementById('clearData').onclick = function() { self.clear(); };
  },
  render: function() {
    var d = State.data.settings;
    document.querySelectorAll('.theme-opt').forEach(function(b) { b.classList.toggle('active', b.dataset.theme === d.theme); });
    document.querySelectorAll('.fs-opt').forEach(function(b) { b.classList.toggle('active', b.dataset.size === d.fontSize); });
    document.querySelectorAll('.accent-opt').forEach(function(b) { b.classList.toggle('active', b.dataset.accent === d.accent); });
  },
  setTheme: function(theme) {
    State.data.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggle').innerHTML = theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    State.save();
    this.render();
    App.refreshAll();
  },
  setAccent: function(accent) {
    State.data.settings.accent = accent;
    document.documentElement.setAttribute('data-accent', accent);
    State.save();
    this.render();
    App.refreshAll();
  },
  setFontSize: function(size) {
    State.data.settings.fontSize = size;
    document.documentElement.setAttribute('data-fontsize', size);
    State.save();
    this.render();
  },
  export: function() {
    var data = JSON.stringify(State.data, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'studyflow_backup_' + todayKey() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    UI.toast('Data exported', 'success');
  },
  import: function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var imported = JSON.parse(ev.target.result);
        UI.confirm('Import will replace all current data. Continue?', function(ok) {
          if (!ok) return;
          State.data = State.mergeDefaults(imported);
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
  clear: function() {
    UI.confirm('This will permanently delete all your data. Continue?', function(ok) {
      if (!ok) return;
      State.reset();
      App.applySettings();
      App.refreshAll();
      UI.toast('All data cleared', 'success');
    });
  }
};

// ---------- App ----------
var App = {
  currentSection: 'dashboard',
  init: function() {
    try {
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

      var self = this;
      document.querySelectorAll('[data-section]').forEach(function(el) {
        el.onclick = function(e) {
          e.preventDefault();
          self.navigate(el.dataset.section);
        };
      });
      document.getElementById('menuToggle').onclick = function() { self.toggleSidebar(true); };
      document.getElementById('sidebarClose').onclick = function() { self.toggleSidebar(false); };
      document.getElementById('sidebarOverlay').onclick = function() { self.toggleSidebar(false); };
      document.getElementById('moreBtn').onclick = function(e) {
        e.preventDefault();
        document.getElementById('moreMenu').classList.add('show');
      };
      document.getElementById('closeMore').onclick = function() { document.getElementById('moreMenu').classList.remove('show'); };
      document.querySelectorAll('.more-item').forEach(function(item) {
        item.onclick = function(e) {
          e.preventDefault();
          document.getElementById('moreMenu').classList.remove('show');
          self.navigate(item.dataset.section);
        };
      });
      document.getElementById('themeToggle').onclick = function() {
        var newTheme = State.data.settings.theme === 'dark' ? 'light' : 'dark';
        Settings.setTheme(newTheme);
      };
      document.getElementById('accentBtn').onclick = function(e) {
        e.stopPropagation();
        document.getElementById('accentDropdown').classList.toggle('show');
      };
      document.querySelectorAll('.accent-opt').forEach(function(b) {
        b.onclick = function() {
          Settings.setAccent(b.dataset.accent);
          document.getElementById('accentDropdown').classList.remove('show');
        };
      });
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.accent-wrap')) {
          var dd = document.getElementById('accentDropdown');
          if (dd) dd.classList.remove('show');
        }
      });
      document.getElementById('tipBtn').onclick = function() {
        var tip = TIPS[Math.floor(Math.random() * TIPS.length)];
        UI.toast(tip, 'info', 6000);
      };
      document.getElementById('focusBtn').onclick = function() {
        document.body.classList.toggle('focus-mode');
        var isFocus = document.body.classList.contains('focus-mode');
        UI.toast(isFocus ? 'Focus mode on. Stay concentrated!' : 'Focus mode off', 'info');
        if (isFocus && document.body.requestFullscreen) {
          document.body.requestFullscreen().catch(function() {});
        } else if (document.fullscreenElement) {
          document.exitFullscreen().catch(function() {});
        }
      };
      document.getElementById('ambienceBtn').onclick = function(e) {
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
      document.getElementById('modalClose').onclick = function() { UI.closeModal(); };
      document.getElementById('modalBackdrop').onclick = function() { UI.closeModal(); };
      var search = document.getElementById('globalSearch');
      search.oninput = function(e) { self.globalSearch(e.target.value); };
      document.addEventListener('keydown', function(e) { self.handleKeyboard(e); });

      Achievements.check();
      this.refreshAll();

      setTimeout(function() {
        var loader = document.getElementById('loader');
        if (loader) loader.classList.add('hide');
      }, 800);
    } catch (err) {
      console.error('Init error:', err);
      var loader = document.getElementById('loader');
      if (loader) loader.classList.add('hide');
    }
  },
  applySettings: function() {
    var s = State.data.settings;
    document.documentElement.setAttribute('data-theme', s.theme);
    document.documentElement.setAttribute('data-accent', s.accent);
    document.documentElement.setAttribute('data-fontsize', s.fontSize);
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.innerHTML = s.theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    if (s.ambience) {
      AudioMgr.startAmbience();
      var ambBtn = document.getElementById('ambienceBtn');
      if (ambBtn) ambBtn.classList.add('active');
    }
  },
  navigate: function(section) {
    this.currentSection = section;
    document.querySelectorAll('.section').forEach(function(s) { s.classList.toggle('active', s.id === section); });
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.toggle('active', n.dataset.section === section); });
    document.querySelectorAll('.bn-item').forEach(function(n) { n.classList.toggle('active', n.dataset.section === section); });
    this.refreshAll();
    this.toggleSidebar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  refreshAll: function() {
    try { Dashboard.render(); } catch(e) { console.error('Dashboard render:', e); }
    try { Subjects.render(); } catch(e) { console.error('Subjects render:', e); }
    try { Timer.render(); } catch(e) { console.error('Timer render:', e); }
    try { Tasks.render(); } catch(e) { console.error('Tasks render:', e); }
    try { Calendar.render(); } catch(e) { console.error('Calendar render:', e); }
    try { Notes.render(); } catch(e) { console.error('Notes render:', e); }
    try { Analytics.render(); } catch(e) { console.error('Analytics render:', e); }
    try { Achievements.render(); } catch(e) { console.error('Achievements render:', e); }
    try { StreaksUI.render(); } catch(e) { console.error('StreaksUI render:', e); }
    try { Goals.render(); } catch(e) { console.error('Goals render:', e); }
    try { Flashcards.render(); } catch(e) { console.error('Flashcards render:', e); }
    try { Planner.render(); } catch(e) { console.error('Planner render:', e); }
    try { Settings.render(); } catch(e) { console.error('Settings render:', e); }
  },
  toggleSidebar: function(open) {
    document.getElementById('sidebar').classList.toggle('open', open);
    document.getElementById('sidebarOverlay').classList.toggle('show', open);
  },
  handleKeyboard: function(e) {
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
      var sections = ['dashboard', 'subjects', 'timer', 'tasks', 'calendar', 'notes', 'analytics', 'achievements', 'streaks'];
      var idx = parseInt(e.key) - 1;
      if (sections[idx]) this.navigate(sections[idx]);
    }
  },
  globalSearch: function(query) {
    if (!query.trim()) return;
    var q = query.toLowerCase();
    var results = [];
    State.data.notes.forEach(function(n) {
      if (n.title.toLowerCase().indexOf(q) >= 0 || (n.content || '').toLowerCase().indexOf(q) >= 0)
        results.push({ type: 'Note', title: n.title, section: 'notes' });
    });
    State.data.tasks.forEach(function(t) {
      if (t.title.toLowerCase().indexOf(q) >= 0)
        results.push({ type: 'Task', title: t.title, section: 'tasks' });
    });
    State.data.subjects.forEach(function(s) {
      if (s.name.toLowerCase().indexOf(q) >= 0)
        results.push({ type: 'Subject', title: s.name, section: 'subjects' });
    });
    State.data.flashcards.forEach(function(c) {
      if (c.front.toLowerCase().indexOf(q) >= 0 || c.back.toLowerCase().indexOf(q) >= 0)
        results.push({ type: 'Flashcard', title: c.front, section: 'flashcards' });
    });
    if (results.length > 0) {
      var input = document.getElementById('globalSearch');
      input.onkeydown = function(ev) {
        if (ev.key === 'Enter') {
          App.navigate(results[0].section);
          input.value = '';
        }
      };
    }
  }
};

// ---------- Init ----------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { App.init(); });
} else {
  App.init();
}
