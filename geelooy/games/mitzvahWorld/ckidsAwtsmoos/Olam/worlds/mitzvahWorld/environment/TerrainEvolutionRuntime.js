// B"H
/** TerrainEvolutionRuntime: WetnessMap, ErosionMap, SedimentMap, FlowMap, VegetationMap, FootpathMap. */
const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
const empty=()=>({wetness:0,erosion:0,sediment:0,flow:0,vegetation:1,footpath:0,wear:0});
export class TerrainEvolutionRuntime{
  constructor(){this.cells=new Map();this.events=[];this.maps=['wetness','erosion','sediment','flow','vegetation','footpath'];}
  ensure(id){if(!this.cells.has(id))this.cells.set(id,empty());return this.cells.get(id);}
  mark(id,patch,reason='terrain_memory'){const c=this.ensure(id);for(const [k,v] of Object.entries(patch))c[k]=k==='wear'?Math.max(0,v):clamp(v);this.events.unshift({id,patch,reason,at:Date.now()});this.events.length=Math.min(this.events.length,160);return c;}
  stepOn(id,weight=1){const c=this.ensure(id);return this.mark(id,{wear:c.wear+weight,footpath:c.footpath+weight*.012,vegetation:c.vegetation-weight*.006},'footfall');}
  rain(amount=.2){for(const [id,c] of this.cells)this.mark(id,{wetness:c.wetness+amount,flow:c.flow+amount*.25,vegetation:c.vegetation+amount*.05},'rain');return this.snapshot();}
  dry(amount=.05){for(const [id,c] of this.cells)this.mark(id,{wetness:c.wetness-amount,flow:c.flow-amount*.1},'dry');return this.snapshot();}
  erode(id,flow=.1){const c=this.ensure(id);return this.mark(id,{erosion:c.erosion+flow*.03,sediment:c.sediment+flow*.02,vegetation:c.vegetation-flow*.01},'erosion');}
  visualField(name,limit=120){return[...this.cells.entries()].map(([id,c])=>[id,c[name]||0]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,limit);}
  snapshot(){return{cells:this.cells.size,events:this.events.slice(0,12),maps:Object.fromEntries(this.maps.map(m=>[m,this.visualField(m,24)]))};}
}
export default TerrainEvolutionRuntime;
