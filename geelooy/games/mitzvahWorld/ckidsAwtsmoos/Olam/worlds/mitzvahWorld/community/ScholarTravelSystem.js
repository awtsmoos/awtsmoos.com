// B"H
/** ScholarTravelSystem: missions teaching travel stories; sacred schedules as cheap social state. */
export class ScholarTravelSystem{
  constructor(){this.state=new Map();this.events=[];}
  ensure(id){if(!this.state.has(id))this.state.set(id,{schedule:[],knowledge:0,guests:0,preparedness:0});return this.state.get(id);}
  add(id,action,weight=1){const s=this.ensure(id);s.schedule.push({action,weight,at:Date.now()});s.preparedness+=weight;this.events.push({id,action,weight,at:Date.now()});return s;}
  tick(id,dt=1){const s=this.ensure(id);s.knowledge+=s.schedule.filter(x=>/learn|teach|shiur/.test(x.action)).length*.01*dt;s.schedule=s.schedule.slice(-24);return s;}
  snapshot(id){return{id,state:this.ensure(id),recent:this.events.filter(e=>e.id===id).slice(-8)};}
}
export default ScholarTravelSystem;
