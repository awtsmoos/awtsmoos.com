// B"H
import fs from 'node:fs';
import { execSync } from 'node:child_process';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const adapter = fs.readFileSync('ckidsAwtsmoos/Olam/rendering/ThreeAdapter.js','utf8');
const direct = String(execSync("grep -R --exclude-dir=node_modules --exclude-dir=AI_THOUGHTS -nE \"from ['\\\"]/games/scripts/build/three\\.module\\.js|from ['\\\"]three['\\\"]|import \\* as THREE\" . | wc -l", {encoding:'utf8'})).trim();
assert(adapter.includes('export const WebGLRenderer') && adapter.includes('export { THREE }'), 'ThreeAdapter must expose constructors and namespace');
const report = { ok:true, directThreeLines:Number(direct), adapter:true };
fs.mkdirSync('AI_THOUGHTS/hardening_reports',{recursive:true});
fs.writeFileSync('AI_THOUGHTS/hardening_reports/latest_render_architecture.json', JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
