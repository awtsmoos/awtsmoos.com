// B"H
import { treeRendererFor, treeAuthorityReport } from '../../systems/vegetation/TreeAuthority.js';
if(treeRendererFor({distance:20})!=='procedural-core-hero-tree') throw new Error('Near tree should be hero tree');
if(!treeAuthorityReport().authoritativeForest.includes('RegionTreeRenderer')) throw new Error('Tree authority missing region forest');
console.log('B"H treeAuthorityAudit passed');
