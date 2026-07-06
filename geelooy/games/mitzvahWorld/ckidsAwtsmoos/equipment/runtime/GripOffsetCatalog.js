// B"H
/** @file GripOffsetCatalog.js @description Grip transforms seat real blades, bows, and staffs inside chossid hand bones. */
const V=(x=0,y=0,z=0)=>({x,y,z});
const G=(position,rotation,scale=V(1,1,1),left=V(-.18,-.06,.02))=>({position,rotation,scale,leftHandHint:left});
export const GRIP_OFFSETS=Object.freeze({ sword:G(V(.035,-.045,.02),V(-1.35,.08,.05),V(1,1,1)), dagger:G(V(.025,-.035,.015),V(-1.2,.05,.12),V(.72,.72,.72)), greatSword:G(V(.045,-.07,.025),V(-1.48,.04,.02),V(1.18,1.18,1.18),V(-.22,-.11,.035)), staff:G(V(.04,-.09,.035),V(-.18,0,.08),V(1.1,1.1,1.1),V(-.25,-.18,.04)), bow:G(V(.055,-.06,.02),V(-.65,.25,.2),V(1,1,1),V(-.2,-.04,.02)), crossbow:G(V(.05,-.055,.025),V(-.5,.1,.18),V(1,1,1),V(-.16,-.03,.02)), tool:G(V(.035,-.055,.025),V(-.95,.06,.05)), default:G(V(),V()) });
export function gripOffset(key="default"){ return GRIP_OFFSETS[key]||GRIP_OFFSETS.default; }
export default GRIP_OFFSETS;
