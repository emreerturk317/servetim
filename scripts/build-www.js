const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW  = path.join(ROOT, 'www');

const COPY = ['index.html', 'manifest.json', 'sw.js'];
const DIRS = ['css', 'js', 'icons'];

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : copyFile(s, d);
  }
}

// Temizle ve yeniden oluştur
if (fs.existsSync(WWW)) fs.rmSync(WWW, { recursive: true });
fs.mkdirSync(WWW);

COPY.forEach(f => copyFile(path.join(ROOT, f), path.join(WWW, f)));
DIRS.forEach(d => copyDir(path.join(ROOT, d), path.join(WWW, d)));

console.log('www/ klasörü oluşturuldu.');
