// B"H
export function treeRendererFor({distance=0,count=1,hero=false}={}){if(hero||distance<70)return"procedural-core-hero-tree";if(count>1||distance<520)return"instanced-region-forest";return"horizon-imposter"}
export function treeAuthorityReport(){return{authoritativeForest:"RegionTreeRenderer.js",authoritativeHero:"ProceduralCoreTreeFactory.js",obsoleteCandidates:["builders/buildTree.js","utils/3d/procedural/nature/*"]}}
export default {treeRendererFor,treeAuthorityReport};
