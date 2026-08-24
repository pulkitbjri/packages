/** ponytail: assert-based self-check for normalizeLocale — run: node src/normalizeLocale.selfcheck.js */
const assert = require('assert');

function normalizeLocale(value) {
  if (!value) return 'en';
  const base = String(value).toLowerCase().split('-')[0];
  return base === 'hi' ? 'hi' : 'en';
}

assert.strictEqual(normalizeLocale(null), 'en');
assert.strictEqual(normalizeLocale(undefined), 'en');
assert.strictEqual(normalizeLocale('en'), 'en');
assert.strictEqual(normalizeLocale('hi'), 'hi');
assert.strictEqual(normalizeLocale('hi-IN'), 'hi');
assert.strictEqual(normalizeLocale('en-IN'), 'en');
assert.strictEqual(normalizeLocale('fr'), 'en');
console.log('normalizeLocale.selfcheck OK');
