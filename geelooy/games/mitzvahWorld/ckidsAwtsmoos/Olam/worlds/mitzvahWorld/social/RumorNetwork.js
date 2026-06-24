// B"H
/** RumorNetwork: speech walks village lanes while geometry sleeps. */
export class RumorNetwork{
  constructor({mutation=.12}={}){this.mutation=mutation;this.rumors=[];}
  seed(subject,text,source='world',tags=[]){const r={id:`rumor_${this.rumors.length}_${Date.now()}`,subject,text,source,tags,confidence:.9,strength:.9,heardBy:new Set([source]),path:[source],good:!tags.includes('crime'),at:Date.now()};this.rumors.push(r);return r;}
  create(text,source='world',data={}){return this.seed(data.subject||source,text,source,data.tags||[]);}
  fromFact(fact){return this.seed(fact.subject||fact.location||'world',`${fact.type} happened`,fact.participants?.[0]||'world',[fact.type]);}
  propagate(people=[],relationshipGraph){const made=[];for(const r of this.rumors.slice(-80)){for(const p of people){if(r.heardBy.has(p))continue;const known=[...r.heardBy].some(h=>(relationshipGraph?.influence(h,p)||0)>.1);if(known||Math.random()<.03){r.heardBy.add(p);r.path.push(p);r.confidence*=1-this.mutation*.2;r.strength=r.confidence;made.push({rumor:r.id,to:p});}}}return made;}
  spread(rumor,listener){rumor.heardBy?.add?.(listener);rumor.path?.push?.(listener);return rumor;}
  hear(listener,limit=10){return this.rumors.filter(r=>!r.heardBy.has(listener)).slice(0,limit);}
  publicView(){return this.rumors.map(r=>({...r,heardBy:[...r.heardBy]}));}
  summary(){return{rumors:this.rumors.length,strongest:this.publicView().slice(-5)};}
}
export default RumorNetwork;