'use strict';
/* The front door. The app only loads after the access phrase has been entered on this device.
   If the owner changes the phrase in access.json, the door closes the next time that phone opens the app online. */
(function () {
  const GRANT_KEY = 'golfpractice.access.v2';
  const TRIES_KEY = 'golfpractice.access.tries.v1';
  const GRACE_MS = 30 * 24 * 60 * 60 * 1000; // how long a phone is trusted when access.json cannot be reached
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
  const drop = (k) => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } };

  async function loadAccess() {
    const r = await fetch('access.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('missing');
    return r.json();
  }
  function startApp() {
    const sc = document.createElement('script');
    sc.src = 'app.js';
    sc.onerror = () => showGate('The app could not be loaded. Check your connection and reload.');
    document.head.append(sc);
  }

  function showGate(note) {
    const input = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', required: true, placeholder: 'for example mako-tibe-ruso-leda', 'aria-label': 'Access phrase' });
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
          const access = await loadAccess();
          const res = await C.verify(access, input.value);
          if (res.ok) {
            write(GRANT_KEY, { hash: res.hash, checked: Date.now() });
            drop(TRIES_KEY);
            startApp();
            return;
          }
          if (res.reason === 'old') { msg.textContent = 'The access file is in an old format. The owner needs to make a new one on the admin page.'; btn.disabled = false; return; }
          if (res.reason === 'file') { msg.textContent = 'The access file could not be read. Tell the owner.'; btn.disabled = false; return; }
          tries.n += 1;
          if (tries.n >= 3) tries.until = Date.now() + Math.min(15 * 60 * 1000, Math.pow(2, tries.n - 3) * 5000);
          write(TRIES_KEY, tries);
          msg.textContent = res.reason === 'short' ? 'That phrase is too short. It has at least four words.' : 'That is not the access phrase.';
        } catch (err) {
          msg.textContent = 'Could not check the phrase. Check your connection and try again.';
        }
        input.value = '';
        btn.disabled = false;
      }
    }, h('label', { class: 'field' }, h('span', { class: 'lbl', text: 'Access phrase' }), input), msg, btn);
    root.replaceChildren(h('div', { class: 'lock' }, icon(), h('h1', { text: 'Golf practice log' }),
      h('p', { text: 'This app is private. Enter the access phrase you were given. Capital letters and dashes do not matter.' }), form));
    input.focus();
  }

  async function check() {
    const saved = read(GRANT_KEY);
    if (!saved) { showGate(); return; }
    try {
      const access = await loadAccess();
      if (C.validAccess(access) && access.hash === saved.hash) { write(GRANT_KEY, { ...saved, checked: Date.now() }); startApp(); return; }
      drop(GRANT_KEY);
      showGate('The access phrase has changed. Ask the owner for the new one. Phrases never expire; they only stop working when the owner changes them.');
    } catch (err) {
      // access.json could not be reached, for example with no signal at the range
      if (Date.now() - (saved.checked || 0) < GRACE_MS) startApp();
      else showGate('Could not check your access. Connect to the internet and try again.');
    }
  }
  try { check(); } catch (e) { root.textContent = 'This page hit a problem: ' + e.message; }
})();
