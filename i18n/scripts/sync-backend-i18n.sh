#!/usr/bin/env bash
# Sync api/push/sms JSON catalogs into backend MessageSource property files.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
PKG="$ROOT/packages/i18n/src/locales"
OUT="$ROOT/MarryMantraBackend/src/main/resources/i18n"
mkdir -p "$OUT"

# ponytail: flat key=value from nested JSON via node; upgrade to jq pipeline if needed
node <<'NODE'
const fs = require('fs');
const path = require('path');
const pkg = path.join(process.env.PKG || '', '');
const root = path.resolve(__dirname ? path.join(__dirname, '../../..') : process.cwd());
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

for (const lang of ['en', 'hi']) {
  for (const ns of ['api', 'push', 'sms']) {
    const src = path.join(localesRoot, lang, `${ns}.json`);
    const data = JSON.parse(fs.readFileSync(src, 'utf8'));
    const lines = flatten(data).map(([k, v]) => `${k}=${v.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')}`);
    const basename = ns === 'api' ? `messages` : ns;
    const file = lang === 'en' ? `${basename}.properties` : `${basename}_${lang}.properties`;
    // Merge api into messages_*.properties; push/sms separate basenames
    const target = path.join(outRoot, ns === 'api' ? (lang === 'en' ? 'messages.properties' : `messages_${lang}.properties`) : (lang === 'en' ? `${ns}.properties` : `${ns}_${lang}.properties`));
    fs.writeFileSync(target, lines.join('\n') + '\n');
  }
}
console.log('Synced i18n catalogs to', outRoot);
NODE
