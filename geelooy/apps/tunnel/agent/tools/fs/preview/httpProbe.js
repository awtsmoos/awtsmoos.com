// B"H
const http = require('http');
const https = require('https');
function request(url, timeoutMs = 700) {
  return new Promise(resolve => {
    const lib = String(url).startsWith('https:') ? https : http;
    const req = lib.request(url, { method:'GET', timeout:timeoutMs }, res => {
      const chunks = []; let total = 0;
      res.on('data', c => { if (total < 512) chunks.push(c); total += c.length; });
      res.on('end', () => resolve({ ok:true, statusCode:res.statusCode, headers:res.headers, title:title(Buffer.concat(chunks).toString('utf8')) }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ ok:false, error:'timeout' }); });
    req.on('error', e => resolve({ ok:false, error:e.code || e.message }));
    req.end();
  });
}
function title(html) { const m = String(html || '').match(/<title[^>]*>([^<]{1,120})<\/title>/i); return m ? m[1].trim() : ''; }
/** B"H — A tiny knock on localhost tells us if a server is breathing. */
module.exports = { request, title };
