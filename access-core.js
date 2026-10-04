'use strict';
/* One access phrase for everyone you let in. access.json holds only a salted PBKDF2 hash of the phrase, never the phrase.
   The phrase is what you share. Change it and everyone who does not know the new one is locked out on their next visit. */
(function (root) {
  const ITER = 600000;
  const MIN_LENGTH = 16; // letters and numbers, after spaces and dashes are removed
  const CONSONANTS = 'bdfghjklmnprstvz'; // 16 of them, so every one is equally likely from a random byte
  const VOWELS = 'aeiou';
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
  // Case, spaces, dashes and punctuation do not matter when the phrase is typed.
  const normalise = (raw) => String(raw || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  function randomVowel() {
    for (;;) { const b = crypto.getRandomValues(new Uint8Array(1))[0]; if (b < 250) return VOWELS[b % 5]; } // 250 is a multiple of 5
  }
  function randomConsonant() { return CONSONANTS[crypto.getRandomValues(new Uint8Array(1))[0] % 16]; }
  // Words like mako or tibe: easy to say and to read out. Four of them are about 50 bits, far more than anyone can guess.
  function suggestPhrase(words) {
    const out = [];
    for (let i = 0; i < (words || 4); i++) out.push(randomConsonant() + randomVowel() + randomConsonant() + randomVowel());
    return out.join('-');
  }
  async function derive(secret, saltB64, iter) {
    const base = await crypto.subtle.importKey('raw', te.encode(secret), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromB64(saltB64), iterations: iter, hash: 'SHA-256' }, base, 256);
    return toB64(bits);
  }
  async function makeAccess(phrase, iter) {
    const n = normalise(phrase);
    if (n.length < MIN_LENGTH) throw new Error('short');
    const salt = toB64(crypto.getRandomValues(new Uint8Array(16)));
    return { v: 2, iter: iter || ITER, salt, hash: await derive(n, salt, iter || ITER) };
  }
  const validAccess = (a) => !!a && a.v === 2 && Number.isInteger(a.iter) && a.iter >= 100000 && a.iter <= 5000000 && typeof a.salt === 'string' && typeof a.hash === 'string';
  async function verify(access, phrase) {
    if (!validAccess(access)) return { ok: false, reason: access && access.v === 1 ? 'old' : 'file' };
    const n = normalise(phrase);
    if (n.length < MIN_LENGTH) return { ok: false, reason: 'short' };
    const hash = await derive(n, access.salt, access.iter);
    return hash === access.hash ? { ok: true, hash } : { ok: false, reason: 'wrong' };
  }

  root.AccessCore = { ITER, MIN_LENGTH, normalise, suggestPhrase, derive, makeAccess, validAccess, verify, toB64, fromB64 };
})(typeof window !== 'undefined' ? window : globalThis);
