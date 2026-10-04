'use strict';
/* Owner tool: set the access phrase and check it. Everything happens on this page; nothing is uploaded.
   A new phrase does nothing until the new access.json is saved in the GitHub repository. */
(function () {
  const root = document.getElementById('root');
  const C = window.AccessCore;
  if (!C) { root.textContent = 'access-core.js did not load. Check it is in your GitHub repository with exactly that name, then reload this page.'; return; }
  try {
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
    async function copy(text, note) {
      try { await navigator.clipboard.writeText(text); note.textContent = 'Copied.'; } catch (e) { note.textContent = 'Select the text and copy it.'; }
    }

    // 1. choose and save a phrase
    const phraseInput = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', placeholder: 'Type a phrase or tap Suggest a phrase', 'aria-label': 'New access phrase' });
    const makeMsg = h('p', { class: 'msg', role: 'status' });
    const shown = h('p', { class: 'invite-code', hidden: true });
    const output = h('textarea', { rows: 8, readonly: true, spellcheck: 'false', 'aria-label': 'New access.json' });
    const outBox = h('div', { class: 'stack', hidden: true });
    const copyNote = h('p', { class: 'msg ok', role: 'status' });
    const phraseNote = h('p', { class: 'msg ok', role: 'status' });
    const suggestBtn = h('button', { type: 'button', class: 'ghost', text: 'Suggest a phrase', onclick: () => { phraseInput.value = C.suggestPhrase(4); makeMsg.textContent = ''; } });
    const makeBtn = h('button', { type: 'button', class: 'primary', text: 'Make access.json', onclick: make });
    async function make() {
      makeMsg.className = 'msg';
      outBox.hidden = true; // only ever show the result of the latest attempt
      const phrase = phraseInput.value.trim();
      if (C.normalise(phrase).length < C.MIN_LENGTH) { makeMsg.textContent = 'That is too short to be safe. Use at least 16 letters or numbers. Tapping Suggest a phrase gives a good one.'; return; }
      makeBtn.disabled = true;
      makeMsg.textContent = 'Working...';
      try {
        const access = await C.makeAccess(phrase);
        output.value = JSON.stringify(access, null, 2) + '\n';
        shown.textContent = phrase;
        shown.hidden = false;
        outBox.hidden = false;
        makeMsg.className = 'msg ok';
        makeMsg.textContent = 'Done. Now save the file below in GitHub.';
      } catch (e) {
        makeMsg.textContent = 'Could not make the file in this browser.';
      }
      makeBtn.disabled = false;
    }
    outBox.append(
      h('strong', { text: 'Your access phrase' }), shown,
      h('div', { class: 'actions' }, h('button', { type: 'button', class: 'ghost', text: 'Copy the phrase', onclick: () => copy(shown.textContent, phraseNote) })), phraseNote,
      h('p', { class: 'hint', text: 'Write the phrase down somewhere safe and send it to the people you want to let in. It is not stored anywhere, so this is the only place you will see it.' }),
      h('strong', { text: 'Now save this file' }),
      h('p', { class: 'hint', text: 'Copy it, open access.json in your GitHub repository, tap the pencil, replace everything with this, and commit. GitHub can take about ten minutes to publish it.' }),
      output, h('div', { class: 'actions' }, h('button', { type: 'button', class: 'ghost', text: 'Copy access.json', onclick: () => copy(output.value, copyNote) })), copyNote);

    // 2. check a phrase against the live site
    const checkInput = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', placeholder: 'Type the phrase you want to test', 'aria-label': 'Phrase to check' });
    const checkMsg = h('p', { class: 'msg', role: 'status' });
    const checkBtn = h('button', { type: 'button', class: 'ghost', text: 'Check it against the live site', onclick: async () => {
      checkMsg.className = 'msg';
      checkBtn.disabled = true;
      checkMsg.textContent = 'Checking...';
      try {
        const r = await fetch('access.json', { cache: 'no-store' });
        if (!r.ok) throw new Error('missing');
        const res = await C.verify(await r.json(), checkInput.value);
        if (res.ok) { checkMsg.className = 'msg ok'; checkMsg.textContent = 'Yes. That is the phrase the live site accepts right now.'; }
        else if (res.reason === 'short') checkMsg.textContent = 'That is too short to be the phrase.';
        else if (res.reason === 'old') checkMsg.textContent = 'The live access.json is in the old format. Make a new one above and save it.';
        else if (res.reason === 'file') checkMsg.textContent = 'The live access.json could not be read.';
        else checkMsg.textContent = 'No. That is not the phrase the live site accepts. Either it is typed differently, or the saved access.json was made with another phrase.';
      } catch (e) {
        checkMsg.textContent = 'Could not reach access.json on this site. Open this page from your site address, not from a downloaded file.';
      }
      checkBtn.disabled = false;
    } });

    root.replaceChildren(h('main', { class: 'stack' },
      h('div', { class: 'page-title' }, h('h2', { text: 'Access phrase' })),
      h('p', { class: 'lead', text: 'Anyone who knows the access phrase can open the app. It never expires. To lock someone out, make a new phrase and give it only to the people you want. Everyone else is stopped the next time they open the app online.' }),
      h('div', { class: 'card stack' }, h('strong', { text: '1. Make a phrase' }), phraseInput, h('div', { class: 'actions' }, suggestBtn, makeBtn), makeMsg, outBox),
      h('div', { class: 'card stack' }, h('strong', { text: '2. Not sure which phrase is live?' }),
        h('p', { class: 'hint', text: 'Type a phrase to test it against the access.json that is on your site right now.' }), checkInput, h('div', { class: 'actions' }, checkBtn), checkMsg)));
  } catch (e) { root.textContent = 'This page hit a problem: ' + e.message; }
})();
