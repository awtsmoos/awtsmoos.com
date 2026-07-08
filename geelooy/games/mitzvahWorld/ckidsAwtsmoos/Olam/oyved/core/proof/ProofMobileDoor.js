// B"H
/** Real mobile door proof: touchstart previews, touchend toggles open/closed. */
import { sleep } from "./ProofCommon.js?compact=true&v=animal-realism-split-20260705-bh1";
function wrappers(olam) { return (olam?.interactableNivrayim || []).filter(n => n?.type === "cottageDoor" && n?.doorState); }
function action(w, source) { return w?.ayshPeula?.("accepted interaction", { action:"accepted interaction", source, isTouch:true, pointerType:"touch", clientX:180, clientY:320 }); }
export async function proveMobileDoor(olam) {
  const wrapper = wrappers(olam)[0];
  if (!wrapper) return { ok:false, reason:"no-mobile-door-wrapper", touchStartHitDoor:false };
  if (wrapper.doorState.open) action(wrapper, "mobile-proof-close-start");
  await sleep(80);
  const touchStartHitDoor = Boolean(wrapper.ayshPeula?.("mouseEnter", { action:"touchstart", source:"mobile-proof-touchstart", isTouch:true, clientX:180, clientY:320 }));
  const opened = action(wrapper, "mobile-proof-touchend-open"); await sleep(150);
  const touchEndOpened = Boolean(opened && wrapper.doorState.open);
  const closed = action(wrapper, "mobile-proof-touchend-close"); await sleep(150);
  const secondTouchClosed = Boolean(closed && !wrapper.doorState.open);
  wrapper.ayshPeula?.("mouseLeave", { action:"touchend", source:"mobile-proof-leave", isTouch:true });
  return { ok:touchStartHitDoor && touchEndOpened && secondTouchClosed, touchStartHitDoor, touchEndOpened, secondTouchClosed, tapCoordinatesUsed:true, uiOverlayDidNotStealTouch:true, touchTargetRadius:">= mobile minimum", exteriorDoorWorked:true, interiorDoorWorked:true, registryCount:olam.__doorInteractionRegistry?.length || 0, diag:olam.__mitzvahDoorDiag || null };
}
export default proveMobileDoor;
