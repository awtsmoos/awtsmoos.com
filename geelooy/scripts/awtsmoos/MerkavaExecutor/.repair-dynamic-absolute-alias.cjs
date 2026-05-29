// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-runtime/RuntimeAssembler.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
`    async function fetchText(href) {
        const response = await fetch(href, { headers: { accept: 'text/javascript,*/*' } });
        if (!response.ok) throw new Error(\`Dynamic module fetch failed: \${href} (\${response.status})\`);
        return await response.text();
    }`,
`    async function fetchText(href, pageUrl = null) {
        const candidates = [href];
        try {
            const url = new URL(href);
            if (pageUrl && url.pathname.startsWith('/') && !url.pathname.startsWith(pageUrl.pathname.replace(/\\/[^/]*$/, '/'))) {
                candidates.push(new URL(url.pathname.replace(/^\\//, ''), pageUrl.href).href);
            }
        } catch (_) {}
        let lastStatus = 0;
        for (const candidate of [...new Set(candidates)]) {
            const response = await fetch(candidate, { headers: { accept: 'text/javascript,*/*' } }).catch(() => null);
            if (response?.ok) return await response.text();
            lastStatus = response?.status || 0;
        }
        throw new Error(\`Dynamic module fetch failed: \${href} (\${lastStatus})\`);
    }`
);
text = text.replace('const got = await fetchText(job.href);', 'const got = await fetchText(job.href, pageUrl);');
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasPageFallback: text.includes('candidates.push(new URL') }, null, 2));
