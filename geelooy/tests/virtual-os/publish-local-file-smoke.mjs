// B"H
import { readFileSync } from 'fs';
const src = readFileSync(new URL('../../os/session/localFileAccess.js', import.meta.url), 'utf8');
assert(src.includes('/api/social/aliases/${encodeURIComponent(alias)}/fileSystem/makeFile'), 'publish must use authenticated makeFile endpoint');
assert(src.includes("credentials:'include'"), 'publish must include credentials');
assert(src.includes("form.append('binaryData'"), 'binary uploads must send binaryData');
assert(src.includes("new URLSearchParams({ path, content:String(content ?? '') })"), 'text uploads must send path/content');
assert(src.includes('metadataFor'), 'publish must preserve metadata');
assert(src.includes("publicFileUrl({ alias, path:'', fileName:remotePath })"), 'publish must create permanent read URL');
assert(src.includes('refresh ? await refresh()'), 'publish must refresh explorer when callback exists');
console.log('B"H publish-local-file-smoke passed');
function assert(condition, message) { if (!condition) throw new Error(message); }
