// B"H
import { ensureEmeraldInfinityPostBuild } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/EmeraldInfinityPostBuild.js';
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const scene={userData:{}};
const olam={scene};
const result=ensureEmeraldInfinityPostBuild({scene,olam,source:'audit'});
assert(result.stats.drawCallsAdded===0,'emerald postbuild added draw calls');
assert(result.stats.materialsAdded===0,'emerald postbuild added materials');
assert(result.stats.listenersAdded===0,'emerald postbuild added listeners');
assert(result.stats.raycastsAdded===0,'emerald postbuild added raycasts');
assert(scene.userData.emeraldInfinityConsequence,'scene consequence missing');
assert(olam.emeraldInfinityConsequence.villages.memory.shortages.includes('food'),'village shortage did not surface');
assert(result.consequence.discovery?.text,'discovery did not surface');
assert(result.consequence.visualHints.forest.density>0,'forest hint missing');
console.log(JSON.stringify({ok:true,stats:result.stats,discovery:result.consequence.discovery,shortages:result.consequence.villages.memory.shortages,forest:result.consequence.visualHints.forest},null,2));
