// B"H
/** RelationshipGraph: NPCs behold each other, not only the player. */
const kinds=['friend','rival','family','teacher','student','neighbor','leader','trader'];
export class RelationshipGraph{
  constructor(){this.edges=new Map();}
  key(a,b){return [a,b].sort().join('::');}
  relate(a,b,kind='neighbor',strength=.2,detail={}){if(!kinds.includes(kind))kind='neighbor';const k=this.key(a,b);const old=this.edges.get(k)||{a,b,kinds:{},history:[],weight:0};old.kinds[kind]=Math.max(-1,Math.min(1,(old.kinds[kind]||0)+strength));old.weight+=strength;old.history.push({kind,strength,detail,at:Date.now()});old.history=old.history.slice(-20);this.edges.set(k,old);return old;}
  get(a,b){return this.edges.get(this.key(a,b))||null;}
  between(a,b){return this.get(a,b);}
  of(id){return[...this.edges.values()].filter(e=>e.a===id||e.b===id);}
  neighbors(id){return this.of(id).map(e=>({id:e.a===id?e.b:e.a,...e}));}
  influence(a,b){const e=this.get(a,b);if(!e)return 0;return Object.values(e.kinds).reduce((s,v)=>s+v,0);}
  snapshot(){return{edges:this.edges.size,people:new Set([...this.edges.values()].flatMap(e=>[e.a,e.b])).size,sample:[...this.edges.values()].slice(0,20)};}
}
export default RelationshipGraph;