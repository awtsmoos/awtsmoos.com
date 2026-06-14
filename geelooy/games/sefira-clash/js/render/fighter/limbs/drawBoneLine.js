/**
 * B"H
 * Refined limb strokes.
 *
 * Chapter 95: a limb may be struck, hurried, or afraid, but it should not become
 * a broken ruler. These visual-only guards clamp impossible render stretches
 * while the true gameplay skeleton remains untouched.
 */
const LENGTH_LIMIT = 1.34;

function safePoint(p) {
  return p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

function visualTip(bone) {
  if (!safePoint(bone?.root) || !safePoint(bone?.tip)) return null;
  const dx = bone.tip.x - bone.root.x;
  const dy = bone.tip.y - bone.root.y;
  const len = Math.hypot(dx, dy) || 1;
  const max = Math.max(8, (bone.len || len) * LENGTH_LIMIT);
  const scale = Math.min(1, max / len);
  return { x: bone.root.x + dx * scale, y: bone.root.y + dy * scale };
}

function drawSegment(ctx, root, tip) {
  const mx = (root.x + tip.x) * 0.5;
  const my = (root.y + tip.y) * 0.5;
  ctx.beginPath();
  ctx.moveTo(root.x, root.y);
  ctx.quadraticCurveTo(mx, my - 1.5, tip.x, tip.y);
  ctx.stroke();
}

export function drawBoneLine(ctx, bone) {
  if (!bone || bone.id === 'root' || bone.id === 'head') return;
  const tip = visualTip(bone);
  if (!tip) return;
  drawSegment(ctx, bone.root, tip);
}

export function drawOffsetBone(ctx, bone, dx, dy) {
  const tip = visualTip(bone);
  if (!tip || !safePoint(bone.root)) return;
  drawSegment(ctx, { x: bone.root.x + dx, y: bone.root.y + dy }, { x: tip.x + dx, y: tip.y + dy });
}
