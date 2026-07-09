// B"H
const JOY_KEYS = Object.freeze({ up:"KeyW", down:"KeyS", left:"KeyA", right:"KeyD" });
const ALL_JOY_KEYS = Object.values(JOY_KEYS);
export function createControls() {
  const keys = new Set();
  const out = { jump:false, thetaDeg:0, phiDeg:10, desiredDistance:8.5, currentDistance:8.5, minDistance:2.2, maxDistance:18, xSpeed:75, ySpeed:54, dragging:false, keys };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const keyDown = code => { if (code) keys.add(code); };
  const keyUp = code => { if (code) keys.delete(code); };
  addEventListener("keydown", e => keyDown(e.code));
  addEventListener("keyup", e => keyUp(e.code));
  let last = null;
  function rotate(dx, dy) {
    const width = Math.max(1, innerWidth || 1920), height = Math.max(1, innerHeight || 1080), degreeToRadian = Math.PI / 180;
    const rotX = dx * (out.xSpeed / width), rotY = dy * (out.ySpeed / height);
    out.thetaDeg -= rotX * degreeToRadian * 50;
    out.phiDeg = clamp(out.phiDeg - rotY * degreeToRadian * 50, -18, 48);
  }
  function startCamera(e) {
    if (e.target.closest?.("#joystick-container,#mobile-jump-button")) return;
    out.dragging = true;
    last = { x:e.clientX, y:e.clientY };
  }
  function moveCamera(e) {
    if (!out.dragging || !last) return;
    rotate(e.clientX - last.x, e.clientY - last.y);
    last = { x:e.clientX, y:e.clientY };
  }
  addEventListener("pointerdown", startCamera, { passive:true });
  addEventListener("pointermove", moveCamera, { passive:true });
  addEventListener("pointerup", () => { out.dragging = false; last = null; });
  addEventListener("pointercancel", () => { out.dragging = false; last = null; });
  addEventListener("touchstart", e => { const t = e.changedTouches?.[0]; if (t && !t.target.closest?.("#joystick-container,#mobile-jump-button")) startCamera({ target:t.target, clientX:t.clientX, clientY:t.clientY }); }, { passive:true });
  addEventListener("touchmove", e => { const t = e.changedTouches?.[0]; if (t) moveCamera({ clientX:t.clientX, clientY:t.clientY }); }, { passive:true });
  addEventListener("touchend", () => { out.dragging = false; last = null; });
  addEventListener("wheel", e => { out.desiredDistance = clamp(out.desiredDistance + e.deltaY * .018, out.minDistance, out.maxDistance); }, { passive:true });
  const base = document.getElementById("joystick-base"), thumb = document.getElementById("joystick-thumb"), jump = document.getElementById("mobile-jump-button");
  let active = null, origin = null;
  function releaseJoy() { ALL_JOY_KEYS.forEach(keyUp); if (thumb) thumb.style.transform = "translate(0px,0px)"; active = null; origin = null; }
  function pressDirection(angle) {
    ALL_JOY_KEYS.forEach(keyUp);
    const k = JOY_KEYS;
    if (angle >= 337.5 || angle < 22.5) keyDown(k.right);
    else if (angle < 67.5) { keyDown(k.right); keyDown(k.down); }
    else if (angle < 112.5) keyDown(k.down);
    else if (angle < 157.5) { keyDown(k.left); keyDown(k.down); }
    else if (angle < 202.5) keyDown(k.left);
    else if (angle < 247.5) { keyDown(k.left); keyDown(k.up); }
    else if (angle < 292.5) keyDown(k.up);
    else { keyDown(k.up); keyDown(k.right); }
  }
  function steer(dx, dy) {
    const mag = Math.min(30, Math.hypot(dx, dy));
    if (mag < 7) return releaseJoy();
    const a = Math.atan2(dy, dx);
    let angle = a * 180 / Math.PI;
    if (angle < 0) angle += 360;
    pressDirection(angle);
    if (thumb) thumb.style.transform = `translate(${Math.cos(a) * mag}px,${Math.sin(a) * mag}px)`;
  }
  function joyStart(e) { active = e.pointerId ?? "touch"; origin = { x:e.clientX, y:e.clientY }; base?.setPointerCapture?.(active); e.preventDefault?.(); e.stopPropagation?.(); }
  function joyMove(e) { if (!origin) return; steer(e.clientX - origin.x, e.clientY - origin.y); e.preventDefault?.(); e.stopPropagation?.(); }
  base?.addEventListener("pointerdown", joyStart, { passive:false });
  base?.addEventListener("pointermove", e => { if (e.pointerId === active) joyMove(e); }, { passive:false });
  base?.addEventListener("pointerup", e => { if (e.pointerId === active) releaseJoy(); }, { passive:false });
  base?.addEventListener("pointercancel", releaseJoy, { passive:false });
  base?.addEventListener("touchstart", e => { const t = e.changedTouches?.[0]; if (t) joyStart({ pointerId:t.identifier, clientX:t.clientX, clientY:t.clientY, preventDefault:()=>e.preventDefault(), stopPropagation:()=>e.stopPropagation() }); }, { passive:false });
  base?.addEventListener("touchmove", e => { const t = [...e.changedTouches].find(x => x.identifier === active) || e.changedTouches?.[0]; if (t) joyMove({ clientX:t.clientX, clientY:t.clientY, preventDefault:()=>e.preventDefault(), stopPropagation:()=>e.stopPropagation() }); }, { passive:false });
  base?.addEventListener("touchend", releaseJoy, { passive:false });
  jump?.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); out.jump = true; keyDown("Space"); jump.classList.add("active-state"); }, { passive:false });
  jump?.addEventListener("pointerup", e => { e.preventDefault(); out.jump = false; keyUp("Space"); jump.classList.remove("active-state"); }, { passive:false });
  jump?.addEventListener("pointercancel", () => { out.jump = false; keyUp("Space"); jump.classList.remove("active-state"); }, { passive:false });
  out.motion = () => ({ forward:keys.has("KeyW") || keys.has("ArrowUp"), backward:keys.has("KeyS") || keys.has("ArrowDown"), turningLeft:keys.has("KeyA") || keys.has("ArrowLeft"), turningRight:keys.has("KeyD") || keys.has("ArrowRight"), stridingLeft:keys.has("KeyQ"), stridingRight:keys.has("KeyE"), running:keys.has("ShiftLeft") || keys.has("ShiftRight"), jump:keys.has("Space") || out.jump });
  return out;
}
