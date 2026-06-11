import { createFighter } from '../fighters/createFighter.js';
import { createMapWeapons } from '../weapons/weaponFactory.js';
/** B"H — creates the whole battle-state, a palace of mutable moments. */
export function createGameState(map,botCount=5){ const fighters=[createFighter('adam-player',map.spawns[0].x,map.spawns[0].y,true)]; for(let i=0;i<botCount;i++){ const p=map.spawns[(i+1)%map.spawns.length]; fighters.push(createFighter(`ai-${map.id}-${i}`,p.x+i*34,p.y,false)); } return {map,fighters,weapons:createMapWeapons(map),particles:[],events:[],frame:0,winner:'',camera:{x:0,y:0,zoom:1},debug:false}; }
