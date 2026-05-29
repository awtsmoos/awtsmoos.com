// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js';
let text = fs.readFileSync(file, 'utf8');
const oldText = `            const got = await fetchText(job.href, pageUrl);
            files[job.key] = got;`;
const newText = `            const got = files[job.key] ?? files['/' + job.key.replace(/^\\//, '')] ?? files['./' + job.key.replace(/^\\//, '')] ?? await fetchText(job.href, pageUrl);
            files[job.key] = got;`;
if (!text.includes(oldText)) throw new Error('dynamic seed fetch insertion target not found');
text = text.replace(oldText, newText);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, usesSeed: text.includes("files['./' + job.key") }, null, 2));
