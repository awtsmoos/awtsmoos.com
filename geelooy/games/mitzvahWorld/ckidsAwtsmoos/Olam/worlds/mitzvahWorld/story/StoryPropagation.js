// B"H
/** StoryPropagation: consequences move through people, economy, terrain, and rumors. */
export class StoryPropagation{
  constructor(){this.active=[];}
  add(seed){this.active.push(seed);return seed;}
  tick({rumors,reputation,people=[]}={}){for(const s of this.active){s.stage++;if(rumors&&s.stage===1)rumors.seed(s.id,s.title,'story',[s.title.includes('Broken')?'repair':'discovery']);if(reputation&&people[0])reputation.adjust(people[0],'helpfulness',.25,s.title);}this.active=this.active.filter(s=>s.stage<12);return this.active;}
}
export default StoryPropagation;
