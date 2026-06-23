// B"H
import { readFileSync } from 'node:fs';
const policy=readFileSync('systems/visuals/HyperrealTexturePolicy.js','utf8');
const enforcer=readFileSync('systems/visuals/TextureQualityEnforcer.js','utf8');
const seamless=readFileSync('systems/visuals/SeamlessTextureTuning.js','utf8');
const required=['MirroredRepeatWrapping','LinearMipmapLinearFilter','anisotropy','applyTexturePolicy','classifyTextureTarget'];
const missing=required.filter(x=>!policy.includes(x));
if(missing.length) throw new Error(`Missing texture policy terms: ${missing.join(', ')}`);
if(!enforcer.includes('HyperrealTexturePolicy')||!seamless.includes('HyperrealTexturePolicy')) throw new Error('Texture passes are not wired to HyperrealTexturePolicy');
console.log('B"H hyperrealTexturePolicyAudit passed');
