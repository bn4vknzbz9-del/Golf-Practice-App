'use strict';
/* Invite codes. Each invitee gets a 16 character code such as K7QM-4XNP-9TRW-ABCD.
   The first 4 characters are a public id. The other 12 are secret and are never stored:
   access.json only holds a salted PBKDF2 hash of them. */
(function (root) {
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 characters, no 0, 1, I or O, so 5 bits each
  const ITER = 600000;
  const te = new TextEncoder();

  function toB64(buf) {
    const b = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function fromB64(t) {
    const bin = atob(t);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  const normalise = (raw) => String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const format = (raw) => normalise(raw).replace(/(.{4})(?=.)/g, '$1-');
  function randomChars(n) {
    const bytes = crypto.getRandomValues(new Uint8Array(n));
    let out = '';
    for (const b of bytes) out += ALPHABET[b % 32]; // 256 is a multiple of 32, so every character is equally likely
    return out;
  }
  async function derive(secret, saltB64, iter) {
    const base = await crypto.subtle.importKey('raw', te.encode(secret), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromB64(saltB64), iterations: iter, hash: 'SHA-256' }, base, 256);
    return toB64(bits);
  }
  // Makes a new invite. The code is returned once; only the hash goes in access.json.
  async function makeInvite(name, existingIds, iter) {
    let id = randomChars(4);
    while ((existingIds || []).includes(id)) id = randomChars(4);
    const secret = randomChars(12);
    const salt = toB64(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await derive(secret, salt, iter || ITER);
    return { code: format(id + secret), invite: { id, name: String(name || '').trim().slice(0, 60), salt, hash } };
  }
  function validList(list) {
    return !!list && list.v === 1 && Number.isInteger(list.iter) && list.iter >= 100000 && list.iter <= 5000000 && Array.isArray(list.invites) &&
      list.invites.every((i) => i && typeof i.id === 'string' && i.id.length === 4 && typeof i.salt === 'string' && typeof i.hash === 'string');
  }
  // Checks a typed code against access.json. Always does one derivation so a wrong id takes as long as a wrong secret.
  async function verify(list, raw) {
    const code = normalise(raw);
    if (code.length !== 16) return { ok: false, reason: 'format' };
    if (!validList(list)) return { ok: false, reason: 'list' };
    const entry = list.invites.find((i) => i.id === code.slice(0, 4));
    const hash = await derive(code.slice(4), entry ? entry.salt : toB64(new Uint8Array(16)), list.iter);
    if (entry && hash === entry.hash) return { ok: true, entry, hash };
    return { ok: false, reason: 'wrong' };
  }

  root.AccessCore = { ALPHABET, ITER, normalise, format, derive, makeInvite, validList, verify, toB64, fromB64 };
})(typeof window !== 'undefined' ? window : globalThis);
