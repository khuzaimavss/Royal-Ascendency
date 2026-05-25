
// ─── DATA ───────────────────────────────────────────────────────────────────
const DC_LINK = 'https://discord.gg/bR84Qq28';
const DC_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;

const MODES = [' Sword',' Axe',' Nethpot',' SMP',' Mace',' Crystal',' UHC'];
const MODE_KEYS = ['sword','axe','nethpot','smp','mace','crystal','uhc'];

const MODE_IMAGES = [
  "Sword.png",
  "axe.png",
  "nethpot.png",
  "smp.png",
  "mace.png",
  "cpvp.png",
  "UHC.png"
];

const ADMIN_USER = 'adminroyal';

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
function getData(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// ─── MASTER DATA (baked in — updated each time admin exports) ────────────────
// FORMAT: { dataVersion: <timestamp>, leaderboard: [...], users: {...}, testRequests: [] }
// When dataVersion in this file is NEWER than what's in localStorage,
// the app loads from here instead — works on file:// with no server needed.
const MASTER_DATA = {"dataVersion":1,"leaderboard":[{"id":"volleybound","username":"volleybound","title":"Combat Warlord","tiers":{"sword":"A1","axe":"A1","nethpot":"A2","smp":"A3","mace":"A1","crystal":"A2","uhc":"A1"},"points":375,"status":"ur","date":"2026-03-20"},{"id":"thedarkfang","username":"TheDarkFang","title":"Combat Crusader","tiers":{"sword":"A2","axe":"A3","nethpot":"A1","smp":"A1","mace":"A2","crystal":"A4","uhc":"A2"},"points":300,"status":"ur","date":"2026-03-22"},{"id":"villband","username":"Villband","title":"Combat Crusader","tiers":{"sword":"A3","axe":"A2","nethpot":"A3","smp":"A3","mace":"A3","crystal":"A1","uhc":"A3"},"points":255,"status":"ur","date":"2026-03-25"},{"id":"itsdarkgaming","username":"ItsDarkgaming","title":"Unranked","tiers":{"sword":"A4","axe":"A4","nethpot":"A4","smp":"A5","mace":"A4","crystal":"A3","uhc":"A4"},"points":15,"status":"ur","date":"2026-04-01"},{"id":"piercesparrow","username":"PierceSparrow","title":"Unranked","tiers":{"sword":"A5","axe":"A5","nethpot":"A5","smp":"A4","mace":"A5","crystal":"A5","uhc":"A5"},"points":15,"status":"ur","date":"2026-04-02"}],"users":{},"testRequests":[]};

// ─── SEED FROM MASTER DATA ───────────────────────────────────────────────────
function initFromMaster() {
  const savedVersion = getData('dataVersion', 0);
  const masterVersion = MASTER_DATA.dataVersion || 0;

  if (masterVersion > savedVersion) {
    // app.js has newer data than what this browser has seen — load it in
    if (MASTER_DATA.leaderboard) setData('leaderboard', MASTER_DATA.leaderboard);
    if (MASTER_DATA.users)       setData('users',       MASTER_DATA.users);
    setData('dataVersion', masterVersion);
  }
  // Ensure all keys exist
  if (!getData('users', null))        setData('users', {});
  if (!getData('leaderboard', null))  setData('leaderboard', []);
}


// ─── MIGRATE OLD LT/HT → A ───────────────────────────────────────────────────
function migrateOldTierCodes() {
  const renameMap = {
    'LT1':'A1','LT2':'A2','LT3':'A3','LT4':'A4','LT5':'A5',
    'HT1':'A1','HT2':'A2','HT3':'A3','HT4':'A4','HT5':'A5'
  };
  // Migrate leaderboard
  const lb = getData('leaderboard', null);
  if (lb) {
    let changed = false;
    lb.forEach(p => {
      if (p.tiers) {
        Object.keys(p.tiers).forEach(k => {
          if (renameMap[p.tiers[k]]) { p.tiers[k] = renameMap[p.tiers[k]]; changed = true; }
        });
      }
    });
    if (changed) setData('leaderboard', lb);
  }
  // Migrate users
  const users = getData('users', null);
  if (users) {
    let changed = false;
    Object.values(users).forEach(u => {
      if (u.tiers) {
        Object.keys(u.tiers).forEach(k => {
          if (renameMap[u.tiers[k]]) { u.tiers[k] = renameMap[u.tiers[k]]; changed = true; }
        });
      }
      if (u.testRequest && u.testRequest.assignedTiers) {
        Object.keys(u.testRequest.assignedTiers).forEach(k => {
          if (renameMap[u.testRequest.assignedTiers[k]]) { u.testRequest.assignedTiers[k] = renameMap[u.testRequest.assignedTiers[k]]; changed = true; }
        });
      }
    });
    if (changed) setData('users', users);
  }
}

// ─── STATE ───────────────────────────────────────────────────────────────────
let currentUser = null;
let isAdmin = false;
let currentModeFilter = 'sword';

// ─── AUTH ────────────────────────────────────────────────────────────────────
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('loginError').textContent = '';
  document.getElementById('signupError').textContent = '';
}

function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const err = document.getElementById('loginError');
  if (!u) { err.textContent = 'Please enter a username.'; return; }

  if (u.toLowerCase() === ADMIN_USER) {
    isAdmin = true;
    showScreen('adminScreen');
    renderAdminLeaderboard();
    renderPlayersTable();
    return;
  }

  const users = getData('users', {});
  const key = u.toLowerCase();
  if (!users[key]) { err.textContent = 'User not found.'; return; }

  currentUser = users[key];
  isAdmin = false;
  localStorage.setItem("currentUser", key);
  document.getElementById('navUsername').textContent = currentUser.username;
  showScreen('mainScreen');
  showSection('leaderboard', document.querySelector('.sub-tab'));
  renderLeaderboard();
}

function doSignup() {
  const u = document.getElementById('signupUser').value.trim();
  const err = document.getElementById('signupError');

  if (!u) { err.textContent = 'Please enter a username.'; return; }
  if (u.toLowerCase() === ADMIN_USER) { err.textContent = 'That username is reserved.'; return; }

  const users = getData('users', {});
  const key = u.toLowerCase();
  if (users[key]) { err.textContent = 'Username already taken.'; return; }

  users[key] = {
  username: u,
  title: 'Unranked',
  tiers: {sword:'',axe:'',nethpot:'',smp:'',mace:'',crystal:'',uhc:''},
  points: 0,
  status: 'ur',
  joinDate: new Date().toISOString().split('T')[0],
  testRequest: null,
  applicationHistory: [],
  profileImage: ""
};
  setData('users', users);

  currentUser = users[key];
  isAdmin = false;
  document.getElementById('navUsername').textContent = currentUser.username;
  showScreen('mainScreen');
  showSection('leaderboard', document.querySelector('.sub-tab'));
  renderLeaderboard();
  showToast('Account created! Welcome, ' + u);
}

function doLogout() {
  currentUser = null;
  isAdmin = false;
  localStorage.removeItem("currentUser");
  document.getElementById('loginUser').value = '';
  document.getElementById('loginError').textContent = '';
  showScreen('authScreen');
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (btn) btn.classList.add('active');

  if (id === 'leaderboard') renderLeaderboard();
  if (id === 'tiers') renderTiers();
  if (id === 'myprofile') renderMyProfile();
  if (id === 'profile') {
    // Clear search results when switching to profile tab
    document.getElementById('profileContent').innerHTML = '<div class="empty-state"><div class="big">👤</div><p>Enter a username above to view their profile.</p></div>';
    document.getElementById('profileSearchInput').value = '';
  }
}

function goProfile() {
  showSection('profile', null);
  document.querySelectorAll('.sub-tab').forEach(b => {
    if (b.textContent.includes('Search Profile') || b.textContent.includes('Profile')) b.classList.add('active');
    else b.classList.remove('active');
  });
}

// ─── TIER HELPERS ─────────────────────────────────────────────────────────────
function tierToNum(t) {
  if (!t) return 999;
  // Strip (R) prefix for sorting
  const base = t.startsWith('(R)') ? t.replace('(R)','') : t;
  const map = {'A1':1,'A2':2,'A3':3,'A4':4,'A5':5};
  return map[base] || 999;
}

function tierClass(t) {
  if (!t) return 'tp-unranked';
  // (R)A1, (R)A2 etc — retired/red ranks
  if (t.startsWith('(R)')) {
    const num = t.replace('(R)A','');
    if (num === '1') return 'tp-r1';
    if (num === '2') return 'tp-r2';
    if (num === '3') return 'tp-r3';
    return 'tp-r4';
  }
  if (t.endsWith('1')) return 'tp-t1';
  if (t.endsWith('2')) return 'tp-t2';
  if (t.endsWith('3')) return 'tp-t3';
  if (t.endsWith('4') || t.endsWith('5')) return 'tp-t4';
  return 'tp-ur';
}

function initials(name) {
  return name.slice(0,2).toUpperCase();
}

function daysHeld(dateStr) {
  if (!dateStr) return 'New';
  const d = new Date(dateStr);
  const diff = Math.floor((new Date() - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day';
  return diff + ' days';
}

// Returns days since a specific rank position date
function daysAtRank(rankDates, pos) {
  if (!rankDates) return null;
  const dateStr = rankDates[pos];
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const diff = Math.floor((new Date() - d) / 86400000);
  if (diff < 0) return null;
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day';
  return diff + ' days';
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function renderLeaderboard() {
  const lb = getData('leaderboard', []).sort((a,b) => b.points - a.points);
  const users = getData('users', {});
  const el = document.getElementById('lbList');
  if (!lb.length) { el.innerHTML = '<div class="empty-state"><div class="big">🏆</div><p>No players yet.</p></div>'; return; }
  el.innerHTML = lb.map((p, i) => {
    const rank = i + 1;
    const rankClass = rank <= 3 ? `top${rank}` : '';
    const numClass = rank === 1 ? 'rn1' : rank === 2 ? 'rn2' : rank === 3 ? 'rn3' : 'rn-other';
    const tags = MODE_KEYS.map((k,j) => {
      const t = p.tiers[k] || '';
      const isRetired = t.startsWith('(R)');
     return `<div class="tag-pill ${tierClass(t)}${isRetired?' tag-retired':''}">
  <span>
    <img src="images/${MODE_IMAGES[j]}" class="tiny-icon">
    ${t || 'UR'}
  </span>
</div>`;
    }).join('');
    const rarityClass = p.status === 'ur' ? 'rarity-ur' : 'rarity-r';
    const rarityText = p.status === 'ur' ? 'UR' : 'R';

    // Rank position held time
    let heldHTML = '';
    if (rank <= 5 && p.rankDates && p.rankDates[rank]) {
      const held = daysAtRank(p.rankDates, rank);
      if (held) {
        heldHTML = `<div class="rank-date-held top-rank">🏅 #${rank} for ${held}</div>`;
      }
    } else {
      heldHTML = `<div class="rank-date-held">Since: ${daysHeld(p.date)}</div>`;
    }

    return `
      <div class="rank-card ${rankClass}">
        <div class="rank-num ${numClass}">${rank}.</div>
        <div class="rank-avatar">
          <img src="${(users[p.id] && users[p.id].profileImage) || p.profileImage || `https://minotar.net/avatar/${p.username}/100`}" alt="pfp" onerror="this.src='https://minotar.net/avatar/${p.username}/100'">
        </div>
        <div class="rank-info">
          <div class="rank-name">${p.username}</div>
          <div class="rank-title">${titleHTML(p.points, 'font-size:0.85rem;letter-spacing:1px;')}</div>
          <div class="rank-tags">${tags}</div>
        </div>
        <div class="rank-right">
          <div class="pts">${p.points} pts</div>
          <div class="rarity-badge ${rarityClass}">${rarityText}</div>
          ${heldHTML}
        </div>
      </div>
    `;
  }).join('');
}

function lbSaveTier(id, mode, value) {
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === id);
  if (idx < 0) return;
  lb[idx].tiers[mode] = value;
  const newPts = calcPoints(lb[idx].tiers);
  lb[idx].points = newPts;
  lb[idx].title = calcTitle(newPts);
  setData('leaderboard', lb);
  const ptsEl = document.getElementById('lbpts_' + id);
  if (ptsEl) ptsEl.textContent = newPts + ' pts';
  showToast('Saved!');
}

function lbSavePoints(id, value) {
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === id);
  if (idx < 0) return;
  lb[idx].points = parseInt(value) || 0;
  lb[idx].title = calcTitle(lb[idx].points);
  setData('leaderboard', lb);
  const ptsEl = document.getElementById('lbpts_' + id);
  if (ptsEl) ptsEl.textContent = lb[idx].points + ' pts';
  showToast('Points updated!');
}

function lbSaveStatus(id, value) {
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === id);
  if (idx < 0) return;
  lb[idx].status = value;
  setData('leaderboard', lb);
  const badgeEl = document.getElementById('lbbadge_' + id);
  if (badgeEl) {
    badgeEl.textContent = value === 'ur' ? 'UR' : 'R';
    badgeEl.className = 'rarity-badge ' + (value === 'ur' ? 'rarity-ur' : 'rarity-r');
  }
  showToast('Status updated!');
}

function lbDeletePlayer(id) {
  if (!confirm('Remove this player from the leaderboard?')) return;
  const lb = getData('leaderboard', []);
  setData('leaderboard', lb.filter(p => p.id !== id));
  renderLeaderboard();
  showToast('Player removed.');
}

// ─── TIERS ────────────────────────────────────────────────────────────────────
function renderTiers() {
  const tabsEl = document.getElementById('modeFilterTabs');
  tabsEl.innerHTML = MODE_KEYS.map((k,i) => `
    <button class="sub-tab ${k===currentModeFilter?'active':''}" onclick="setModeFilter('${k}', this)" title="${MODES[i]}">
      <img src="images/${MODE_IMAGES[i]}" class="mode-icon">
    </button>
  `).join('');
  renderTierView();
}

function setModeFilter(k, btn) {
  currentModeFilter = k;
  document.querySelectorAll('#modeFilterTabs .sub-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTierView();
}

function renderTierView() {
  const lb = getData('leaderboard', []);
  const tiers = ['A1','A2','A3','A4','A5'];
  const tierColors = {A1:'tl1',A2:'tl2',A3:'tl3',A4:'tl4',A5:'tl5'};
  const el = document.getElementById('tierView');
  el.innerHTML = tiers.map(tier => {
    const players = lb.filter(p => p.tiers[currentModeFilter] === tier);
    const chips = players.map(p => `
      <div class="tier-player-chip">
        <div class="chip-avatar">${initials(p.username)}</div>
        ${p.username}
      </div>
    `).join('') || '<span style="color:var(--muted);font-size:0.8rem;padding:4px 8px;">No players</span>';
    return `
      <div class="tier-row">
        <div class="tier-label ${tierColors[tier]}">${tier}</div>
        <div class="tier-players">${chips}</div>
      </div>
    `;
  }).join('');
}

// ─── PUBLIC PROFILE SEARCH ────────────────────────────────────────────────────
function searchProfile() {
  const query = document.getElementById('profileSearchInput').value.trim();
  const el = document.getElementById('profileContent');
  if (!query) { el.innerHTML = '<div class="empty-state"><div class="big">👤</div><p>Enter a username to search.</p></div>'; return; }

  const users = getData('users', {});
  const lb = getData('leaderboard', []);
  const key = query.toLowerCase();

  // Search in both users and leaderboard
  const userData = users[key];
  const lbEntry = lb.find(p => p.username.toLowerCase() === key);

  if (!userData && !lbEntry) {
    el.innerHTML = `<div class="empty-state"><div class="big">🔍</div><p>No player found with the username "<strong>${query}</strong>".</p></div>`;
    return;
  }

  const username = (userData && userData.username) || (lbEntry && lbEntry.username) || query;
  const profileImage = (userData && userData.profileImage) || (lbEntry && lbEntry.profileImage) || '';
  const pts = lbEntry ? lbEntry.points : 0;
  const status = lbEntry ? lbEntry.status : 'ur';
  const myTitle = calcTitle(pts);
  const sortedLb = lb.sort((a,b) => b.points - a.points);
  const rank = lbEntry ? sortedLb.findIndex(p => p.id === lbEntry.id) + 1 : null;

  const tierRows = MODE_KEYS.map((k,i) => {
    const t = lbEntry ? (lbEntry.tiers[k] || 'Unranked') : 'Unranked';
    const cls = t === 'Unranked' ? '' : 'has-rank';
    return `
      <div class="tier-item">
        <div class="tier-item-mode"><img src="images/${MODE_IMAGES[i]}" class="profile-icon"></div>
        <div class="tier-item-rank ${cls}">${t}</div>
      </div>`;
  }).join('');

  const TITLE_TIERS = [
    { label: 'Unranked',        min: 0,   max: 99,  pts: 0   },
    { label: 'Combat Squire',   min: 100, max: 199, pts: 100 },
    { label: 'Combat Knight',   min: 200, max: 249, pts: 200 },
    { label: 'Combat Crusader', min: 250, max: 349, pts: 250 },
    { label: 'Combat Warlord',  min: 350, max: 399, pts: 350 },
    { label: 'Combat Emperor',  min: 400, max: 999, pts: 400 },
  ];
  const titleProgressRows = TITLE_TIERS.map(t => {
    const isCurrent = myTitle === t.label;
    const ptsDisplay = t.max >= 999 ? t.min + '+' : t.min + '–' + t.max;
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:${isCurrent?'rgba(59,130,246,0.12)':'transparent'};border:1px solid ${isCurrent?'var(--border)':'transparent'};">
        <div style="width:10px;height:10px;border-radius:50%;background:${titleColor(t.pts)};flex-shrink:0;${isCurrent?'box-shadow:0 0 8px '+titleColor(t.pts):''}"></div>
        <div style="flex:1;font-family:var(--font-head);font-size:0.95rem;">${isCurrent ? titleHTML(t.pts) : '<span style="color:var(--muted);font-weight:400;">'+t.label+'</span>'}</div>
        <div style="font-size:0.75rem;color:var(--muted);letter-spacing:1px;">${ptsDisplay} pts</div>
        ${isCurrent ? '<div style="font-size:0.7rem;background:var(--accent);color:white;padding:2px 8px;border-radius:10px;font-family:var(--font-head);font-weight:700;letter-spacing:1px;">CURRENT</div>' : ''}
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar-big">
        ${profileImage ? `<img src="${profileImage}">` : `<img src="https://minotar.net/avatar/${username}/100" onerror="this.src='https://minotar.net/avatar/steve/100'">`}
      </div>
      <div class="profile-username">${username}</div>
      <div class="profile-title-text" style="font-size:1.1rem;letter-spacing:2px;margin-bottom:1rem;">${titleHTML(pts)}</div>
      <div class="profile-stats-row">
        <div class="pstat">
          <div class="pstat-val">${pts}</div>
          <div class="pstat-label">Points</div>
        </div>
        <div class="pstat">
          <div class="pstat-val">${rank ? '#' + rank : 'Unranked'}</div>
          <div class="pstat-label">Rank</div>
        </div>
        <div class="pstat">
          <div class="pstat-val">${status === 'ur' ? 'UR' : 'R'}</div>
          <div class="pstat-label">Status</div>
        </div>
      </div>
    </div>
    <div class="profile-tiers-grid">
      <div class="ptg-title">📊 Royal Ascendency Rankings</div>
      <div class="tier-grid">${tierRows}</div>
    </div>
    <div class="profile-tiers-grid">
      <div class="ptg-title">🏅 Title Progression</div>
      <div style="display:flex;flex-direction:column;gap:4px;">${titleProgressRows}</div>
    </div>
    ${!lbEntry ? `<div style="background:rgba(59,130,246,0.08);border:1px solid var(--border);border-radius:12px;padding:1.2rem;text-align:center;color:var(--muted);font-size:0.9rem;">
      This player is not yet on the leaderboard.
    </div>` : ''}
  `;
}

// ─── MY PROFILE ───────────────────────────────────────────────────────────────
function renderMyProfile() {
  const el = document.getElementById('myProfileContent');
  if (!currentUser) { el.innerHTML = '<div class="empty-state"><div class="big">🔒</div><p>Not logged in.</p></div>'; return; }

  const users = getData('users', {});
  const lb = getData('leaderboard', []);
  const key = currentUser.username.toLowerCase();
  const u = users[key] || currentUser;
  const lbEntry = lb.find(p => p.username.toLowerCase() === key);
  const profileImage = u.profileImage || (lbEntry && lbEntry.profileImage) || '';
  const pts = lbEntry ? lbEntry.points : 0;
  const myTitle = calcTitle(pts);
  const sortedLb = [...lb].sort((a,b) => b.points - a.points);
  const rank = lbEntry ? sortedLb.findIndex(p => p.id === lbEntry.id) + 1 : null;
  const status = lbEntry ? lbEntry.status : 'ur';

  const tierRows = MODE_KEYS.map((k,i) => {
    const t = lbEntry ? (lbEntry.tiers[k] || 'Unranked') : 'Unranked';
    const cls = t === 'Unranked' ? '' : 'has-rank';
    return `
      <div class="tier-item">
        <div class="tier-item-mode"><img src="images/${MODE_IMAGES[i]}" class="profile-icon"></div>
        <div class="tier-item-rank ${cls}">${t}</div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar-big" style="position:relative;cursor:pointer;" onclick="document.getElementById('skinFileInput').click()" title="Click to upload skin">
        ${profileImage
          ? `<img src="${profileImage}">`
          : `<img src="https://minotar.net/avatar/${u.username}/100" onerror="this.src='https://minotar.net/avatar/steve/100'">`}
        <div style="position:absolute;bottom:0;right:0;background:var(--accent);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;box-shadow:0 2px 6px rgba(0,0,0,0.4);" title="Upload skin">📤</div>
      </div>
      <div class="profile-username">${u.username}</div>
      <div class="profile-title-text" style="font-size:1.1rem;letter-spacing:2px;margin-bottom:0.6rem;">${titleHTML(pts)}</div>
      <div class="profile-stats-row">
        <div class="pstat"><div class="pstat-val">${pts}</div><div class="pstat-label">Points</div></div>
        <div class="pstat"><div class="pstat-val">${rank ? '#' + rank : 'Unranked'}</div><div class="pstat-label">Rank</div></div>
        <div class="pstat"><div class="pstat-val">${status === 'ur' ? 'UR' : 'R'}</div><div class="pstat-label">Status</div></div>
      </div>
    </div>

    <!-- SKIN UPLOAD CARD -->
    <div style="background:var(--bg-card);border:1px solid var(--border2);border-radius:14px;padding:1.4rem;margin-bottom:1.4rem;">
      <div style="font-family:var(--font-head);font-size:1rem;font-weight:700;letter-spacing:2px;color:var(--accent2);margin-bottom:0.8rem;">🎮 MINECRAFT SKIN</div>
      <p style="font-size:0.85rem;color:var(--muted);margin-bottom:1.2rem;line-height:1.6;">Upload your Minecraft skin (.png) to set your profile avatar. Your head will be automatically extracted and shown across the leaderboard.</p>
      <input type="file" id="skinFileInput" accept="image/png,image/jpeg" style="display:none;" onchange="uploadPFP(event)">
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button onclick="document.getElementById('skinFileInput').click()"
          style="display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.4);border-radius:10px;color:var(--accent2);font-family:var(--font-head);font-size:0.9rem;font-weight:700;letter-spacing:1.5px;cursor:pointer;transition:all 0.2s;"
          onmouseover="this.style.background='rgba(59,130,246,0.22)'" onmouseout="this.style.background='rgba(59,130,246,0.12)'">
          📤 UPLOAD SKIN
        </button>
        ${profileImage ? `
        <button onclick="removeSkin()"
          style="display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.35);border-radius:10px;color:var(--danger);font-family:var(--font-head);font-size:0.9rem;font-weight:700;letter-spacing:1.5px;cursor:pointer;transition:all 0.2s;"
          onmouseover="this.style.background='rgba(248,113,113,0.2)'" onmouseout="this.style.background='rgba(248,113,113,0.1)'">
          🗑 REMOVE SKIN
        </button>` : ''}
      </div>
    </div>

    <div class="profile-tiers-grid">
      <div class="ptg-title">📊 Royal Ascendency Rankings</div>
      <div class="tier-grid">${tierRows}</div>
    </div>
    ${!lbEntry ? `<div style="background:rgba(59,130,246,0.08);border:1px solid var(--border);border-radius:12px;padding:1.2rem;text-align:center;color:var(--muted);font-size:0.9rem;">You are not yet on the leaderboard.</div>` : ''}
  `;
}

// Keep old renderProfile for internal use (no-op now)
function renderProfile() {}

// ─── APPLY (kept for admin requests compatibility) ─────────────────────────────
function getMonthlyAppCount(u) {
  const history = u.applicationHistory || [];
  const now = new Date();
  const curMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  return history.filter(d => d.startsWith(curMonth)).length;
}

function renderApply() {
  // Apply tab removed — this is a no-op kept for safety
  return;
  const el = document.getElementById('applyContent');
  const users = getData('users', {});
  const u = users[currentUser.username.toLowerCase()];
  const req = u ? u.testRequest : null;

  const monthlyCount = getMonthlyAppCount(u || {});
  const attemptsLeft = 3 - monthlyCount;
  const monthlyBlocked = attemptsLeft <= 0;

  let statusHTML = '';
  if (!req) {
    statusHTML = '<span class="status-badge status-none">No Application</span>';
  } else if (req.status === 'pending') {
    statusHTML = '<span class="status-badge status-pending">⏳ Pending Review</span>';
  } else if (req.status === 'approved') {
    statusHTML = '<span class="status-badge status-approved">✅ Approved</span>';
  } else if (req.status === 'rejected') {
    statusHTML = '<span class="status-badge status-rejected">❌ Rejected</span>';
  }

  const canApply = (!req || req.status === 'rejected') && !monthlyBlocked;

  // Monthly attempts counter color
  const attemptsColor = attemptsLeft === 0 ? 'var(--danger)' : attemptsLeft === 1 ? '#fbbf24' : 'var(--success)';

  el.innerHTML = `
    <div class="apply-card">
      <h2>📝 Royal Ascendency Test Application</h2>
      <p>Apply to take a Royal Ascendency test and get officially ranked on the leaderboard. Select the gamemodes you want to be tested in and submit your application. An admin will review it and assign your Royal Ascendency.</p>

      <div style="display:flex;align-items:center;gap:10px;background:var(--bg-card2);border:1px solid var(--border2);border-radius:10px;padding:12px 16px;margin-bottom:1.2rem;">
        <div style="font-size:1.4rem;">📅</div>
        <div>
          <div style="font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:2px;">Monthly Applications</div>
          <div style="font-family:var(--font-head);font-size:1rem;font-weight:700;">
            <span style="color:${attemptsColor};font-size:1.3rem;">${attemptsLeft}</span>
            <span style="color:var(--muted);font-size:0.85rem;"> / 3 attempts remaining this month</span>
          </div>
        </div>
      </div>

      ${statusHTML}
      ${req && req.status === 'approved' ? `<div style="color:var(--success);font-size:0.85rem;margin-bottom:1rem;">Your ranks have been assigned. Check your profile!</div>` : ''}
      ${req && req.status === 'rejected' && !monthlyBlocked ? `<div style="color:var(--danger);font-size:0.85rem;margin-bottom:1rem;">Your previous application was rejected. You may apply again.</div>` : ''}
      ${monthlyBlocked ? `
        <div style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:10px;padding:14px 16px;text-align:center;margin-top:0.5rem;">
          <div style="font-size:1.5rem;margin-bottom:6px;">🚫</div>
          <div style="font-family:var(--font-head);font-size:1rem;font-weight:700;color:var(--danger);letter-spacing:1px;">Monthly Limit Reached</div>
          <div style="font-size:0.82rem;color:var(--muted);margin-top:4px;">You have used all 3 applications for this month. You can apply again next month.</div>
        </div>
      ` : canApply ? `
        <div style="margin-bottom:1rem;">
          <label style="font-size:0.78rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:8px;">Select Gamemodes</label>
          <div class="mode-checkboxes">
           ${MODE_KEYS.map((k,i) => `
          <label class="mode-check-label">
          <input type="checkbox" value="${k}" checked>
          <img src="images/${MODE_IMAGES[i]}" class="tiny-icon">
          ${MODES[i]}
          </label>
`         ).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Additional Notes (Optional)</label>
          <textarea class="textarea-field" id="applyNote" placeholder="Any info about your gameplay style, experience level, etc."></textarea>
        </div>
        <button class="btn-primary" onclick="submitApplication()">SUBMIT APPLICATION</button>
      ` : ''}
    </div>
  `;
}

function submitApplication() {
  const users = getData('users', {});
  const key = currentUser.username.toLowerCase();

  // Ensure applicationHistory exists
  if (!users[key].applicationHistory) users[key].applicationHistory = [];

  // Check monthly limit
  const monthlyCount = getMonthlyAppCount(users[key]);
  if (monthlyCount >= 3) {
    showToast('Monthly limit reached! Max 3 applications per month.');
    return;
  }

  const modes = [...document.querySelectorAll('.mode-check-label input:checked')].map(c => c.value);
  if (!modes.length) { showToast('Select at least one gamemode.'); return; }
  const note = document.getElementById('applyNote').value.trim();

  const today = new Date().toISOString().split('T')[0];
  users[key].applicationHistory.push(today);
  users[key].testRequest = {
    modes,
    note,
    status: 'pending',
    date: today
  };
  setData('users', users);
  currentUser = users[key];
  showToast('Application submitted!');
  renderApply();
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function adminTab(id, btn) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('admin' + id.charAt(0).toUpperCase() + id.slice(1)).classList.add('active');
  if (id === 'leaderboard') renderAdminLeaderboard();
  if (id === 'players')    renderPlayersTable();
}

function renderAdminLeaderboard() {
  const lb = getData('leaderboard', []).sort((a,b) => b.points - a.points);
  const el = document.getElementById('adminLbList');
  if (!lb.length) { el.innerHTML = '<div class="empty-state"><div class="big">🏆</div><p>No players yet.</p></div>'; return; }
  const TIER_OPTS = ['','A1','A2','A3','A4','A5','(R)A1','(R)A2','(R)A3','(R)A4','(R)A5'];
  el.innerHTML = lb.map((p, i) => {
    const rank = i + 1;
    const rankClass = rank <= 3 ? `top${rank}` : '';
    const numClass = rank === 1 ? 'rn1' : rank === 2 ? 'rn2' : rank === 3 ? 'rn3' : 'rn-other';
    const rarityClass = p.status === 'ur' ? 'rarity-ur' : 'rarity-r';
    const rarityText = p.status === 'ur' ? 'UR' : 'R';

    const tags = MODE_KEYS.map((k,j) => {
      const t = p.tiers[k] || '';
      const modeEmoji = MODES[j].split(' ')[0];
      const modeName = MODES[j].split(' ').slice(1).join(' ');
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
          <span style="font-size:0.68rem;color:var(--muted);">${modeEmoji} ${modeName}</span>
          <select class="inline-select" onchange="adminLbSaveTier('${p.id}','${k}',this.value)" style="font-size:0.75rem;">
            ${TIER_OPTS.map(o => `<option value="${o}" ${t===o?'selected':''}>${o||'UR'}</option>`).join('')}
          </select>
        </div>`;
    }).join('');

    // Rank position date inputs — admin sets date player reached #1–#5
    const rankDates = p.rankDates || {};
    const rankDateRows = [1,2,3,4,5].map(pos => {
      const val = rankDates[pos] || '';
      const held = val ? (daysAtRank(rankDates, pos) || '') : '';
      return `
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span style="font-size:0.7rem;color:var(--muted);min-width:52px;">🏅 #${pos} since:</span>
          <input type="date" value="${val}"
            style="font-size:0.72rem;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border2);border-radius:5px;color:var(--text);outline:none;cursor:pointer;"
            onchange="adminSaveRankDate('${p.id}',${pos},this.value)">
          ${held ? `<span style="font-size:0.7rem;color:var(--accent2);font-family:var(--font-head);font-weight:700;">${held}</span>` : '<span style="font-size:0.68rem;color:var(--muted);">not set</span>'}
        </div>`;
    }).join('');

    // Show held time in rank-right panel
    let heldHTML = '';
    if (rank <= 5 && rankDates[rank]) {
      const held = daysAtRank(rankDates, rank);
      if (held) heldHTML = `<div style="font-size:0.72rem;color:var(--gold);font-weight:700;">🏅 #${rank} for ${held}</div>`;
    }
    if (!heldHTML) heldHTML = `<div style="font-size:0.72rem;color:var(--muted);">Since: ${daysHeld(p.date)}</div>`;

    return `
      <div class="rank-card ${rankClass}" id="albcard_${p.id}">
        <div class="rank-num ${numClass}">${rank}.</div>
        <div class="rank-avatar">
          ${p.profileImage ? `<img src="${p.profileImage}" alt="pfp">` : `<span>${initials(p.username)}</span>`}
        </div>
        <div class="rank-info" style="flex:1;">
          <div class="rank-name">${p.username}</div>
          <div class="rank-title" id="albtitle_${p.id}">${titleHTML(p.points, 'font-size:0.85rem;letter-spacing:1px;')}</div>
          <div class="rank-tags" style="gap:8px;margin-top:6px;">${tags}</div>
          <div style="display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap;">
            <span style="font-size:0.72rem;color:var(--muted);">Pts:</span>
            <input type="number" value="${p.points}" min="0" style="width:64px;font-size:0.8rem;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border2);border-radius:5px;color:var(--text);outline:none;" onchange="adminLbSavePoints('${p.id}',this.value)">
            <span style="font-size:0.72rem;color:var(--muted);">Status:</span>
            <select class="inline-select" onchange="adminLbSaveStatus('${p.id}',this.value)">
              <option value="ur" ${p.status==='ur'?'selected':''}>UR (Active)</option>
              <option value="r" ${p.status==='r'?'selected':''}>R (Retired)</option>
            </select>
            <button onclick="adminLbDeletePlayer('${p.id}')" style="font-size:0.72rem;padding:3px 8px;background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:var(--danger);border-radius:5px;cursor:pointer;">🗑 Remove</button>
          </div>
          <div style="margin-top:8px;background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.15);border-radius:8px;padding:8px 10px;">
            <div style="font-size:0.65rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);margin-bottom:5px;font-family:var(--font-head);">📅 Rank Position Dates</div>
            <div style="display:flex;flex-direction:column;gap:4px;">${rankDateRows}</div>
          </div>
        </div>
        <div class="rank-right">
          <div class="pts" id="albpts_${p.id}">${p.points} pts</div>
          <div class="rarity-badge ${rarityClass}" id="albbadge_${p.id}">${rarityText}</div>
          <div id="albheld_${p.id}">${heldHTML}</div>
        </div>
      </div>
    `;
  }).join('');
}

function adminLbSaveTier(id, mode, value) {
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === id);
  if (idx < 0) return;
  lb[idx].tiers[mode] = value;
  const newPts = calcPoints(lb[idx].tiers);
  lb[idx].points = newPts;
  lb[idx].title = calcTitle(newPts);
  setData('leaderboard', lb);
  const ptsEl = document.getElementById('albpts_' + id);
  if (ptsEl) ptsEl.textContent = newPts + ' pts';
  const titleEl = document.getElementById('albtitle_' + id);
  if (titleEl) { titleEl.innerHTML = titleHTML(newPts, 'font-size:0.85rem;letter-spacing:1px;'); }
  showToast('Saved! ' + newPts + ' pts → ' + lb[idx].title);
}

function adminLbSavePoints(id, value) {
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === id);
  if (idx < 0) return;
  lb[idx].points = parseInt(value) || 0;
  lb[idx].title = calcTitle(lb[idx].points);
  setData('leaderboard', lb);
  const ptsEl = document.getElementById('albpts_' + id);
  if (ptsEl) ptsEl.textContent = lb[idx].points + ' pts';
  const titleEl = document.getElementById('albtitle_' + id);
  if (titleEl) { titleEl.innerHTML = titleHTML(lb[idx].points, 'font-size:0.85rem;letter-spacing:1px;'); }
  showToast('Points updated! Title → ' + lb[idx].title);
}

function adminLbSaveStatus(id, value) {
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === id);
  if (idx < 0) return;
  lb[idx].status = value;
  setData('leaderboard', lb);
  const badgeEl = document.getElementById('albbadge_' + id);
  if (badgeEl) {
    badgeEl.textContent = value === 'ur' ? 'UR' : 'R';
    badgeEl.className = 'rarity-badge ' + (value === 'ur' ? 'rarity-ur' : 'rarity-r');
  }
  showToast('Status updated!');
}

function adminLbDeletePlayer(id) {
  if (!confirm('Remove this player from the leaderboard?')) return;
  const lb = getData('leaderboard', []);
  setData('leaderboard', lb.filter(p => p.id !== id));
  renderAdminLeaderboard();
  showToast('Player removed.');
}

function adminSaveRankDate(id, pos, dateVal) {
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === id);
  if (idx < 0) return;
  if (!lb[idx].rankDates) lb[idx].rankDates = {};
  lb[idx].rankDates[pos] = dateVal;
  setData('leaderboard', lb);
  // Update held time display instantly
  const heldEl = document.getElementById('albheld_' + id);
  if (heldEl) {
    const rankDates = lb[idx].rankDates;
    // Figure out current displayed rank
    const sorted = getData('leaderboard', []).sort((a,b) => b.points - a.points);
    const rank = sorted.findIndex(p => p.id === id) + 1;
    let heldHTML = '';
    if (rank <= 3 && rankDates[rank]) {
      const held = daysAtRank(rankDates, rank);
      if (held) heldHTML = `<div style="font-size:0.72rem;color:var(--gold);font-weight:700;">🏅 #${rank} for ${held}</div>`;
    }
    if (!heldHTML) heldHTML = `<div style="font-size:0.72rem;color:var(--muted);">Since: ${daysHeld(lb[idx].date)}</div>`;
    heldEl.innerHTML = heldHTML;
  }
  showToast(dateVal ? `Rank #${pos} date saved! ✅` : `Rank #${pos} date cleared.`);
}

function calcPoints(tiers) {
  const map = {'A1':75,'A2':55,'A3':40,'A4':25,'A5':10};
  return Object.values(tiers).reduce((s,t) => {
    // Strip (R) prefix for point calc
    const base = t && t.startsWith('(R)') ? t.replace('(R)','') : t;
    return s + (map[base]||0);
  }, 0);
}

function calcTitle(points) {
  if (points >= 400) return 'Combat Emperor';
  if (points >= 350) return 'Combat Warlord';
  if (points >= 250) return 'Combat Crusader';
  if (points >= 200) return 'Combat Knight';
  if (points >= 100) return 'Combat Squire';
  return 'Unranked';
}

function titleColor(points) {
  if (points >= 400) return '#ff4444';
  if (points >= 350) return '#ffd700';
  if (points >= 250) return '#b8860b';
  if (points >= 200) return '#4d9ef7';
  if (points >= 100) return '#4ade80';
  return '#475569';
}

function titleClass(points) {
  if (points >= 400) return 'rank-title-emperor';
  if (points >= 350) return 'rank-title-warlord';
  if (points >= 250) return 'rank-title-crusader';
  if (points >= 200) return 'rank-title-knight';
  if (points >= 100) return 'rank-title-squire';
  return 'rank-title-unranked';
}

function titleHTML(points, extraStyle) {
  const cls = titleClass(points);
  const title = calcTitle(points);
  const style = extraStyle ? ` style="${extraStyle}"` : '';
  return `<span class="${cls}"${style}>${title}</span>`;
}

function renderPlayersTable() {
  const lb = getData('leaderboard', []).sort((a,b) => b.points - a.points);
  const tbody = document.getElementById('playersTableBody');
  if (!lb.length) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--muted);padding:2rem;">No players</td></tr>';
    return;
  }
  const tierOpts = ['A1','A2','A3','A4','A5','(R)A1','(R)A2','(R)A3','(R)A4','(R)A5'];
  tbody.innerHTML = lb.map((p,i) => `
    <tr>
      <td>
        <strong>${p.username}</strong><br>
        <small>${titleHTML(p.points)}</small>
      </td>
      ${MODE_KEYS.map(k => `
        <td><select class="inline-select" id="tbl_${p.id}_${k}">
          <option value="">UR</option>
          ${tierOpts.map(t=>`<option ${p.tiers[k]===t?'selected':''}>${t}</option>`).join('')}
        </select></td>
      `).join('')}
      <td style="color:var(--accent2);font-family:var(--font-head);font-weight:700;" id="tblpts_${p.id}">${p.points}</td>
      <td><select class="inline-select" id="tbl_${p.id}_status">
        <option value="ur" ${p.status==='ur'?'selected':''}>UR</option>
        <option value="r" ${p.status==='r'?'selected':''}>R</option>
      </select></td>
      <td><button class="btn-save-row" onclick="savePlayerRow('${p.id}')">Save</button></td>
    </tr>
  `).join('');
}

function savePlayerRow(id) {
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === id);
  if (idx < 0) return;
  MODE_KEYS.forEach(k => {
    const sel = document.getElementById(`tbl_${id}_${k}`);
    if (sel) lb[idx].tiers[k] = sel.value;
  });
  lb[idx].points = calcPoints(lb[idx].tiers);
  lb[idx].title = calcTitle(lb[idx].points);
  const st = document.getElementById(`tbl_${id}_status`);
  if (st) lb[idx].status = st.value;
  setData('leaderboard', lb);
  const ptsEl = document.getElementById('tblpts_' + id);
  if (ptsEl) ptsEl.textContent = lb[idx].points;
  showToast('Saved! ' + lb[idx].points + ' pts → ' + lb[idx].title);
}

function adminAddPlayer() {
  const name = document.getElementById('addName').value.trim();
  const pts = parseInt(document.getElementById('addPoints').value)||0;
  const status = document.getElementById('addStatus').value;
  if (!name) { showToast('Enter a username.'); return; }

  const lb = getData('leaderboard', []);
  if (lb.find(p => p.username.toLowerCase() === name.toLowerCase())) { showToast('Player already on leaderboard.'); return; }

  const tiers = {};
  MODE_KEYS.forEach((k,i) => { tiers[k] = document.getElementById('as'+i).value; });
  const autoTitle = calcTitle(pts);

  lb.push({
    id: name.toLowerCase(), username: name, title: autoTitle,
    tiers, points: pts, status, date: new Date().toISOString().split('T')[0]
  });
  setData('leaderboard', lb);
  document.getElementById('addName').value = '';
  document.getElementById('addPoints').value = '0';
  showToast('Player added to leaderboard!');
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

window.onload = function() {
  // Seed localStorage from the baked-in MASTER_DATA if it's newer
  initFromMaster();
  migrateOldTierCodes();

  const savedUser = localStorage.getItem("currentUser");
  const users = getData('users', {});

  if (savedUser && users[savedUser]) {
    currentUser = users[savedUser];
    isAdmin = false;
    document.getElementById('navUsername').textContent = currentUser.username;
    showScreen('mainScreen');
    showSection('leaderboard', document.querySelector('.sub-tab'));
    renderLeaderboard();
  }
};
function uploadPFP(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      extractSkinHead(img, function(headDataURL) {
        saveProfileImage(headDataURL);
      });
    };
    img.onerror = function() {
      showToast("Invalid image file.");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function extractSkinHead(img, callback) {
  // Minecraft skin is 64x64 (new) or 64x32 (old).
  // Head base layer:  x=8,  y=8,  w=8, h=8  (on a 64px wide skin)
  // Head hat  layer:  x=40, y=8,  w=8, h=8
  // We scale coords proportionally in case the uploaded skin is larger (e.g. 128x128).

  const canvas = document.createElement('canvas');
  const OUT = 128; // output avatar size in px
  canvas.width = OUT;
  canvas.height = OUT;
  const ctx = canvas.getContext('2d');

  const skinW = img.naturalWidth;
  const skinH = img.naturalHeight;

  // Validate: must be square-ish power-of-two skin (64x64, 128x128, etc.)
  // Accept anything that has width == height OR classic 2:1 ratio
  const scale = skinW / 64;

  // Pixel coords on the skin texture (scaled)
  const headX = 8 * scale,  headY = 8 * scale,  headS = 8 * scale;
  const hatX  = 40 * scale, hatY  = 8 * scale,  hatS  = 8 * scale;

  // Draw base head layer
  ctx.imageSmoothingEnabled = false; // keep pixel-art crispness
  ctx.drawImage(img, headX, headY, headS, headS, 0, 0, OUT, OUT);

  // Draw hat/overlay layer on top (only if skin has hat layer — i.e. not fully transparent)
  // We check if the hat region has any non-transparent pixels
  const tmpC = document.createElement('canvas');
  tmpC.width = headS; tmpC.height = headS;
  const tmpCtx = tmpC.getContext('2d');
  tmpCtx.drawImage(img, hatX, hatY, hatS, hatS, 0, 0, headS, headS);
  const hatPixels = tmpCtx.getImageData(0, 0, headS, headS).data;
  const hasHat = hatPixels.some((v, i) => i % 4 === 3 && v > 10); // any non-transparent pixel?
  if (hasHat) {
    ctx.drawImage(img, hatX, hatY, hatS, hatS, 0, 0, OUT, OUT);
  }

  callback(canvas.toDataURL('image/png'));
}

function saveProfileImage(imgData) {
  const users = getData('users', {});
  const key = currentUser.username.toLowerCase();

  users[key].profileImage = imgData;
  setData('users', users);
  currentUser.profileImage = imgData;

  // Sync to leaderboard entry too
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === key || p.username.toLowerCase() === key);
  if (idx >= 0) {
    lb[idx].profileImage = imgData;
    setData('leaderboard', lb);
  }

  showToast("Skin uploaded! Head extracted ✅");
  renderMyProfile();
  renderLeaderboard();
}

function removeSkin() {
  const users = getData('users', {});
  const key = currentUser.username.toLowerCase();

  delete users[key].profileImage;
  setData('users', users);
  delete currentUser.profileImage;

  // Sync removal to leaderboard entry too
  const lb = getData('leaderboard', []);
  const idx = lb.findIndex(p => p.id === key || p.username.toLowerCase() === key);
  if (idx >= 0) {
    delete lb[idx].profileImage;
    setData('leaderboard', lb);
  }

  showToast("Skin removed ✅");
  renderMyProfile();
  renderLeaderboard();
}

