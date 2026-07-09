// B"H
/** Direct constructors with active tested Chossid runtime gate. */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js?compact=true&v=actual-tested-live-gates-20260709-bh5';
import Utils from '../../../utils.js?compact=true&v=tree-visible-perf-jump-20260708-bh1';
import ChossidDirect from '../../../chayim/chossid/index.js?compact=true&v=up-down-jump-ground-20260709-bh4';
import SolidBlockDirect from '../../../dvarim/architecture/SolidBlock.js?compact=true&v=tree-visible-perf-jump-20260708-bh1';
import MovingPlatformDirect from '../../../dvarim/hazards/MovingPlatform.js?compact=true&v=tree-visible-perf-jump-20260708-bh1';
import SpikeFieldDirect from '../../../dvarim/hazards/SpikeField.js?compact=true&v=tree-visible-perf-jump-20260708-bh1';
import FallResetTriggerDirect from '../../../dvarim/hazards/FallResetTrigger.js?compact=true&v=tree-visible-perf-jump-20260708-bh1';
import InteractiveDoorDirect from '../../../dvarim/SimpleDoor.js?compact=true&v=tree-visible-perf-jump-20260708-bh1';
import InteractiveNpcDirect from '../../../dvarim/npc/InteractiveNpc.js?compact=true&v=tree-visible-perf-jump-20260708-bh1';
import NpcChossidDirect from '../../../dvarim/npc/NpcChossidDirect.js?compact=true&v=tree-visible-perf-jump-20260708-bh1';
const DIRECT_TYPES={Chossid:ChossidDirect,SolidBlock:SolidBlockDirect,MovingPlatform:MovingPlatformDirect,SpikeField:SpikeFieldDirect,FallResetTrigger:FallResetTriggerDirect,InteractiveDoor:InteractiveDoorDirect,InteractiveNpc:InteractiveNpcDirect,npcChossid:NpcChossidDirect,NpcChossid:NpcChossidDirect};
const PROOF_TYPES=new Set(['VillagePictureProp','npcChossid','NpcChossid','Chossid']);
function resolveSoulType(type){return DIRECT_TYPES[type]||AWTSMOOS[type]||null;}
function debug(){return globalThis.__AWTS_DEBUG_INSTANTIATE__===true;}
function proof(stage,data={}){if(!PROOF_TYPES.has(data.type)&&!PROOF_TYPES.has(data.nivraType))return;const payload={stage,gate:"actual-tested-live-gates-20260709-bh5",...data};globalThis.__VILLAGE_INSTANTIATE_LAST_PROOF__=payload;if(debug())console.info('B"H | VILLAGE_INSTANTIATE_PROOF',payload);}
function missing(type,options){console.warn('B"H | INSTANTIATE_MISSING_TYPE',{type,name:options?.name||options?.id,directKnown:Object.keys(DIRECT_TYPES),awtsmoosHas:Boolean(AWTSMOOS[type]),availableSample:Object.keys(AWTSMOOS).slice(0,40)});}
function makeNivra(context,type,options){const SoulType=resolveSoulType(type);if(!SoulType){missing(type,options);return null;}proof('constructor-selected',{type,constructor:SoulType.name,name:options?.name||options?.id,kind:options?.kind,position:options?.position});try{return new SoulType(options,context);}catch(error){console.error('B"H | INSTANTIATE_CONSTRUCTOR_FAILED',{type,name:options?.name||options?.id,message:error?.message||String(error),stack:String(error?.stack||'').slice(0,800)});return null;}}
const instantiateMezuzahDirect={async addObject(type,options){const nivra=makeNivra(this,type,options);if(!nivra)return null;if(!this.nivrayim.includes(nivra))this.nivrayim.push(nivra);if(nivra.heescheel)await nivra.heescheel(this);proof('addObject-heescheel-finished',{type,name:nivra.name,hasMesh:Boolean(nivra.mesh),meshName:nivra.mesh?.name,parent:nivra.mesh?.parent?.name});if(nivra.ready)await nivra.ready();if(nivra.afterBriyah)await nivra.afterBriyah();return nivra;},parseDefinitions(nivrayim){const list=[];if(!nivrayim)return list;for(const[type,configs]of Object.entries(nivrayim)){const configArray=Array.isArray(configs)?configs:typeof configs==='object'&&configs!==null?Object.values(configs):[];if(debug())console.info('B"H | LOAD_DEFINITION_TYPE_PROOF',{type,count:configArray.length});configArray.forEach(opt=>{const evaled=Utils.evalStringifiedFunctions(opt),made=makeNivra(this,type,evaled);if(!made)return;proof('definition-created',{type,constructor:made.constructor?.name,name:evaled?.name||evaled?.id,kind:evaled?.kind,position:evaled?.position});list.push(made);});}if(debug())console.info('B"H | LOAD_DEFINITION_TOTAL_PROOF',{count:list.length});return list;}};
export default instantiateMezuzahDirect;
