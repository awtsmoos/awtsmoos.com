// B"H
/**
 * B"H
 *
 * Door proof watches the house breathe: hover, open, pass, close, block. It is
 * the regression guard for the threshold between outside and inside.
 */
import { sleep } from "./ProofCommon.js?compact=true&v=animal-realism-split-20260705-bh1";

function doorWrappers(olam) {
  return (olam?.interactableNivrayim || []).filter(nivra => nivra?.type === "cottageDoor" && nivra?.doorState);
}
function doorPivots(olam) {
  const out = [];
  olam?.__livingRegionCottageRoot?.traverse?.(node => {
    if (node?.userData?.doorHingePivot && node.userData.doorState) out.push(node);
  });
  return out;
}
function doorColliderState(olam, doorId) {
  const rows = [];
  olam?.__livingRegionCottageRoot?.traverse?.(node => {
    const data = node?.userData || {};
    if (data.doorId === doorId || data.doorState?.id === doorId) {
      rows.push({ name:node.name || null, doorPanel:Boolean(data.doorPanel), closedCollider:data.closedCollider, doorOpen:data.doorOpen, stateOpen:data.doorState?.open });
    }
  });
  return rows;
}

export async function proveDoor(olam) {
  const wrapper = doorWrappers(olam)[0];
  if (!wrapper) return { ok:false, reason:"no-door-wrapper", count:doorWrappers(olam).length, pivots:doorPivots(olam).length };
  if (wrapper.doorState.open) wrapper.ayshPeula?.("accepted interaction", { action:"accepted interaction", source:"proof-close-start" });
  await sleep(120);
  const closedBefore = doorColliderState(olam, wrapper.doorState.id);
  const hover = wrapper.ayshPeula?.("mouseEnter", { action:"mouseEnter", source:"proof-hover" });
  await sleep(80);
  const opened = wrapper.ayshPeula?.("accepted interaction", { action:"accepted interaction", source:"proof-open" });
  await sleep(180);
  const openState = { open:Boolean(wrapper.doorState.open), collision:olam.__lastDoorCollisionRefresh || null, rows:doorColliderState(olam, wrapper.doorState.id) };
  const closed = wrapper.ayshPeula?.("accepted interaction", { action:"accepted interaction", source:"proof-close" });
  await sleep(180);
  wrapper.ayshPeula?.("mouseLeave", { action:"mouseLeave", source:"proof-leave" });
  const closedAfter = { open:Boolean(wrapper.doorState.open), collision:olam.__lastDoorCollisionRefresh || null, rows:doorColliderState(olam, wrapper.doorState.id) };
  const closedBlocks = closedAfter.rows.some(r => r.doorPanel && r.closedCollider === true);
  const openAllows = openState.rows.some(r => r.doorPanel && r.closedCollider === false);
  return { ok:Boolean(hover && opened && closed && openAllows && closedBlocks), id:wrapper.doorState.id, hover:Boolean(hover), opened:Boolean(opened), closed:Boolean(closed), openAllows, closedBlocks, closedBefore, openState, closedAfter, diag:olam.__mitzvahDoorDiag || null, registryCount:olam.__doorInteractionRegistry?.length || 0 };
}

export default proveDoor;
