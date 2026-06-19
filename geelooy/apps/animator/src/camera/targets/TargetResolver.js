// B"H
import { CameraTarget } from './CameraTarget.js';
import { TargetListNormalizer } from './TargetListNormalizer.js';
import { TargetRoleClassifier } from './TargetRoleClassifier.js';
import { TargetBoundsResolver } from './TargetBoundsResolver.js';
import { TargetPriorityResolver } from './TargetPriorityResolver.js';
import { TargetSafetyFilter } from './TargetSafetyFilter.js';
export class TargetResolver{static resolve(event={},state){const chars=state?.get?.('characters')||{};const props=this.props(state?.get?.('props')||{});const raw=TargetListNormalizer.normalize(event.targets,event.targetActors,event.focus,event.speaker,event.listener,event.prop,event.objectTarget);const targets=raw.map(item=>this.one(item,event,chars,props)).filter(Boolean);return TargetPriorityResolver.assign(TargetSafetyFilter.apply(targets,state),event);}static one(item,event,chars,props){if(item.type==='point')return CameraTarget.make({...item,bounds:{x:item.x||0,y:item.y||0,w:1,h:1},position:{x:item.x||0,y:item.y||0}});const id=item.id;const role=item.role||TargetRoleClassifier.role(id,event);if(chars[id]){const b=TargetBoundsResolver.actor(chars[id]);return CameraTarget.make({id,type:'actor',role,priority:item.priority,bounds:b,position:{x:b.x,y:b.y},raw:chars[id]});}if(props[id]){const b=TargetBoundsResolver.prop(props[id]);return CameraTarget.make({id,type:'prop',role,priority:item.priority,bounds:b,position:{x:b.x,y:b.y},raw:props[id]});}return null;}static props(p){return Array.isArray(p)?Object.fromEntries(p.filter(x=>x?.id).map(x=>[x.id,x])):p;}}
