// B"H
/** WorldEventHistory: storms, births, deaths, repairs, migrations; time carved into cheap arrays. */
export class WorldEventHistory{
  constructor(options={}){const limit=typeof options==='number'?options:options.limit;this.limit=limit||3000;this.events=[];this.counters=new Map();}
  record(type,payload={}){const e={id:payload.id||`evt_${this.events.length}_${Date.now()}`,type,at:payload.at||Date.now(),...payload};this.events.push(e);this.counters.set(type,(this.counters.get(type)||0)+1);if(this.events.length>this.limit)this.events.shift();return e;}
  storm(place,severity=.5){return this.record('storm',{place,severity});}
  repair(target,by){return this.record('repair',{target,by});}
  birth(family,child){return this.record('birth',{family,child});}
  death(subject,cause){return this.record('death',{subject,cause});}
  migration(group,from,to){return this.record('migration',{group,from,to});}
  recent(type,limit=20){return this.events.filter(e=>!type||e.type===type).slice(-limit);}
  timeline({type,place,limit=40}={}){return this.events.filter(e=>(!type||e.type===type)&&(!place||e.place===place||e.from===place||e.to===place)).slice(-limit);}
  summary(){return{events:this.events.length,counters:Object.fromEntries(this.counters),recent:this.events.slice(-10)};}
}
export function createWorldEventHistory(options){return new WorldEventHistory(options);}
export default WorldEventHistory;