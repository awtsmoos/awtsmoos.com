//B"H
/**
 * @module InspectTanachJsonShape
 * @description
 * Safely inspect the 60MB Tanach.json without dumping it into chat.
 */
import fs from 'node:fs';
import path from 'node:path';

const TANACH_PATH = 'C:/Users/Yackov Yitzchak/Documents/WoW/BH/torah/Tanach.json';

function short(value, max = 500) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function keys(value) {
  return value && typeof value === 'object' ? Object.keys(value).slice(0, 40) : [];
}

function findBookEntries(root) {
  const hits = [];
  const seen = new Set();
  function walk(node, trail, depth) {
    if (!node || depth > 5 || hits.length >= 40) return;
    if (typeof node !== 'object') return;
    const label = [node.name, node.title, node.book, node.hebrew, node.english, node.id].filter(Boolean).join(' ');
    const pathText = trail.join('/');
    if (/genesis|bereish|בראשית|psalms|tehill|תהילים|תהלים/i.test(`${label} ${pathText}`)) {
      const sig = pathText + label;
      if (!seen.has(sig)) {
        seen.add(sig);
        hits.push({ trail, keys: keys(node), sample: short(node, 900) });
      }
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < Math.min(node.length, 8); i++) walk(node[i], [...trail, `[${i}]`], depth + 1);
    } else {
      for (const key of Object.keys(node).slice(0, 40)) walk(node[key], [...trail, key], depth + 1);
    }
  }
  walk(root, [], 0);
  return hits;
}

function findVerseLike(root) {
  const hits = [];
  function walk(node, trail, depth) {
    if (!node || depth > 7 || hits.length >= 30) return;
    if (typeof node !== 'object') return;
    const k = keys(node);
    const joined = k.join(' ');
    const text = short(node, 900);
    if (/verse|chapter|hebrew|english|text|translation|פסוק|פרק/i.test(joined) && /[\u0590-\u05FF]/.test(text)) {
      hits.push({ trail, keys: k, sample: text });
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < Math.min(node.length, 5); i++) walk(node[i], [...trail, `[${i}]`], depth + 1);
    } else {
      for (const key of Object.keys(node).slice(0, 25)) walk(node[key], [...trail, key], depth + 1);
    }
  }
  walk(root, [], 0);
  return hits;
}

const stat = fs.statSync(TANACH_PATH);
const fd = fs.openSync(TANACH_PATH, 'r');
const buffer = Buffer.alloc(16 * 1024);
const bytes = fs.readSync(fd, buffer, 0, buffer.length, 0);
fs.closeSync(fd);
console.log('B"H Tanach.json stat', { path: TANACH_PATH, bytes: stat.size, mb: Math.round(stat.size / 1024 / 1024) });
console.log('B"H first16k preview');
console.log(buffer.toString('utf8', 0, bytes).slice(0, 4000));

const root = JSON.parse(fs.readFileSync(TANACH_PATH, 'utf8'));
console.log('B"H top-level', { type: Array.isArray(root) ? 'array' : typeof root, keys: keys(root), length: Array.isArray(root) ? root.length : undefined });
console.log('B"H book hits');
console.log(JSON.stringify(findBookEntries(root), null, 2).slice(0, 12000));
console.log('B"H verse-like hits');
console.log(JSON.stringify(findVerseLike(root), null, 2).slice(0, 16000));
