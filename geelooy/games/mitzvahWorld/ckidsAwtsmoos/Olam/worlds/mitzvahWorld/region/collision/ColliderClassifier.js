// B"H
/** @file ColliderClassifier.js @description Classify visuals vs hard blockers. */
export function classifyRegionColliders({houses=[],roads={},instances={}}={}){const hard=[...houses.map(h=>({type:'house',id:h.id,x:h.x,z:h.z,w:8,d:6,h:4}))];const soft=[{type:'tree-trunks',count:instances.trees?.count||0},{type:'large-rocks',count:Math.floor((instances.rocks?.count||0)*.08)}];const visual=['grass','flowers','moss','smallRocks','cloth','vegetables'];return {hard,soft,visual,policy:'ground-first-merge-hard-only'};}
