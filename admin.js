'use strict';
/* Owner tool: make invite codes and edit access.json. Everything happens on this page; nothing is uploaded.
   Making a code here does nothing until the new access.json is saved in the GitHub repository. */
(function () {
  const root = document.getElementById('root');
  const C = window.AccessCore;
  if (!C) { root.textContent = 'access-core.js did not load. Check it is in your GitHub repository with exactly that name, then reload this page.'; return; }
  try {
  const state = { data: { v: 1, iter: C.ITER, invites: [] }, fresh: null };

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
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
    if (value !== undefined) el.value = value;
    return el;
  }

  const pasted = h('textarea', { rows: 6, spellcheck: 'false', placeholder: 'Paste the current access.json here (leave empty to start a new list)', 'aria-label': 'Current access.json' });
  const pasteMsg = h('p', { class: 'msg', role: 'status' });
  const listBox = h('div', { class: 'group' });
  const nameInput = h('input', { type: 'text', maxlength: 60, placeholder: 'Their name, for example Sam', 'aria-label': 'Name of the person' });
  const createMsg = h('p', { class: 'msg', role: 'status' });
  const codeBox = h('div', { class: 'avg', hidden: true });
  const output = h('textarea', { rows: 10, readonly: true, spellcheck: 'false', 'aria-label': 'New access.json' });
  const copyBtn = h('button', { type: 'button', class: 'ghost', text: 'Copy the new access.json' });
  const copyMsg = h('p', { class: 'msg ok', role: 'status' });

  const json = () => JSON.stringify(state.data, null, 2) + '\n';
  function refresh() {
    output.value = json();
    listBox.replaceChildren(...(state.data.invites.length
      ? state.data.invites.map((i) => h('div', { class: 'mech-list-row' },
        h('span', { text: (i.name || 'No name') + ' (' + i.id + ')' }),
        h('button', { type: 'button', class: 'ghost', text: 'Remove', 'aria-label': 'Remove ' + (i.name || i.id), onclick: () => { state.data.invites = state.data.invites.filter((x) => x.id !== i.id); state.fresh = null; codeBox.hidden = true; refresh(); } })))
      : [h('p', { class: 'empty', text: 'No invites yet.' })]));
  }

  pasted.addEventListener('input', () => {
    const text = pasted.value.trim();
    pasteMsg.className = 'msg';
    if (!text) { state.data = { v: 1, iter: C.ITER, invites: [] }; pasteMsg.textContent = ''; refresh(); return; }
    try {
      const parsed = JSON.parse(text);
      if (!C.validList(parsed)) throw new Error('shape');
      state.data = parsed;
      pasteMsg.className = 'msg ok';
      pasteMsg.textContent = 'Loaded ' + parsed.invites.length + ' invite' + (parsed.invites.length === 1 ? '' : 's') + '.';
    } catch (e) {
      pasteMsg.textContent = 'That does not look like an access.json file.';
    }
    refresh();
  });

  async function create() {
    createMsg.className = 'msg';
    const name = nameInput.value.trim();
    if (!name) { createMsg.textContent = 'Type their name first.'; return; }
    createBtn.disabled = true;
    createMsg.textContent = 'Making the code...';
    try {
      const made = await C.makeInvite(name, state.data.invites.map((i) => i.id), state.data.iter);
      state.data.invites.push(made.invite);
      state.fresh = made;
      nameInput.value = '';
      codeBox.hidden = false;
      codeBox.replaceChildren(h('strong', { text: 'Invite code for ' + made.invite.name }), h('p', { class: 'invite-code', text: made.code }),
        h('p', { class: 'hint', text: 'Send this to them now. It is not stored anywhere and cannot be shown again. Then save the new access.json below in your GitHub repository.' }));
      createMsg.className = 'msg ok';
      createMsg.textContent = 'Done.';
      refresh();
    } catch (e) {
      createMsg.textContent = 'Could not make a code in this browser.';
    }
    createBtn.disabled = false;
  }
  const createBtn = h('button', { type: 'button', class: 'primary', text: 'Make an invite code', onclick: create });
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(output.value); copyMsg.textContent = 'Copied.'; }
    catch (e) { output.focus(); output.select(); copyMsg.textContent = 'Select all and copy.'; }
  });

  root.replaceChildren(h('main', { class: 'stack' },
    h('div', { class: 'page-title' }, h('h2', { text: 'Invites' })),
    h('p', { class: 'lead', text: 'Only people with an invite code can open the app. Make a code for each person, then save the new access.json file in your GitHub repository. To remove someone, remove them here and save the file again.' }),
    h('div', { class: 'card stack' }, h('strong', { text: '1. Start from your current list' }), pasted, pasteMsg, listBox),
    h('div', { class: 'card stack' }, h('strong', { text: '2. Add a person' }), nameInput, h('div', { class: 'actions' }, createBtn), createMsg, codeBox),
    h('div', { class: 'card stack' }, h('strong', { text: '3. Save the new list' }),
      h('p', { class: 'hint', text: 'Copy this, open access.json in your GitHub repository, tap the pencil, replace everything with this, and commit. It can take about ten minutes to take effect.' }),
      output, h('div', { class: 'actions' }, copyBtn), copyMsg)));
  refresh();
  } catch (e) { root.textContent = 'This page hit a problem: ' + e.message; }
})();
