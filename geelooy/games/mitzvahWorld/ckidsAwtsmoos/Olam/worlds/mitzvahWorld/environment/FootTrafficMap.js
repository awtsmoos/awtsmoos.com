// B"H
/**
 * FootTrafficMap: feet, hooves, wheels, and rain write roads into the earth.
 * Compatibility law: add(entity,x,z) and step(x,z) both remain alive.
 */
const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
const cellKey=(x,z,cell=4)=>`${Math.round(Number(x||0)/cell)}:${Math.round(Number(z||0)/cell)}`;
export class FootTrafficMap{
  constructor(cellSize=4){this.cellSize=cellSize;this.cells=new Map();this.actors=new Map();}
  ensure(k){if(!this.cells.has(k))this.cells.set(k,{id:k,traffic:0,mud:0,grass:1,road:0,last:0,actors:new Set()});return this.cells.get(k);}
  step(x,z,weight=1,wetness=0,actor=null){const id=cellKey(x,z,this.cellSize),c=this.ensure(id);c.traffic+=weight;c.mud=clamp(c.mud+wetness*.03+weight*.004);c.grass=clamp(c.grass-weight*.0025);c.road=clamp(c.traffic/220);c.last=Date.now();if(actor)c.actors.add(actor);return{id,...c,actors:[...c.actors]};}
  add(entity,x,z,weight=1,wetness=0){const actor=typeof entity==='string'?entity:entity?.id||entity?.name||'unknown';const row=this.step(x,z,weight,wetness,actor);this.actors.set(actor,{id:actor,x,z,cell:row.id,at:Date.now()});return row;}
  trailAlong(points=[],weight=1,wetness=0,actor=null){return points.map(p=>this.step(p.x??p[0],p.z??p[1],weight,wetness,actor));}
  sample(x,z){const c=this.ensure(cellKey(x,z,this.cellSize));return{...c,actors:[...c.actors]};}
  strongest(limit=80){return[...this.cells.entries()].sort((a,b)=>b[1].traffic-a[1].traffic).slice(0,limit).map(([id,c])=>({id,...c,actors:[...c.actors]}));}
  snapshot(limit=80){return{cells:this.cells.size,actors:this.actors.size,strongest:this.strongest(limit)};}
}
export default FootTrafficMap;
