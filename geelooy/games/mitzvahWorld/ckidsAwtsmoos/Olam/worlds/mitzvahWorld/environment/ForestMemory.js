// B"H
/**
 * ForestMemory: forests become ancient through memory, not polygons.
 * renderHint(id) is the cheap visual bridge for dense forest illusion.
 */
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,Number(v)||0));
export class ForestMemory{
  constructor(){this.groves=new Map();this.history=[];}
  ensure(id){if(!this.groves.has(id))this.groves.set(id,{id,age:1,density:.6,disease:0,stormDamage:0,grazing:0,rainfall:.5,logging:0,regrowth:.4});return this.groves.get(id);}
  event(id,type,amount=.1){const g=this.ensure(id);if(type==='rain')g.rainfall+=amount;if(type==='storm')g.stormDamage+=amount;if(type==='grazing')g.grazing+=amount;if(type==='logging')g.logging+=amount;if(type==='disease')g.disease+=amount;g.density=clamp(g.density+g.rainfall*.01+g.regrowth*.01-g.grazing*.02-g.logging*.04-g.disease*.03,.05,1.2);this.history.unshift({id,type,amount,at:Date.now()});this.history=this.history.slice(0,80);return g;}
  season(id='default',weather={}){if(typeof id==='object'){weather=id;id='default';}const ids=id==='all'?[...this.groves.keys()]:[id];for(const gid of ids){const g=this.ensure(gid);if(weather.rain)this.event(gid,'rain',weather.rain*.1);if(weather.storm)this.event(gid,'storm',weather.storm*.1);if(weather.grazing)this.event(gid,'grazing',weather.grazing*.1);g.age+=.25;g.regrowth=clamp(g.regrowth+g.rainfall*.03-g.disease*.02);g.stormDamage*=.92;g.grazing*=.9;}return this.snapshot();}
  visual(id){const g=this.ensure(id);return{canopyScale:1+Math.min(.35,g.age*.01),deadwood:g.disease+g.stormDamage,saplings:g.regrowth,colorStress:g.disease+g.grazing,density:g.density};}
  renderHint(id){const v=this.visual(id);return{density:v.density,silhouette:clamp(v.density*1.08+v.saplings*.08,0,1.5),deadwood:v.deadwood,saplings:v.saplings,colorStress:v.colorStress,canopyScale:v.canopyScale};}
  snapshot(){return{groves:this.groves.size,history:this.history.slice(0,12)};}
}
export default ForestMemory;
