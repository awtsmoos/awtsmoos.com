// B"H
/** @file GripOffsetCatalog.js @description Per-item offsets make visible weapons sit in the palm instead of floating. */
const V = (x=0,y=0,z=0)=>({x,y,z});
export const GRIP_OFFSETS = Object.freeze({
  sword:{ position:V(.035,-.045,.02), rotation:V(-1.35,.08,.05), scale:V(1,1,1) },
  dagger:{ position:V(.025,-.035,.015), rotation:V(-1.2,.05,.12), scale:V(.72,.72,.72) },
  staff:{ position:V(.04,-.08,.035), rotation:V(-.2,0,.08), scale:V(1.1,1.1,1.1) },
  bow:{ position:V(.055,-.06,.02), rotation:V(-.65,.25,.2), scale:V(1,1,1) },
  default:{ position:V(0,0,0), rotation:V(0,0,0), scale:V(1,1,1) }
});
export function gripOffset(key = "default") { return GRIP_OFFSETS[key] || GRIP_OFFSETS.default; }
export default GRIP_OFFSETS;
