/** B"H @module PlayerRenderer Flat player only. */
import { resolvePose, walkCycle } from './player/PlayerPose.js';
import { drawArm, drawLegs, drawTorso } from './player/PlayerBodyParts.js';
import { drawHead } from './player/PlayerHead.js';
import { FootstepParticle } from './player/FootstepParticle.js';
const drawLightBar = (ctx, x, y, size, light) => { if (light === undefined) return; const w = size * .86, h = 5, bx = x + size / 2 - w / 2, by = y - size * .18; const ratio = Math.min(1, Math.max(0, light / 120)); ctx.fillStyle = '#05070b'; ctx.strokeStyle = '#fff176'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bx, by, w, h, h / 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff176'; ctx.fillRect(bx + 1, by + 1, (w - 2) * ratio, h - 2); };
export class PlayerRenderer { static draw(ctx, x, y, size, state = {}) { const { tick = 0, dir = 'd', moving = false, light } = state; const pose = resolvePose(dir); const cycle = walkCycle(tick); const sway = moving ? Math.sin(tick * .16) * 1.1 : 0; const bob = moving ? cycle.bob * size / 22 : 0; ctx.save(); ctx.translate(x + size / 2 + sway, y + size / 2 - bob); ctx.scale(pose.mirror, 1); drawArm(ctx, size, pose, cycle, false); drawLegs(ctx, size, pose, cycle); drawTorso(ctx, size, pose, cycle); drawArm(ctx, size, pose, cycle, true); drawHead(ctx, size, pose); ctx.restore(); drawLightBar(ctx, x, y, size, light); } }
export { FootstepParticle };
