// B"H
/** StatisticalFarWorld: distant villages live without spawning bodies. */
export class StatisticalFarWorld{
  constructor(){this.villages=new Map();}
  ensure(id){if(!this.villages.has(id))this.villages.set(id,{learning:1,trading:1,repairs:1,growth:1,stories:[]});return this.villages.get(id);}
  tick(id,dt=1){const v=this.ensure(id);v.learning+=.01*dt;v.trading+=.008*dt;v.repairs+=.006*dt;v.growth+=.003*dt;if(v.stories.length<8)v.stories.push({text:'far life continued',at:Date.now()});return v;}
  snapshot(){return Object.fromEntries(this.villages);}
}
export default StatisticalFarWorld;
