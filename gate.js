'use strict';
/* The front door. The app only loads after a valid invite code has been entered on this device.
   Revoking an invite in access.json shuts the door the next time that person opens the app online. */
(function () {
  const GRANT_KEY = 'golfpractice.access.v1';
  const TRIES_KEY = 'golfpractice.access.tries.v1';
  const GRACE_MS = 30 * 24 * 60 * 60 * 1000; // how long an invite is trusted when access.json cannot be reached
  const C = window.AccessCore;
  const root = document.getElementById('root');
  if (!C) { root.textContent = 'access-core.js did not load. Check it is in your GitHub repository with exactly that name, then reload this page.'; return; }

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
    return el;
  }
  const NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, String(v));
    return el;
  }
  function icon() {
    const svg = s('svg', { viewBox: '0 0 84 84', class: 'app-icon', role: 'img', 'aria-label': 'Golf practice log' });
    svg.append(s('rect', { width: 84, height: 84, rx: 19 }), s('path', { d: 'M33 64V20' }), s('path', { class: 'flag', d: 'M33 21l24 9.5l-24 9.5z' }), s('path', { d: 'M22 64h24' }));
    return svg;
  }

  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

  async function loadList() {
    const r = await fetch('access.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('list');
    return r.json();
  }
  function startApp() {
    const sc = document.createElement('script');
    sc.src = 'app.js';
    sc.onerror = () => showGate('The app could not be loaded. Check your connection and reload.');
    document.head.append(sc);
  }

  function showGate(note) {
    const input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', required: true, maxlength: 19, placeholder: 'XXXX-XXXX-XXXX-XXXX', 'aria-label': 'Invite code' });
    input.addEventListener('input', () => { input.value = C.format(input.value).slice(0, 19); });
    const msg = h('p', { class: 'msg', role: 'alert', text: note || '' });
    const btn = h('button', { type: 'submit', class: 'primary', text: 'Continue' });
    const form = h('form', {
      class: 'lock-form',
      onsubmit: async (e) => {
        e.preventDefault();
        const tries = read(TRIES_KEY) || { n: 0, until: 0 };
        if (tries.until > Date.now()) { msg.textContent = 'Too many tries. Wait ' + Math.ceil((tries.until - Date.now()) / 1000) + ' seconds.'; return; }
        btn.disabled = true;
        msg.textContent = 'Checking...';
        try {
          const list = await loadList();
          const res = await C.verify(list, input.value);
          if (res.ok) {
            write(GRANT_KEY, { id: res.entry.id, hash: res.hash, checked: Date.now() });
            try { localStorage.removeItem(TRIES_KEY); } catch (err) { /* ignore */ }
            startApp();
            return;
          }
          tries.n += 1;
          if (tries.n >= 3) tries.until = Date.now() + Math.min(15 * 60 * 1000, Math.pow(2, tries.n - 3) * 5000);
          write(TRIES_KEY, tries);
          msg.textContent = res.reason === 'format' ? 'An invite code has 16 letters and numbers.' : 'That invite code did not work.';
        } catch (err) {
          msg.textContent = 'Could not check the code. Check your connection and try again.';
        }
        input.value = '';
        btn.disabled = false;
      }
    }, h('label', { class: 'field' }, h('span', { class: 'lbl', text: 'Invite code' }), input), msg, btn);
    root.replaceChildren(h('div', { class: 'lock' }, icon(), h('h1', { text: 'Golf practice log' }), h('p', { text: 'This app is by invitation only. Enter the invite code you were given.' }), form));
    input.focus();
  }

  async function check() {
    const saved = read(GRANT_KEY);
    if (!saved) { showGate(); return; }
    try {
      const list = await loadList();
      const entry = C.validList(list) && list.invites.find((i) => i.id === saved.id && i.hash === saved.hash);
      if (entry) { write(GRANT_KEY, { ...saved, checked: Date.now() }); startApp(); return; }
      try { localStorage.removeItem(GRANT_KEY); } catch (err) { /* ignore */ }
      showGate('Your access has ended. Ask for a new invite code.');
    } catch (err) {
      // access.json could not be reached, for example with no signal at the range
      if (Date.now() - (saved.checked || 0) < GRACE_MS) startApp();
      else showGate('Could not check your access. Connect to the internet and try again.');
    }
  }
  try { check(); } catch (e) { root.textContent = 'This page hit a problem: ' + e.message; }
})();
