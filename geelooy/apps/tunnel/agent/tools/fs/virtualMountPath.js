// B"H
// Boruch Hashem
// Blessed is He
// Resolve the explicitly mounted fake-SSH namespace before handing a path to
// native Node or filesystem diagnostics. Never interpret /workspace as a host
// filesystem root; never remap arbitrary absolute host paths silently.
const Shell=require('../../lib/fakeSsh/shell.js');
const {safePath}=require('./pathGuard.js');
const PREFIXES=['/workspace','/tunnels/local','/previews','/receipts'];
function isVirtual(p){const value=String(p||'');return PREFIXES.some(x=>value===x||value.startsWith(x+'/'));}
function resolve(config,p,cwd='/'){
 if(!isVirtual(p))return {virtual:false,absolutePath:safePath(config,p)};
 const r=Shell.resolve(config,cwd,p);
 if(r.error||!r.real)throw Object.assign(new Error(`virtual_mount_resolution_failed:${r.error||'unknown'}`),{code:r.error||'virtual_mount_resolution_failed',virtualPath:p});
 // safePath rechecks that symbolic links cannot escape the installation root.
 return {virtual:true,virtualPath:r.virtual,mount:r.mount,absolutePath:safePath(config,r.relative)};
}
module.exports={isVirtual,resolve};
