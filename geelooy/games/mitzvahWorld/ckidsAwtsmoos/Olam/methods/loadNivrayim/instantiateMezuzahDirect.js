// B"H
/** @file instantiateMezuzahDirect.js @description Direct constructors with loud proof for authored village objects. */
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js?compact=true&v=fps-door-target-idle-20260708-bh1';
import Utils from '../../../utils.js?compact=true&v=visibility-culling-npcChossid-20260708-bh1';
import ChossidDirect from '../../../chayim/chossid/index.js?compact=true&v=compact-engine-20260702-bh2';
import SolidBlockDirect from '../../../dvarim/architecture/SolidBlock.js?compact=true&v=direct-lava-platforms-20260609-bh620';
import MovingPlatformDirect from '../../../dvarim/hazards/MovingPlatform.js?compact=true&v=direct-lava-platforms-20260609-bh620';
import SpikeFieldDirect from '../../../dvarim/hazards/SpikeField.js?compact=true&v=lava-camera-axis-20260609-bh640';
import FallResetTriggerDirect from '../../../dvarim/hazards/FallResetTrigger.js?compact=true&v=lava-camera-axis-20260609-bh640';
import InteractiveDoorDirect from '../../../dvarim/SimpleDoor.js?compact=true&v=route-alias-targetpath-20260609-bh620';
import InteractiveNpcDirect from '../../../dvarim/npc/InteractiveNpc.js?compact=true&v=zone-reality-20260614-bh817';
import NpcChossidDirect from '../../../dvarim/npc/NpcChossidDirect.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const DIRECT_TYPES={Chossid:ChossidDirect,SolidBlock:SolidBlockDirect,MovingPlatform:MovingPlatformDirect,SpikeField:SpikeFieldDirect,FallResetTrigger:FallResetTriggerDirect,InteractiveDoor:InteractiveDoorDirect,InteractiveNpc:InteractiveNpcDirect,npcChossid:NpcChossidDirect,NpcChossid:NpcChossidDirect};
const PROOF_TYPES=new Set(['VillagePictureProp','npcChossid','NpcChossid']);
function resolveSoulType(type){return DIRECT_TYPES[type]||AWTSMOOS[type]||null;}
function proof(stage,data={}){if(PROOF_TYPES.has(data.type)||PROOF_TYPES.has(data.nivraType))console.info('B"H | VILLAGE_INSTANTIATE_PROOF',{stage,...data});}
function missing(type,options){console.warn('B"H | INSTANTIATE_MISSING_TYPE',{type,name:options?.name||options?.id,directKnown:Object.keys(DIRECT_TYPES),awtsmoosHas:Boolean(AWTSMOOS[type]),availableSample:Object.keys(AWTSMOOS).slice(0,40)});}
function makeNivra(context,type,options){const SoulType=resolveSoulType(type);if(!SoulType){missing(type,options);return null;}proof('constructor-selected',{type,constructor:SoulType.name,name:options?.name||options?.id,kind:options?.kind,position:options?.position});try{return new SoulType(options,context);}catch(error){console.error('B"H | INSTANTIATE_CONSTRUCTOR_FAILED',{type,name:options?.name||options?.id,message:error?.message||String(error),stack:String(error?.stack||'').slice(0,800)});return null;}}
const instantiateMezuzahDirect={async addObject(type,options){const nivra=makeNivra(this,type,options);if(!nivra)return null;if(!this.nivrayim.includes(nivra))this.nivrayim.push(nivra);if(nivra.heescheel)await nivra.heescheel(this);proof('addObject-heescheel-finished',{type,name:nivra.name,hasMesh:Boolean(nivra.mesh),meshName:nivra.mesh?.name,parent:nivra.mesh?.parent?.name});if(nivra.ready)await nivra.ready();if(nivra.afterBriyah)await nivra.afterBriyah();return nivra;},parseDefinitions(nivrayim){const list=[];if(!nivrayim)return list;for(const[type,configs]of Object.entries(nivrayim)){const configArray=Array.isArray(configs)?configs:typeof configs==='object'&&configs!==null?Object.values(configs):[];console.info('B"H | LOAD_DEFINITION_TYPE_PROOF',{type,count:configArray.length});configArray.forEach(opt=>{const evaled=Utils.evalStringifiedFunctions(opt),made=makeNivra(this,type,evaled);if(!made)return;proof('definition-created',{type,constructor:made.constructor?.name,name:evaled?.name||evaled?.id,kind:evaled?.kind,position:evaled?.position});list.push(made);});}console.info('B"H | LOAD_DEFINITION_TOTAL_PROOF',{count:list.length});return list;}};
export default instantiateMezuzahDirect;
