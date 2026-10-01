'use strict';
(function () {
  // Refuse to run inside someone else's frame (clickjacking defence).
  if (window.top !== window.self) {
    document.body.textContent = 'This page cannot be shown inside a frame.';
    return;
  }

  /* ==========================================================
     EDIT ME: drill and test libraries
     Add your own drills by copying a line inside any list.
     ========================================================== */
  const CAL = {
    'Face strike': [
      { name: 'Club rotation strike check', how: 'Spray the face or use impact tape. Hit one ball each with a wedge, a 7-iron and a 5-iron, rotating in a different order each round. Aim for centre contact on every club.' },
      { name: 'Ball position roulette', how: 'Change the ball position (forward, middle, back) on every shot. Note where each strike lands on the face.' },
      { name: 'Swing length ladder', how: 'Alternate half, three-quarter and full swings with the same club. Keep the strike in the same spot on all three.' },
      { name: 'Random distance contact', how: 'Pick a new target distance for every ball. Same centre strike, different carry.' }
    ],
    'Low point': [
      { name: 'Line drill, rotating clubs', how: 'Draw a line on the turf and place the ball just ahead of it. Brush the turf at or in front of the line. Rotate wedge, 8-iron and 5-iron every three balls.' },
      { name: 'Shot type switch', how: 'Alternate punch, stock and high shots. Check that every divot starts ahead of the ball.' },
      { name: 'Lie variation', how: 'Change the spot you hit from on every ball: tight lie, fluffy lie, new area of the mat. Ball first, then turf.' },
      { name: 'Towel behind the ball', how: 'Place a towel or headcover just behind the ball. Hit the ball without touching the towel. Change club every three balls.' }
    ],
    'Clubface direction': [
      { name: 'Start-line gate, changing targets', how: 'Set two tees as a gate about two metres ahead. Pick a different target for each ball and start it through the gate.' },
      { name: 'Shape on demand', how: 'Before each ball, choose draw, fade or straight at random (roll a die or use your phone). Match the start line and the curve.' },
      { name: 'Face call before you look', how: 'After each swing, say where you think the face pointed at impact before you watch the ball. Then compare.' },
      { name: 'Club switch, same gate', how: 'Use the same target and gate with a different club on every ball. Keep the start line inside the gate.' }
    ]
  };

  const TRANSFER = [
    { name: 'Six-hole imaginary round', how: 'Play six holes, one ball per shot. Name the hole, club, target and shape before you hit. No re-hits. Score: balls finishing in your intended window, scaled to 10.' },
    { name: 'Streak to finish', how: 'Choose a target. You finish when you hit it three times in a row, with a maximum of 12 balls. Score: 10 if done in 6 balls or fewer, minus 1 for each extra ball, 0 if not finished.' },
    { name: 'Protect your points', how: 'Start with 10 points. Every ball that misses the target costs a point. Ten balls, change club on every ball. Score: points left.' },
    { name: 'Routine under pressure', how: 'Full pre-shot routine on every ball, 8 balls, no re-hits. A ball hit without your full routine counts as a miss. Score: successful balls out of 8, scaled to 10.' },
    { name: 'Last ball, three targets', how: 'Three balls, three targets, one ball per target. Hit all three to pass. Any miss resets the round, up to four attempts. Score: 10 for a first-attempt pass, minus 2 for each reset, 0 if you never pass.' },
    { name: 'Narrow fairway', how: 'Pick a narrow landing window for driver or 3-wood. 8 balls, one per shot, no re-hits. Score: balls inside the window out of 8, scaled to 10.' }
  ];

  const CAL_BLOCK_MINUTES = 5;      // 6 drills x 5 min = 30 min
  const TRANSFER_BLOCK_MINUTES = 6; // 5 tests x 6 min = 30 min

  /* ==========================================================
     Constants and small helpers
     ========================================================== */
  const VAULT_KEY = 'golfpractice.vault.v1';
  const LOCK_KEY = 'golfpractice.attempts.v1';
  const PBKDF2_ITER = 600000;
  const IDLE_MS = 10 * 60 * 1000;
  const MAX_ITEMS = 3000;

  const root = document.getElementById('root');
  const te = new TextEncoder();
  const td = new TextDecoder();

  const today = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  const num = (v, min, max) => {
    v = Number(v);
    if (!Number.isFinite(v)) return min;
    return Math.min(max, Math.max(min, v));
  };
  const arr = (v) => (Array.isArray(v) ? v.slice(0, MAX_ITEMS).filter((x) => x && typeof x === 'object') : []);
  const uid = () => {
    const b = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  };
  const shuffle = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  const avgArr = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const byDateDesc = (a, b) => b.date.localeCompare(a.date);
  const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const shortDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  // DOM builder. User text only ever goes in via textContent / text nodes, never innerHTML.
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    let value;
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'value') value = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : String(kid));
    }
    if (value !== undefined) el.value = value;
    return el;
  }
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, String(v));
    for (const kid of kids) if (kid != null) el.append(kid instanceof Node ? kid : String(kid));
    return el;
  }

  function toast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const el = h('div', { class: 'toast', role: 'status', text: msg });
    document.body.append(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ==========================================================
     Crypto: PBKDF2 -> AES-GCM. The passphrase is never stored.
     Being able to decrypt the vault is the login check.
     ========================================================== */
  function toB64(buf) {
    const b = new Uint8Array(buf);
    let out = '';
    for (let i = 0; i < b.length; i += 0x8000) out += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(out);
  }
  function fromB64(t) {
    const bin = atob(t);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function deriveKey(pass, salt, iter) {
    const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  async function encryptData(key, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj)));
    return { iv: toB64(iv), ct: toB64(ct) };
  }
  async function decryptData(key, iv, ct) {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) }, key, fromB64(ct));
    return JSON.parse(td.decode(pt));
  }
  const corrupt = () => Object.assign(new Error('corrupt'), { corrupt: true });
  function parseVault(raw) {
    let v;
    try { v = JSON.parse(raw); } catch (e) { throw corrupt(); }
    if (!v || v.v !== 1 || !Number.isInteger(v.iter) || v.iter < 100000 || v.iter > 5000000 ||
        typeof v.salt !== 'string' || typeof v.iv !== 'string' || typeof v.ct !== 'string' ||
        v.salt.length > 64 || v.iv.length > 32) throw corrupt();
    return v;
  }

  /* ==========================================================
     Data model and validation
     ========================================================== */
  const emptyData = () => ({ technique: [], calibration: [], transfer: [] });

  function cleanData(d) {
    const out = emptyData();
    if (!d || typeof d !== 'object') return out;
    for (const t of arr(d.technique)) {
      out.technique.push({
        id: str(t.id, 64) || uid(),
        date: isDate(t.date) ? t.date : today(),
        mechanics: str(t.mechanics, 200),
        notes: str(t.notes, 3000),
        improve: str(t.improve, 3000)
      });
    }
    for (const kind of ['calibration', 'transfer']) {
      for (const rec of arr(d[kind])) {
        out[kind].push({
          id: str(rec.id, 64) || uid(),
          date: isDate(rec.date) ? rec.date : today(),
          items: arr(rec.items).slice(0, 20).map((i) => ({
            id: str(i.id, 64) || uid(),
            cat: str(i.cat, 40),
            name: str(i.name, 120),
            how: str(i.how, 600),
            minutes: num(i.minutes, 0, 120),
            score: i.score == null ? null : Math.round(num(i.score, 0, 10)),
            passed: i.passed === true,
            notes: str(i.notes, 3000)
          }))
        });
      }
    }
    return out;
  }

  /* ==========================================================
     Session state (lives in memory only while unlocked)
     ========================================================== */
  let session = null; // { key, salt, iter, data }
  let ui = { tab: 'technique', mode: 'new' };
  let drafts = freshDrafts();
  let tickHandle = null;
  let idleHandle = null;
  let writeChain = Promise.resolve();

  function freshDrafts() {
    return { technique: { id: null, date: today(), mechanics: '', notes: '', improve: '' }, calibration: null, transfer: null };
  }
  function clearTimer() {
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = null;
  }

  function persist() {
    writeChain = writeChain.catch(() => {}).then(async () => {
      if (!session) return;
      const { iv, ct } = await encryptData(session.key, session.data);
      localStorage.setItem(VAULT_KEY, JSON.stringify({ v: 1, iter: session.iter, salt: toB64(session.salt), iv, ct }));
    });
    return writeChain;
  }

  async function unlock(pass) {
    const v = parseVault(localStorage.getItem(VAULT_KEY));
    const salt = fromB64(v.salt);
    const key = await deriveKey(pass, salt, v.iter);
    const data = await decryptData(key, v.iv, v.ct); // throws on a wrong passphrase
    session = { key, salt, iter: v.iter, data: cleanData(data) };
  }

  function lock() {
    clearTimeout(idleHandle);
    clearTimer();
    session = null;
    drafts = freshDrafts();
    ui = { tab: 'technique', mode: 'new' };
    renderLock();
  }

  function bump() {
    clearTimeout(idleHandle);
    if (!session) return;
    idleHandle = setTimeout(() => {
      if (tickHandle) { bump(); return; } // a practice timer is running, stay unlocked
      lock();
    }, IDLE_MS);
  }
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((e) => window.addEventListener(e, bump, { passive: true, capture: true }));

  // Failed-attempt delay. Offline guessing is limited mainly by the PBKDF2 cost.
  function getAttempts() {
    try {
      const a = JSON.parse(localStorage.getItem(LOCK_KEY));
      return { n: num(a.n, 0, 1000), until: num(a.until, 0, 8.64e15) };
    } catch (e) { return { n: 0, until: 0 }; }
  }
  function registerFailure() {
    const a = getAttempts();
    a.n += 1;
    if (a.n >= 3) a.until = Date.now() + Math.min(15 * 60 * 1000, Math.pow(2, a.n - 3) * 5000);
    localStorage.setItem(LOCK_KEY, JSON.stringify(a));
  }
  const resetAttempts = () => localStorage.removeItem(LOCK_KEY);

  function eraseAll() {
    const typed = window.prompt('This permanently deletes your practice log from this device. Type ERASE to continue.');
    if (typed !== 'ERASE') return;
    localStorage.removeItem(VAULT_KEY);
    localStorage.removeItem(LOCK_KEY);
    session = null;
    renderLock();
  }

  /* ==========================================================
     Lock screen: create passphrase / unlock
     ========================================================== */
  function renderLock() {
    clearTimer();
    root.replaceChildren(localStorage.getItem(VAULT_KEY) ? loginView() : setupView());
    const first = root.querySelector('input');
    if (first) first.focus();
  }

  function setupView() {
    const p1 = h('input', { type: 'password', autocomplete: 'new-password', required: true, minlength: 12, autocapitalize: 'off', spellcheck: 'false' });
    const p2 = h('input', { type: 'password', autocomplete: 'new-password', required: true, autocapitalize: 'off', spellcheck: 'false' });
    const msg = h('p', { class: 'msg', role: 'alert' });
    const btn = h('button', { type: 'submit', class: 'primary', text: 'Create log' });
    const form = h('form', {
      class: 'lock-form',
      onsubmit: async (e) => {
        e.preventDefault();
        if (p1.value.length < 12) { msg.textContent = 'Use at least 12 characters. Four random words works well.'; return; }
        if (p1.value !== p2.value) { msg.textContent = 'The two passphrases do not match.'; return; }
        btn.disabled = true;
        msg.textContent = 'Setting up encryption...';
        try {
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const key = await deriveKey(p1.value, salt, PBKDF2_ITER);
          session = { key, salt, iter: PBKDF2_ITER, data: emptyData() };
          await persist();
          p1.value = ''; p2.value = '';
          renderApp(true);
          bump();
        } catch (err) {
          session = null;
          btn.disabled = false;
          msg.textContent = 'Could not set up encryption in this browser. Use a current browser over https.';
        }
      }
    },
      h('label', { class: 'field' }, h('span', { class: 'lbl', text: 'Passphrase' }), p1),
      h('label', { class: 'field' }, h('span', { class: 'lbl', text: 'Repeat passphrase' }), p2),
      msg, btn);
    return h('div', { class: 'lock' },
      h('h1', { text: 'Golf practice log' }),
      h('p', { text: 'Create a passphrase. Your log is encrypted on this device with it and nothing is uploaded. If you forget the passphrase, the data cannot be recovered.' }),
      form);
  }

  function loginView() {
    const pass = h('input', { type: 'password', autocomplete: 'current-password', required: true, autocapitalize: 'off', spellcheck: 'false' });
    const msg = h('p', { class: 'msg', role: 'alert' });
    const btn = h('button', { type: 'submit', class: 'primary', text: 'Unlock' });
    let countdown = null;

    function refresh() {
      const wait = Math.ceil((getAttempts().until - Date.now()) / 1000);
      if (wait > 0) {
        btn.disabled = true;
        msg.textContent = 'Too many attempts. Try again in ' + wait + 's.';
        if (!countdown) countdown = setInterval(refresh, 1000);
      } else {
        btn.disabled = false;
        if (countdown) { clearInterval(countdown); countdown = null; msg.textContent = ''; }
      }
    }

    const form = h('form', {
      class: 'lock-form',
      onsubmit: async (e) => {
        e.preventDefault();
        if (getAttempts().until > Date.now()) return;
        btn.disabled = true;
        msg.textContent = 'Unlocking...';
        try {
          await unlock(pass.value);
          pass.value = '';
          resetAttempts();
          if (countdown) clearInterval(countdown);
          renderApp(true);
          bump();
        } catch (err) {
          pass.value = '';
          if (err && err.corrupt) {
            msg.textContent = 'The stored data is damaged. Erase it below and restore a backup.';
            btn.disabled = false;
          } else {
            registerFailure();
            msg.textContent = 'That passphrase did not work.';
            btn.disabled = false;
            refresh();
          }
        }
      }
    },
      h('label', { class: 'field' }, h('span', { class: 'lbl', text: 'Passphrase' }), pass),
      msg, btn,
      h('button', { type: 'button', class: 'link', text: 'Forgot the passphrase? Erase everything', onclick: eraseAll }));

    const view = h('div', { class: 'lock' },
      h('h1', { text: 'Golf practice log' }),
      h('p', { text: 'Enter your passphrase to open your log.' }),
      form);
    setTimeout(refresh, 0);
    return view;
  }

  /* ==========================================================
     App shell
     ========================================================== */
  const TABS = [['technique', 'Technique'], ['calibration', 'Calibration'], ['transfer', 'Transfer']];

  function renderApp(toTop) {
    clearTimer();
    let view;
    if (ui.tab === 'settings') view = settingsView();
    else if (ui.tab === 'technique') view = techniqueView();
    else view = sessionsView(ui.tab);

    const header = h('header', { class: 'top' },
      h('h1', { text: 'Golf practice log' }),
      h('div', { class: 'top-actions' },
        h('button', { type: 'button', class: 'ghost', text: 'Settings', onclick: () => { ui.tab = 'settings'; renderApp(true); } }),
        h('button', { type: 'button', class: 'ghost', text: 'Lock', onclick: lock })));
    const nav = h('nav', { class: 'tabs', 'aria-label': 'Sections' },
      TABS.map(([id, label]) => h('button', {
        type: 'button', class: 'tab', text: label,
        'aria-current': ui.tab === id ? 'page' : false,
        onclick: () => { ui.tab = id; renderApp(true); }
      })));
    root.replaceChildren(header, h('main', null, view), nav);
    if (toTop) window.scrollTo(0, 0);
  }

  function modeBar(newLabel) {
    return h('div', { class: 'seg-ctl', role: 'group', 'aria-label': 'View' },
      [['new', newLabel], ['history', 'History']].map(([m, l]) => h('button', {
        type: 'button', class: 'seg-btn', text: l,
        'aria-pressed': String(ui.mode === m),
        onclick: () => { ui.mode = m; renderApp(true); }
      })));
  }

  function field(label, control, hint) {
    return h('label', { class: 'field' }, h('span', { class: 'lbl', text: label }), hint ? h('span', { class: 'hint', text: hint }) : null, control);
  }
  function dateInput(obj) {
    const el = h('input', { type: 'date', required: true, value: obj.date });
    el.addEventListener('input', () => { obj.date = el.value; });
    return el;
  }
  function textInput(obj, key, max, ph) {
    const el = h('input', { type: 'text', maxlength: max, placeholder: ph || false, value: obj[key] });
    el.addEventListener('input', () => { obj[key] = el.value; });
    return el;
  }
  function textArea(obj, key, rows, max) {
    const el = h('textarea', { rows, maxlength: max, value: obj[key] });
    el.addEventListener('input', () => { obj[key] = el.value; });
    return el;
  }
  function upsert(list, rec) {
    const i = list.findIndex((x) => x.id === rec.id);
    if (i >= 0) list[i] = rec; else list.push(rec);
  }
  function entryShell(summary, body, onEdit, onDelete) {
    return h('details', { class: 'entry' },
      h('summary', null, summary),
      h('div', { class: 'entry-body' }, body,
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'ghost', text: 'Edit', onclick: onEdit }),
          h('button', { type: 'button', class: 'danger', text: 'Delete', onclick: onDelete }))));
  }
  async function removeRecord(kind, id) {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    session.data[kind] = session.data[kind].filter((x) => x.id !== id);
    await persist();
    renderApp();
    toast('Deleted');
  }

  /* ==========================================================
     Section 1: technique practice
     ========================================================== */
  function techniqueView() {
    return h('section', null,
      h('h2', { text: 'Technique practice' }),
      modeBar('New entry'),
      ui.mode === 'history' ? techniqueHistory() : techniqueForm());
  }

  function techniqueForm() {
    const d = drafts.technique;
    async function save() {
      if (!d.mechanics.trim()) { toast('Add the mechanics you worked on'); return; }
      upsert(session.data.technique, {
        id: d.id || uid(),
        date: isDate(d.date) ? d.date : today(),
        mechanics: d.mechanics.trim().slice(0, 200),
        notes: d.notes.trim().slice(0, 3000),
        improve: d.improve.trim().slice(0, 3000)
      });
      await persist();
      drafts.technique = freshDrafts().technique;
      ui.mode = 'history';
      renderApp(true);
      toast('Entry saved');
    }
    return h('div', { class: 'stack' },
      d.id ? h('p', { class: 'banner', text: 'Editing an earlier entry' }) : null,
      field('Date', dateInput(d)),
      field('Mechanics I worked on', textInput(d, 'mechanics', 200, 'For example: shallower lead wrist at the top')),
      field('How the practice went', textArea(d, 'notes', 5, 3000)),
      field('How to improve the next practice', textArea(d, 'improve', 5, 3000)),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: d.id ? 'Save changes' : 'Save entry', onclick: save }),
        d.id ? h('button', { type: 'button', class: 'ghost', text: 'Cancel edit', onclick: () => { drafts.technique = freshDrafts().technique; renderApp(); } }) : null));
  }

  function techniqueHistory() {
    const list = [...session.data.technique].sort(byDateDesc);
    if (!list.length) return h('p', { class: 'empty', text: 'No entries yet. Log your first practice under New entry.' });
    return h('div', null, list.map((t) => entryShell(
      [h('span', { class: 'd', text: fmtDate(t.date) }), h('span', { class: 'sum', text: t.mechanics })],
      [
        h('div', null, h('strong', { text: 'Mechanics' }), h('p', { class: 'notes', text: t.mechanics })),
        t.notes ? h('div', null, h('strong', { text: 'How it went' }), h('p', { class: 'notes', text: t.notes })) : null,
        t.improve ? h('div', null, h('strong', { text: 'Improve next time' }), h('p', { class: 'notes', text: t.improve })) : null
      ],
      () => { drafts.technique = { ...t }; ui.mode = 'new'; renderApp(true); },
      () => removeRecord('technique', t.id))));
  }

  /* ==========================================================
     Sections 2 and 3: timed sessions
     ========================================================== */
  const mkItem = (x, cat, minutes) => ({ id: uid(), cat, name: x.name, how: x.how, minutes, score: null, passed: false, notes: '' });

  function genCalibration() {
    const picks = shuffle(Object.keys(CAL)).map((c) => shuffle(CAL[c]).slice(0, 2).map((x) => mkItem(x, c, CAL_BLOCK_MINUTES)));
    return [picks[0][0], picks[1][0], picks[2][0], picks[0][1], picks[1][1], picks[2][1]];
  }
  function genTransfer() {
    return shuffle(TRANSFER).slice(0, 5).map((x) => mkItem(x, 'Pressure test', TRANSFER_BLOCK_MINUTES));
  }

  const META = {
    calibration: {
      title: 'Calibration practice', unit: 'drill', gen: genCalibration,
      intro: 'Thirty minutes of variability practice: six five-minute drills across face strike, low point and clubface direction. Change club, target and lie often, and score each drill out of 10.'
    },
    transfer: {
      title: 'Transfer training', unit: 'test', gen: genTransfer,
      intro: 'Thirty minutes of course-style pressure tests to carry your new mechanics onto the course. One ball per shot, no re-hits, and score each test out of 10.'
    }
  };

  function sessionsView(kind) {
    const meta = META[kind];
    return h('section', null,
      h('h2', { text: meta.title }),
      modeBar('New session'),
      ui.mode === 'history' ? sessionHistory(kind) : sessionNew(kind));
  }

  function sessionNew(kind) {
    const meta = META[kind];
    if (!drafts[kind]) {
      return h('div', { class: 'stack' },
        h('p', { class: 'lead', text: meta.intro }),
        h('button', {
          type: 'button', class: 'primary', text: 'Generate 30-minute session',
          onclick: () => { drafts[kind] = { id: null, date: today(), items: meta.gen(), timer: { base: 0, startedAt: null } }; renderApp(); }
        }));
    }
    return sessionForm(kind);
  }

  function itemCard(kind, item, i) {
    const out = h('output', { class: 'score-out', text: item.score == null ? 'Not scored' : item.score + ' / 10' });
    const range = h('input', { type: 'range', min: 0, max: 10, step: 1, 'aria-label': 'Score for ' + item.name });
    range.value = item.score == null ? 5 : item.score;
    range.addEventListener('input', () => { item.score = Number(range.value); out.textContent = item.score + ' / 10'; });

    let passed = null;
    if (kind === 'transfer') {
      const cb = h('input', { type: 'checkbox' });
      cb.checked = !!item.passed;
      cb.addEventListener('change', () => { item.passed = cb.checked; });
      passed = h('label', { class: 'check' }, cb, 'Passed');
    }
    const notes = h('textarea', { rows: 2, maxlength: 3000, placeholder: 'Notes', 'aria-label': 'Notes for ' + item.name, value: item.notes });
    notes.addEventListener('input', () => { item.notes = notes.value; });

    return h('li', { class: 'drill' },
      h('div', { class: 'drill-head' },
        h('span', { class: 'idx', text: String(i + 1) }),
        h('h3', { text: item.name }),
        h('span', { class: 'tag', text: item.cat + ', ' + item.minutes + ' min' })),
      h('p', { class: 'how', text: item.how }),
      h('div', { class: 'score-row' }, range, out),
      passed, notes);
  }

  function fmtClock(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  }

  function timerWidget(d, cards) {
    const t = d.timer;
    const total = d.items.reduce((a, i) => a + i.minutes * 60, 0);
    const clock = h('div', { class: 'clock', role: 'timer' });
    const nowLabel = h('p', { class: 'now-label' });
    const fills = [];
    const segs = d.items.map((it) => {
      const f = h('span', { class: 'fill' });
      fills.push(f);
      const seg = h('span', { class: 'tseg' }, f);
      seg.style.flexGrow = String(it.minutes);
      return seg;
    });
    const toggle = h('button', { type: 'button', class: 'primary' });
    const reset = h('button', { type: 'button', class: 'ghost', text: 'Reset timer' });

    const elapsed = () => Math.min(total, t.base + (t.startedAt ? (Date.now() - t.startedAt) / 1000 : 0));

    function paint() {
      let e = elapsed();
      if (t.startedAt && e >= total) {
        t.base = total; t.startedAt = null; e = total;
        clearTimer();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
      clock.textContent = fmtClock(total - e);
      let acc = 0, cur = -1;
      d.items.forEach((it, i) => {
        const len = it.minutes * 60;
        fills[i].style.width = (Math.min(1, Math.max(0, (e - acc) / len)) * 100) + '%';
        if (e >= acc && e < acc + len) cur = i;
        acc += len;
      });
      segs.forEach((sg, i) => sg.classList.toggle('on', i === cur));
      cards.forEach((c, i) => c.classList.toggle('now', i === cur));
      if (e >= total) nowLabel.textContent = 'Time is up. Finish scoring below.';
      else if (t.startedAt) nowLabel.textContent = 'Now: ' + d.items[cur].name;
      else nowLabel.textContent = e > 0 ? 'Paused' : 'Press Start when you are ready.';
      toggle.textContent = t.startedAt ? 'Pause' : (e > 0 && e < total ? 'Resume' : 'Start');
    }
    function startTick() { clearTimer(); tickHandle = setInterval(paint, 250); }

    toggle.addEventListener('click', () => {
      if (t.startedAt) { t.base = elapsed(); t.startedAt = null; clearTimer(); }
      else { if (t.base >= total) t.base = 0; t.startedAt = Date.now(); startTick(); }
      paint();
    });
    reset.addEventListener('click', () => { t.base = 0; t.startedAt = null; clearTimer(); paint(); });

    if (t.startedAt) startTick();
    paint();
    return h('div', null, clock, h('div', { class: 'timeline', 'aria-hidden': 'true' }, segs), nowLabel, h('div', { class: 'actions' }, toggle, reset));
  }

  function sessionForm(kind) {
    const d = drafts[kind];
    const meta = META[kind];
    const editing = !!d.id;
    const cards = d.items.map((it, i) => itemCard(kind, it, i));

    async function save() {
      if (!d.items.some((i) => i.score !== null)) { toast('Score at least one ' + meta.unit); return; }
      upsert(session.data[kind], {
        id: d.id || uid(),
        date: isDate(d.date) ? d.date : today(),
        items: d.items.map((i) => ({ id: i.id, cat: i.cat, name: i.name, how: i.how, minutes: i.minutes, score: i.score, passed: !!i.passed, notes: i.notes.trim() }))
      });
      await persist();
      drafts[kind] = null;
      ui.mode = 'history';
      renderApp(true);
      toast('Session saved');
    }
    function regenerate() {
      if (d.items.some((i) => i.score !== null) && !window.confirm('Replace this plan? Scores you entered will be lost.')) return;
      drafts[kind] = { id: null, date: d.date, items: meta.gen(), timer: { base: 0, startedAt: null } };
      renderApp();
    }
    function discard() {
      if (!window.confirm(editing ? 'Discard your changes?' : 'Discard this session?')) return;
      drafts[kind] = null;
      renderApp();
    }

    return h('div', { class: 'stack' },
      editing ? h('p', { class: 'banner', text: 'Editing an earlier session' }) : null,
      field('Date', dateInput(d)),
      editing ? null : timerWidget(d, cards),
      h('ol', { class: 'drills' }, cards),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'primary', text: editing ? 'Save changes' : 'Save session', onclick: save }),
        editing ? null : h('button', { type: 'button', class: 'ghost', text: 'New plan', onclick: regenerate }),
        h('button', { type: 'button', class: 'ghost', text: editing ? 'Cancel edit' : 'Discard', onclick: discard })));
  }

  function sessionSummary(kind, rec) {
    const scored = rec.items.filter((i) => i.score != null);
    if (!scored.length) return 'No scores';
    if (kind === 'calibration') return 'Average ' + avgArr(scored.map((i) => i.score)).toFixed(1);
    const pts = scored.reduce((a, i) => a + i.score, 0);
    const passed = rec.items.filter((i) => i.passed).length;
    return pts + ' of ' + rec.items.length * 10 + ' points, ' + passed + ' of ' + rec.items.length + ' passed';
  }

  function sessionHistory(kind) {
    const list = [...session.data[kind]].sort(byDateDesc);
    if (!list.length) return h('p', { class: 'empty', text: 'No sessions yet. Generate your first one under New session.' });
    const nodes = [];
    if (kind === 'calibration') nodes.push(chartBlock(session.data.calibration));
    list.forEach((rec) => {
      nodes.push(entryShell(
        [h('span', { class: 'd', text: fmtDate(rec.date) }), h('span', { class: 'sum', text: sessionSummary(kind, rec) })],
        rec.items.map((it) => h('div', { class: 'hist-item' },
          h('strong', { text: it.name }),
          h('p', { class: 'tag', text: it.cat + ', ' + it.minutes + ' min' }),
          h('p', { text: it.score == null ? 'Not scored' : 'Score ' + it.score + ' / 10' + (kind === 'transfer' ? (it.passed ? ', passed' : ', not passed') : '') }),
          it.notes ? h('p', { class: 'notes', text: it.notes }) : null)),
        () => { drafts[kind] = { id: rec.id, date: rec.date, items: rec.items.map((i) => ({ ...i })), timer: { base: 0, startedAt: null } }; ui.mode = 'new'; renderApp(true); },
        () => removeRecord(kind, rec.id)));
    });
    return h('div', null, nodes);
  }

  function chartBlock(sessions) {
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
    if (sorted.length < 2) return h('p', { class: 'hint', text: 'Log two or more sessions to see your trend by category.' });
    const cats = Object.keys(CAL);
    const W = 320, H = 170, L = 24, R = 8, T = 8, B = 24;
    const x = (i) => L + i * (W - L - R) / (sorted.length - 1);
    const y = (v) => T + (10 - v) * (H - T - B) / 10;
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img', 'aria-label': 'Average score for each category across your calibration sessions' });
    [0, 5, 10].forEach((v) => {
      svg.append(s('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' }),
        s('text', { x: L - 4, y: y(v) + 3, class: 'axis', 'text-anchor': 'end' }, String(v)));
    });
    cats.forEach((c, ci) => {
      const pts = sorted.map((rec, i) => {
        const sc = rec.items.filter((it) => it.cat === c && it.score != null).map((it) => it.score);
        return sc.length ? { x: x(i), y: y(avgArr(sc)) } : null;
      }).filter(Boolean);
      if (pts.length > 1) svg.append(s('polyline', { points: pts.map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' '), class: 'line l' + ci }));
      pts.forEach((p) => svg.append(s('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 3, class: 'pt l' + ci })));
    });
    svg.append(s('text', { x: L, y: H - 8, class: 'axis' }, shortDate(sorted[0].date)),
      s('text', { x: W - R, y: H - 8, class: 'axis', 'text-anchor': 'end' }, shortDate(sorted[sorted.length - 1].date)));
    return h('div', null, svg,
      h('ul', { class: 'legend' }, cats.map((c, ci) => h('li', null, h('span', { class: 'swatch l' + ci }), c))));
  }

  /* ==========================================================
     Settings: backup, restore, change passphrase, erase
     ========================================================== */
  function exportBackup() {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return;
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const a = h('a', { href: url, download: 'golf-practice-backup-' + today() + '.json' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function settingsView() {
    const status = () => h('p', { class: 'msg', role: 'status' });

    // Backup
    const expMsg = status();
    // Restore
    const file = h('input', { type: 'file', accept: 'application/json,.json', 'aria-label': 'Backup file' });
    const bpass = h('input', { type: 'password', autocomplete: 'off', autocapitalize: 'off', 'aria-label': 'Passphrase the backup was made with' });
    const impMsg = status();
    const restoreBtn = h('button', { type: 'button', class: 'ghost', text: 'Restore backup' });
    restoreBtn.addEventListener('click', async () => {
      impMsg.className = 'msg';
      const f = file.files && file.files[0];
      if (!f || f.size > 20 * 1024 * 1024) { impMsg.textContent = 'Choose a backup file first.'; return; }
      if (!bpass.value) { impMsg.textContent = 'Enter the passphrase the backup was made with.'; return; }
      restoreBtn.disabled = true;
      impMsg.textContent = 'Checking backup...';
      try {
        const v = parseVault(await f.text());
        const key = await deriveKey(bpass.value, fromB64(v.salt), v.iter);
        const data = cleanData(await decryptData(key, v.iv, v.ct));
        if (!window.confirm('Replace everything in this log with the backup?')) { impMsg.textContent = ''; restoreBtn.disabled = false; return; }
        session.data = data;
        await persist();
        bpass.value = ''; file.value = '';
        impMsg.className = 'msg ok';
        impMsg.textContent = 'Backup restored.';
      } catch (err) {
        impMsg.textContent = 'Could not open that backup. Check the file and passphrase.';
      }
      restoreBtn.disabled = false;
    });

    // Change passphrase
    const cur = h('input', { type: 'password', autocomplete: 'current-password', autocapitalize: 'off', 'aria-label': 'Current passphrase' });
    const n1 = h('input', { type: 'password', autocomplete: 'new-password', autocapitalize: 'off', 'aria-label': 'New passphrase' });
    const n2 = h('input', { type: 'password', autocomplete: 'new-password', autocapitalize: 'off', 'aria-label': 'Repeat new passphrase' });
    const pwMsg = status();
    const pwBtn = h('button', { type: 'button', class: 'primary', text: 'Change passphrase' });
    pwBtn.addEventListener('click', async () => {
      pwMsg.className = 'msg';
      if (n1.value.length < 12) { pwMsg.textContent = 'Use at least 12 characters.'; return; }
      if (n1.value !== n2.value) { pwMsg.textContent = 'The new passphrases do not match.'; return; }
      pwBtn.disabled = true;
      pwMsg.textContent = 'Working...';
      try {
        const v = parseVault(localStorage.getItem(VAULT_KEY));
        const k = await deriveKey(cur.value, fromB64(v.salt), v.iter);
        await decryptData(k, v.iv, v.ct); // proves the current passphrase
        const salt = crypto.getRandomValues(new Uint8Array(16));
        session.key = await deriveKey(n1.value, salt, PBKDF2_ITER);
        session.salt = salt;
        session.iter = PBKDF2_ITER;
        await persist();
        cur.value = ''; n1.value = ''; n2.value = '';
        pwMsg.className = 'msg ok';
        pwMsg.textContent = 'Passphrase changed. Old backups still need the old passphrase.';
      } catch (err) {
        pwMsg.textContent = 'The current passphrase did not work.';
      }
      pwBtn.disabled = false;
    });

    return h('section', { class: 'stack' },
      h('h2', { text: 'Settings' }),
      h('div', { class: 'panel' },
        h('h3', { text: 'Back up' }),
        h('p', { text: 'Downloads an encrypted copy of your log. It can only be opened with your passphrase, so it is safe to keep in cloud storage.' }),
        h('div', { class: 'actions' }, h('button', { type: 'button', class: 'primary', text: 'Download backup', onclick: () => { exportBackup(); expMsg.className = 'msg ok'; expMsg.textContent = 'Backup downloaded.'; } })),
        expMsg),
      h('div', { class: 'panel' },
        h('h3', { text: 'Restore' }),
        h('p', { text: 'Replaces this log with a backup file. Enter the passphrase that backup was made with.' }),
        file, bpass, h('div', { class: 'actions' }, restoreBtn), impMsg),
      h('div', { class: 'panel' },
        h('h3', { text: 'Change passphrase' }),
        cur, n1, n2, h('div', { class: 'actions' }, pwBtn), pwMsg),
      h('div', { class: 'panel' },
        h('h3', { text: 'Erase everything' }),
        h('p', { text: 'Deletes your log from this device. Download a backup first if you want to keep it.' }),
        h('div', { class: 'actions' }, h('button', { type: 'button', class: 'danger', text: 'Erase all data', onclick: eraseAll }))));
  }

  renderLock();
})();
