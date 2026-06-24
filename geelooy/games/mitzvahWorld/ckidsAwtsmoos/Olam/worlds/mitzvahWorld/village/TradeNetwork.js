// B"H
/** TradeNetwork: village consequence in sparse numbers; houses and hunger without render tax. */
export class TradeNetwork{
  constructor(){this.items=new Map();this.history=[];}
  ensure(id){if(!this.items.has(id))this.items.set(id,{food:20,water:20,wood:10,stone:8,tools:5,animals:6,prosperity:.5,security:.5,education:.3,repairs:0,houses:3,barns:1,fences:1,gardens:1,roads:0});return this.items.get(id);}
  change(id,patch,reason='TradeNetwork'){const v=this.ensure(id);for(const [k,n] of Object.entries(patch))v[k]=Math.max(0,(v[k]||0)+n);this.history.push({id,patch,reason,at:Date.now()});return v;}
  shortage(id){const v=this.ensure(id);return Object.entries(v).filter(([k,n])=>['food','water','wood','stone','tools'].includes(k)&&n<5).map(([k])=>k);}
  grow(id){const v=this.ensure(id);if(v.wood>8&&v.stone>6){this.change(id,{wood:-5,stone:-4,houses:1,prosperity:.04},'growth');}return v;}
  snapshot(id){return{id,state:this.ensure(id),shortages:this.shortage(id),recent:this.history.filter(h=>h.id===id).slice(-8)};}
}
export default TradeNetwork;
