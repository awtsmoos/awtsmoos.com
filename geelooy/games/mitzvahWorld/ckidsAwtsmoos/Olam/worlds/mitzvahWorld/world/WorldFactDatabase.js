// B"H
/** WorldFactDatabase: every event is a fact; old and new APIs both remain stable. */
const now=()=>Date.now();
export class WorldFactDatabase{
  constructor(options={}){const limit=typeof options==='number'?options:options.limit;this.limit=limit||5000;this.facts=[];this.byType=new Map();this.bySubject=new Map();this.byParticipant=new Map();}
  add(type,subject,detail={}){if(typeof type==='object'&&type){const f=type;return this.addFact(f.type||'event',f.subject||f.location||'world',{...f,participants:f.participants||f.actors||[]});}return this.addFact(type,subject,detail);}
  addFact(type='event',subject='world',detail={}){const fact={id:detail.id||`fact_${this.facts.length}_${now()}`,type,subject,detail,participants:detail.participants||detail.actors||[],at:detail.at||now()};this.facts.push(fact);this.#idx(this.byType,type,fact);this.#idx(this.bySubject,subject,fact);for(const p of fact.participants)this.#idx(this.byParticipant,p,fact);if(this.facts.length>this.limit)this.facts.shift();return fact;}
  #idx(map,key,fact){const k=key||'world';if(!map.has(k))map.set(k,[]);map.get(k).push(fact);}
  query({type,subject,participant,since=0,limit=50}={}){let list=type?this.byType.get(type)||[]:subject?this.bySubject.get(subject)||[]:participant?this.byParticipant.get(participant)||[]:this.facts;return list.filter(f=>f.at>=since&&(!subject||f.subject===subject)&&(!type||f.type===type)).slice(-limit);}
  rememberEvent(event){return this.add(event.type||'event',event.subject||event.place||event.location||'world',event);}
  snapshot(){return{count:this.facts.length,facts:this.facts.length,types:[...this.byType.keys()],participants:this.byParticipant.size,recent:this.facts.slice(-12)};}
}
export function createWorldFactDatabase(options){return new WorldFactDatabase(options);}
export default WorldFactDatabase;