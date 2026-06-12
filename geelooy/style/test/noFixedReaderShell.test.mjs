// B"H
import fs from 'node:fs';
import path from 'node:path';
const roots = ['geelooy/heichelos/post/styles/reader-foundation','geelooy/heichelos/post/styles/reader-content','geelooy/heichelos/post/styles/reader-controls','geelooy/heichelos/post/styles/reader-settings','geelooy/heichelos/post/styles/reader-sidebar'];
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => d.isDirectory() ? files(path.join(dir,d.name)) : [path.join(dir,d.name)]); }
const bad = roots.flatMap(files).filter(f => f.endsWith('.css')).filter(f => /position\s*:\s*fixed[\s\S]{0,160}height\s*:\s*100vh|height\s*:\s*100vh[\s\S]{0,160}position\s*:\s*fixed/.test(fs.readFileSync(f,'utf8')));
if (bad.length) throw new Error('fixed reader shell combo found '+bad.join(','));
console.log('B"H noFixedReaderShell.test passed');
