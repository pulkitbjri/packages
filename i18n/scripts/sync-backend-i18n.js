#!/usr/bin/env node
/** Sync api/push/sms JSON → backend MessageSource .properties */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const localesRoot = path.join(root, 'packages/i18n/src/locales');
const outRoot = path.join(root, 'MarryMantraBackend/src/main/resources/i18n');
fs.mkdirSync(outRoot, { recursive: true });

function flatten(obj, prefix = '') {
  const rows = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) rows.push(...flatten(v, key));
    else rows.push([key, String(v)]);
  }
  return rows;
}

function writeProps(lang, ns, data) {
  const lines = flatten(data).map(
    ([k, v]) => `${k}=${v.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')}`,
  );
  const base = ns === 'api' ? 'messages' : ns;
  const file = lang === 'en' ? `${base}.properties` : `${base}_${lang}.properties`;
  fs.writeFileSync(path.join(outRoot, file), lines.join('\n') + '\n');
}

for (const lang of ['en', 'hi']) {
  for (const ns of ['api', 'push', 'sms']) {
    const src = path.join(localesRoot, lang, `${ns}.json`);
    writeProps(lang, ns, JSON.parse(fs.readFileSync(src, 'utf8')));
  }
}
console.log('Synced i18n →', outRoot);
