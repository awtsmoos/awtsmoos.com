// B"H
/** ReputationSystem: kindness, learning, honesty, bravery, helpfulness; no lazy single score. */
const axes=['kindness','learning','honesty','bravery','helpfulness','respect','craft','community'];
export class ReputationSystem{
  constructor(){this.people=new Map();this.history=[];}
  ensure(id){if(!this.people.has(id))this.people.set(id,Object.fromEntries(axes.map(a=>[a,0])));return this.people.get(id);}
  adjust(id,axis,delta,reason=''){if(!axes.includes(axis))axis='community';const r=this.ensure(id);r[axis]=Math.max(-100,Math.min(100,r[axis]+delta));this.history.push({id,axis,delta,reason,at:Date.now()});this.history=this.history.slice(-300);return r;}
  add(id,axis,amount=1,reason='world'){return this.adjust(id,axis,amount,reason);}
  applyRumor(rumor){const weight=(rumor.confidence||rumor.strength||.5)*(rumor.good===false?-1:1);return this.adjust(rumor.subject||rumor.source,'honesty',weight*4,rumor.text);}
  applyFact(fact){const map={player_saved_goat:['kindness',2],bridge_repaired:['helpfulness',2],teacher_arrived:['learning',1],lava_trial_completed:['bravery',2]};const [axis,amount]=map[fact.type]||['community',.2];for(const p of fact.participants||[])this.adjust(p,axis,amount,fact.type);}
  profile(id){return{id,values:{...this.ensure(id)},recent:this.history.filter(h=>h.id===id).slice(-8)};}
  summary(id){return id?this.profile(id):{actors:this.people.size,recent:this.history.slice(-8)};}
}
export {axes as reputationAxes};
export default ReputationSystem;