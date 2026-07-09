// B"H
/**
 * Future writer scaffold for reviewed Meluket translation comments.
 * Refuses by default. This is intentionally not run by setup.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const input = process.argv.find(a => a.startsWith('--input='))?.split('=')[1];
const allow = process.argv.includes('--allow-write-reviewed-output');
if (!input) { console.error('Provide --input=/path/to/parsed-comments.review.json'); process.exit(2); }
if (!allow) { console.error('Refusing to write. Re-run only after review with --allow-write-reviewed-output.'); process.exit(7); }
const file = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/socialPacked/social.heichel.ikar.comments.fs.awtsdb';
const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
const backup = `${file}.before-meluket-translation-${Date.now()}`;
fs.copyFileSync(file, backup);
const db = new AwtsmoosDB(file, { compression: false, reuseFreedSpace: 'verified' });
db.open();
try {
  for (const [key, obj] of Object.entries(payload.comments || {})) {
    const [seriesId, postId] = key.split('/');
    if (!seriesId || !postId) throw new Error(`Bad key ${key}`);
    db.fs.write(`/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}/meluket_translation_en.awtsmoosJSON`, awts.serializeJSON(obj));
  }
  db.fs.flush?.();
} finally { db.close(); }
console.log(JSON.stringify({ B_H: true, wrote: Object.keys(payload.comments || {}).length, backup }, null, 2));
