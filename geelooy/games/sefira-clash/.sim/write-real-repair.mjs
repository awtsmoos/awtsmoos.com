import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const files = {
'js/ai/botBrain.js': `/**
 * B"H
 * Direct combat AI repair.
 *
 * Chapter 232: the bots stop pacing between platforms like lost sparks. The
 * Awtsmoos gives them a simple fighting will: recover, chase, jump between
 * heights, attack in range, charge sometimes, and never forget the nearest foe.
 */
export function driveBots(state) {
  for (const bot of state.fighters) {
    if (bot.human || bot.dead || bot.hidden || bot.respawnTimer) continue;
    bot.input = botCommand(bot, state);
  }
}

function botCommand(bot, state) {
  const target = chooseTarget(bot, state.fighters);
  if (!target) return blank();
  const dx = target.x - bot.x;
  const dy = target.y - bot.y;
  const adx = Math.abs(dx);
  const close = adx < 118 && Math.abs(dy) < 96;
  const veryClose = adx < 72 && Math.abs(dy) < 72;
  const offstage = bot.y > state.map.blast?.bottom - 260 || bot.x < 40 || bot.x > state.map.w - 40;
  const brain = remember(bot, target, close);
  const out = blank();
  out.aimX = norm(dx);
  out.aimY = norm(dy);
  out.x = movementX(bot, state, dx, offstage);
  out.hunt = true;
  if (offstage) return recover(out, bot, state);
  if (shouldJump(bot, dy, adx, state)) out.jump = true;
  if (close) chooseAttack(out, bot, brain, veryClose, dy);
  if (!close && adx < 210 && brain.clock % 90 === 0 && bot.grounded) {
    out.chargePunch = true;
    out.punch = true;
  }
  return out;
}

function blank() { return { x: 0, y: 0, aimX: 0, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false, hunt: false, rapidPunch: false, rapidKick: false, chargePunch: false, chargeKick: false }; }
function chooseTarget(bot, fighters) { return fighters.filter(f => f !== bot && !f.dead && !f.hidden && !f.respawnTimer).sort((a, b) => score(bot, a) - score(bot, b))[0]; }
function score(bot, f) { return Math.abs(f.x - bot.x) + Math.abs(f.y - bot.y) * 1.25 + (f.human ? -120 : 0); }
function remember(bot, target, close) { bot.aiMind ||= {}; bot.aiMind.clock = (bot.aiMind.clock || 0) + 1; bot.aiMind.targetId = target.id; bot.aiMind.mode = close ? 'Attack' : 'Chase'; bot.aiMind.lastTargetX = target.x; return bot.aiMind; }
function movementX(bot, state, dx, offstage) { if (offstage) return bot.x < state.map.w / 2 ? 1 : -1; const edge = edgeWarning(bot); if (edge) return edge; return Math.abs(dx) < 42 ? 0 : Math.sign(dx); }
function edgeWarning(bot) { const p = bot.currentPlatform; if (!p) return 0; if (bot.x < p.x + 42) return 1; if (bot.x > p.x + p.w - 42) return -1; return 0; }
function recover(out, bot, state) { out.x = bot.x < state.map.w / 2 ? 1 : -1; out.jump = true; out.special = true; out.aimX = out.x; out.aimY = -1; return out; }
function shouldJump(bot, dy, adx) { if (!bot.grounded) return false; if (dy < -54 && adx < 260) return true; if (bot.aiMind?.clock % 150 === 0 && adx > 150) return true; return false; }
function chooseAttack(out, bot, brain, veryClose, dy) { const phase = brain.clock % 120; if (veryClose && phase > 82 && phase < 96) { out.grab = true; return; } if (phase > 42 && phase < 70 && bot.grounded) { out.kick = true; out.chargeKick = phase > 56; out.aimY = dy < -40 ? -0.5 : 0; return; } if (phase % 18 < 8) { out.punch = true; out.rapidPunch = phase % 36 < 18; } }
function norm(v) { return Math.max(-1, Math.min(1, v / 120)); }
`,
'js/render/v3/character/animation/Run.js': `/**
 * B"H
 * V3 visible run authored keyframe.
 *
 * Chapter 233: walking finally shows. Arms swing, knees trade places, and the
 * body leans without collapsing.
 */
import { add } from '../CharacterRig.js';
export function run(p, f) {
  const face = p.face, speed = Math.min(1, Math.abs(f.vx || 0) / 8);
  const phase = Math.sin((f.motionClock || 0) * 0.075) * Math.max(0.45, speed);
  p.chest = add(p.chest, face * 4, -2);
  p.neck = add(p.neck, face * 4, -2);
  p.head = add(p.head, face * 5, -2);
  p.leftElbow = add(p.leftElbow, -face * phase * 12, -2);
  p.rightElbow = add(p.rightElbow, face * phase * 12, -2);
  p.leftHand = add(p.leftHand, -face * phase * 18, -4);
  p.rightHand = add(p.rightHand, face * phase * 18, -4);
  p.leftKnee = add(p.leftKnee, face * phase * 15, -Math.max(0, phase) * 9);
  p.rightKnee = add(p.rightKnee, -face * phase * 15, -Math.max(0, -phase) * 9);
  p.leftFoot = add(p.leftFoot, face * phase * 20, -Math.max(0, phase) * 8);
  p.rightFoot = add(p.rightFoot, -face * phase * 20, -Math.max(0, -phase) * 8);
  return p;
}
`,
'js/render/v3/character/animation/Jump.js': `/** B"H — V3 visible jump keyframe, knees lift and arms counterbalance. */
import { add } from '../CharacterRig.js';
export function jump(p) {
  p.chest = add(p.chest, 0, -8); p.neck = add(p.neck, 0, -8); p.head = add(p.head, 0, -8);
  p.leftElbow = add(p.leftElbow, -6, -16); p.rightElbow = add(p.rightElbow, 6, -16);
  p.leftHand = add(p.leftHand, -10, -20); p.rightHand = add(p.rightHand, 10, -20);
  p.leftKnee = add(p.leftKnee, -14, -22); p.rightKnee = add(p.rightKnee, 14, -14);
  p.leftFoot = add(p.leftFoot, -18, -16); p.rightFoot = add(p.rightFoot, 18, -8);
  return p;
}
`,
'js/render/v3/character/animation/Fall.js': `/** B"H — V3 visible fall keyframe, loose limbs but intact body. */
import { add } from '../CharacterRig.js';
export function fall(p) {
  p.chest = add(p.chest, 0, 4); p.neck = add(p.neck, 0, 4); p.head = add(p.head, 0, 4);
  p.leftElbow = add(p.leftElbow, -7, 6); p.rightElbow = add(p.rightElbow, 7, 6);
  p.leftHand = add(p.leftHand, -9, 8); p.rightHand = add(p.rightHand, 9, 8);
  p.leftFoot = add(p.leftFoot, -8, 5); p.rightFoot = add(p.rightFoot, 8, 5);
  return p;
}
`,
'js/render/v3/character/animation/Punch.js': `/**
 * B"H
 * V3 punch / rapid / charge keyframe.
 *
 * Chapter 234: rapid is a visible jab, charge is a deeper windup and release.
 */
import { add, smooth } from '../CharacterRig.js';
export function punch(p, f) {
  const a = f.attack || f.rapidAttack || {}, face = p.face;
  const span = Math.max(1, (a.startup || 5) + (a.active || 7) + (a.recovery || 8));
  const raw = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const t = Math.max(a.rapid ? 0.55 : 0.35, smooth(raw * 0.35 / span));
  const side = face > 0 ? 'right' : 'left', other = side === 'right' ? 'left' : 'right';
  const charge = a.fullCharge ? 1 : Math.min(1, a.charge || 0);
  const reach = a.rapid ? 42 : 52 + charge * 22;
  p.chest = add(p.chest, face * (2 + charge * 5) * t, -1 - charge * 4);
  p.neck = add(p.neck, face * (2 + charge * 4) * t, -1 - charge * 3);
  p.head = add(p.head, face * (1 + charge * 3) * t, -charge * 2);
  p[side + 'Elbow'] = add(p[side + 'Shoulder'], face * reach * 0.48, 16 - charge * 8);
  p[side + 'Hand'] = add(p[side + 'Shoulder'], face * reach, 15 - charge * 10);
  p[other + 'Elbow'] = add(p[other + 'Shoulder'], -face * (12 + charge * 8), 40);
  p[other + 'Hand'] = add(p[other + 'Shoulder'], -face * (18 + charge * 10), 64);
  return p;
}
`,
'js/render/v3/character/animation/Idle.js': `/** B"H — V3 idle/charge stance. */
import { add } from '../CharacterRig.js';
export function idle(p, f) {
  const glow = Math.min(1, f.chargeGlow || 0);
  const b = Math.sin((f.motionClock || 0) * 0.012) * 0.55;
  p.chest = add(p.chest, 0, b - glow * 5); p.neck = add(p.neck, 0, b - glow * 5); p.head = add(p.head, 0, b - glow * 5);
  p.leftElbow = add(p.leftElbow, 5 - glow * 10, -7 - glow * 12);
  p.rightElbow = add(p.rightElbow, -5 + glow * 10, -7 - glow * 12);
  p.leftHand = add(p.leftHand, 8 - glow * 14, -12 - glow * 18);
  p.rightHand = add(p.rightHand, -8 + glow * 14, -12 - glow * 18);
  return p;
}
`,
'js/render/v3/hud/PlayerCard.js': `/**
 * B"H
 * V3 strong player card.
 *
 * Chapter 235: percentages return as the crown of the screen.
 */
import { drawStockDots } from './StockDots.js';
function hue(f){return 'hsl('+f.dna.hue+' 92% 62%)';}
export function drawPlayerCard(ctx, f, x, y, w) {
  const c=hue(f), pct=Math.round(f.damage);
  ctx.save();
  ctx.fillStyle='rgba(3,4,8,.86)'; ctx.strokeStyle=f.human?'#69ffff':c; ctx.lineWidth=f.human?2.5:1.8;
  round(ctx,x,y,w,54,12); ctx.fill(); ctx.stroke();
  ctx.font='950 12px system-ui'; ctx.fillStyle=f.human?'#69ffff':c; ctx.fillText(f.human?'YOU':f.name.replace('Bot ','B'),x+8,y+16);
  ctx.font='950 28px system-ui'; ctx.fillStyle=pct>=120?'#ff6f5c':pct>=70?'#ffe36e':'#ffffff'; ctx.strokeStyle='#000'; ctx.lineWidth=4;
  const text=f.dead?'OUT':pct+'%'; ctx.strokeText(text,x+8,y+43); ctx.fillText(text,x+8,y+43);
  drawStockDots(ctx,f,x+w-35,y+42,c); ctx.restore();
}
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
`,
'js/render/v3/hud/TopDamageBar.js': `/** B"H — V3 top damage bar replaces old menu bar. */
import { drawPlayerCard } from './PlayerCard.js';
export function drawTopDamageBar(ctx, state, w) {
  const fighters=state.fighters.slice(0,5), pad=10, gap=8;
  const cw=Math.max(92, Math.min(156,(w-pad*2-gap*(fighters.length-1))/Math.max(1,fighters.length)));
  const total=fighters.length*cw+(fighters.length-1)*gap;
  const start=Math.max(pad,(w-total)/2);
  fighters.forEach((f,i)=>drawPlayerCard(ctx,f,start+i*(cw+gap),10,cw));
  drawSmallMenu(ctx,w,state);
}
function drawSmallMenu(ctx,w,state){ctx.save();ctx.fillStyle='rgba(3,4,8,.72)';ctx.strokeStyle='rgba(255,224,130,.5)';ctx.lineWidth=1.5;round(ctx,w-88,10,78,38,11);ctx.fill();ctx.stroke();ctx.fillStyle='#ffe9a8';ctx.font='900 14px system-ui';ctx.textAlign='center';ctx.fillText('Menu',w-49,34);ctx.restore();}
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
`,
'js/render/ui.js': `/**
 * B"H
 * V3 UI renderer repaired.
 *
 * Chapter 236: the old topbar is dethroned. Damage percentages are the primary
 * UI, offscreen arrows are quiet, and the menu survives as a tiny canvas hint.
 */
import { drawV3Hud } from './v3/hud/index.js';
import { drawOffscreenArrow } from './v3/hud/OffscreenArrow.js';

export function drawUi(ctx, state, w, h = innerHeight) {
  drawV3Hud(ctx, state, w, h);
  drawOffscreenFighterBeacons(ctx, state, w, h, w < 760);
  drawRespawnCountdown(ctx, state, w, h);
  if (state.winner) drawWinner(ctx, state, w, h);
}
function drawOffscreenFighterBeacons(ctx, state, w, h, mobile) {
  if (!state.camera) return;
  const top = mobile ? 72 : 74, bottom = h - 104;
  for (const f of state.fighters) {
    if (!f || f.dead || f.hidden || (f.human && !state.camera.spectating)) continue;
    const s = worldToScreen(f, state.camera, w, h);
    if (s.x > 20 && s.x < w - 20 && s.y > top && s.y < bottom) continue;
    drawOffscreenArrow(ctx, clamp(s.x,20,w-20), clamp(s.y,top,bottom), Math.atan2(s.y-clamp(s.y,top,bottom), s.x-clamp(s.x,20,w-20)), 'hsl('+f.dna.hue+' 90% 60%)');
  }
}
function worldToScreen(f, camera, w, h) { const z = camera.zoom || 1; return { x: w / 2 + z * (f.x + camera.x - w / 2), y: h / 2 + z * (f.y - 95 + camera.y - h / 2) }; }
function drawRespawnCountdown(ctx, state, w, h) { const f = state.fighters.find(item => item.human && item.respawnTimer > 0 && !item.dead); if (!f) return; const n = Math.max(1, Math.ceil(f.respawnTimer / 30)); ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(w / 2, h * 0.44, 54, 0, Math.PI * 2); ctx.fill(); ctx.font = '950 48px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff2a8'; ctx.fillText(String(n), w / 2, h * 0.44 + 17); ctx.restore(); }
function drawWinner(ctx, state, w, h) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.84)'; ctx.fillRect(w / 2 - 160, h / 2 - 38, 320, 76); ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.fillText(state.winner + ' wins', w / 2, h / 2 + 10); ctx.restore(); }
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
`,
'js/combat/inputIntent.js': `import { aimForAttack, rememberAttackAim } from '../controls/aimMemory.js';

/**
 * B"H
 * Combat input intent interpreter repaired.
 *
 * Chapter 237: tap, rapid, and charge are three separate rivers. Hold charges;
 * quick taps rapid; AI may command rapid or charge directly; no river steals
 * from another.
 */
export function readCombatIntent(f, input) {
  f.charge ||= { prev: {} };
  const liveAim = readAim(f, input);
  const pressed = buttonEdges(f, input);
  rememberPressAim(f, pressed, liveAim);
  const rapid = rapidIntent(f, input, pressed);
  return {
    aim: attackAim(f, input, liveAim), liveAim, pressed, rapid,
    rapidPunch: !!input.rapidPunch || rapid.punch,
    rapidKick: !!input.rapidKick || rapid.kick,
    aiChargePunch: !!input.chargePunch,
    aiChargeKick: !!input.chargeKick,
    punchHeld: !!input.punch, kickHeld: !!input.kick,
    grabHeld: !!input.grab, specialHeld: !!input.special,
    airborne: !f.grounded, fastFall: !f.grounded && !!input.down,
    wantsGrab: pressed.grab, wantsSpecial: pressed.special,
    releasedPunch: pressed.releasePunch, releasedKick: pressed.releaseKick
  };
}
export function readAim(f, input) { const rawX = number(input.aimX ?? input.x); const rawY = number(input.aimY ?? input.y); const mag = Math.hypot(rawX, rawY); if (mag < 0.18) return enrichAim(f.face || 1, 0, rawX, rawY, 0); return enrichAim(rawX / mag, rawY / mag, rawX, rawY, Math.min(1, mag)); }
function enrichAim(x, y, rawX, rawY, mag) { return { x, y, rawX, rawY, mag, angle: Math.atan2(y, x), up: y < -0.42, down: y > 0.42, side: Math.abs(x) > 0.35 }; }
function buttonEdges(f, input) { const prev = f.charge.prev || {}; return { punch: !prev.punch && !!input.punch, kick: !prev.kick && !!input.kick, grab: !prev.grab && !!input.grab, special: !prev.special && !!input.special, releasePunch: !!prev.punch && !input.punch, releaseKick: !!prev.kick && !input.kick }; }
function rememberPressAim(f, pressed, aim) { f.charge.pressAim ||= {}; if (pressed.punch) { f.charge.pressAim.punch = { ...aim }; rememberAttackAim(f, 'punch', aim); } if (pressed.kick) { f.charge.pressAim.kick = { ...aim }; rememberAttackAim(f, 'kick', aim); } if (pressed.grab) f.charge.pressAim.grab = { ...aim }; if (pressed.special) f.charge.pressAim.special = { ...aim }; }
function attackAim(f, input, liveAim) { if (input.kick) return aimForAttack(f, 'kick', f.charge?.pressAim?.kick || liveAim); if (input.punch) return aimForAttack(f, 'punch', f.charge?.pressAim?.punch || liveAim); if (input.grab && f.charge?.pressAim?.grab) return f.charge.pressAim.grab; if (input.special && f.charge?.pressAim?.special) return f.charge.pressAim.special; return liveAim; }
function rapidIntent(f, input, pressed) { f.rapid ||= { punchTap: 0, kickTap: 0, timer: 0, holdPunchPulse: 0, holdKickPulse: 0 }; f.rapid.timer = Math.max(0, f.rapid.timer - 1); if (pressed.punch) f.rapid.punchTap = f.rapid.timer > 0 ? f.rapid.punchTap + 1 : 1; if (pressed.kick) f.rapid.kickTap = f.rapid.timer > 0 ? f.rapid.kickTap + 1 : 1; if (pressed.punch || pressed.kick) f.rapid.timer = 18; const tapPunch = f.rapid.punchTap >= 2 && f.rapid.timer > 0; const tapKick = f.rapid.kickTap >= 3 && f.rapid.timer > 0; return { punch: tapPunch || !!input.rapidPunch, kick: tapKick || !!input.rapidKick }; }
export function rememberCombatInput(f, input) { f.charge ||= {}; f.charge.prev = { punch: !!input.punch, kick: !!input.kick, grab: !!input.grab, special: !!input.special }; }
function number(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
`
};

for (const [path, content] of Object.entries(files)) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
let css = `html,body{margin:0;height:100%;height:100dvh;overflow:hidden;background:#050409;color:#fff0c6;font-family:system-ui,Arial,sans-serif;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;overscroll-behavior:none}*{box-sizing:border-box;-webkit-user-select:none!important;user-select:none!important;-webkit-tap-highlight-color:transparent}button,canvas,.touchControls,.touchControls *{touch-action:none!important;-webkit-user-drag:none!important}.shell{height:100%;background:#050409;position:relative}#olam{width:100vw;height:100dvh;display:block}.topbar{display:none!important}h1,p,label{margin:0}.menuOverlay{position:fixed;z-index:80;inset:8px 8px calc(92px + env(safe-area-inset-bottom)) 8px;overflow:auto;background:linear-gradient(180deg,#09050df4,#150d20f0);border:1px solid #e9c67599;border-radius:18px;padding:12px;box-shadow:0 0 34px #000e;color:#fff0c6;pointer-events:auto}.menuOverlay.hidden{display:none}.menuPanel h2{margin:0 0 8px;color:#ffe68b;font-size:22px}.menuPanel h3{margin:10px 0 4px;color:#84f7ff;font-size:14px;text-transform:uppercase;letter-spacing:.12em}.menuPoem{margin:0 0 14px;color:#ddc992}.instructionBox{border:1px solid #e9c67555;background:#0008;border-radius:12px;padding:10px;margin:0 0 16px;color:#fff4c0;font-weight:700}.cardGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}.menuCard{cursor:pointer;text-align:left;border:1px solid #e8c66a77;border-radius:16px;background:#0b0711;min-height:112px;color:#fff0c6;position:relative;overflow:hidden;padding:15px}.menuCard:hover,.menuCard:active{background:#1b1028;box-shadow:0 0 22px #e8c66a44;transform:translateY(-1px)}.cardAura{position:absolute;inset:-30px;opacity:.18;background:radial-gradient(circle at 70% 30%,hsl(var(--h) 90% 60%),transparent 42%)}.menuCard strong,.menuCard small,.menuCard em{position:relative;z-index:1}.menuCard strong{display:block;color:#ffe68b;font-size:17px}.menuCard small{display:block;color:#cdbb8d;margin-top:8px;min-height:30px}.menuCard em{display:inline-block;margin-top:10px;color:#0b0611;background:#ffe68b;border-radius:999px;padding:5px 10px;font-style:normal;font-weight:900}.customizePanel{display:grid;gap:12px}.fighterPreview{--chosen:182;display:grid;place-items:center;gap:6px;border:1px solid #ffe08255;border-radius:18px;background:#0008;padding:18px}.previewHead{display:grid;place-items:center;width:86px;height:86px;border-radius:50%;background:#080609;color:hsl(var(--chosen) 95% 65%);border:4px solid hsl(var(--chosen) 95% 65%);font-size:42px;position:relative;text-shadow:0 0 18px hsl(var(--chosen) 95% 65%)}.optionGrid,.colorGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:10px}.optionButton,.colorButton{display:grid;gap:5px;place-items:center;padding:13px;background:#120b1f;border:1px solid #ffe08266;color:#fff1c9}.optionButton span{font-size:28px}.optionButton.active,.colorButton.active{background:#ffe082;color:#110914;box-shadow:0 0 22px #ffe08255}.colorButton span{width:32px;height:32px;border-radius:50%;background:hsl(var(--h) 95% 58%);box-shadow:0 0 16px hsl(var(--h) 95% 58%)}.primaryMenuButton{font-size:17px;font-weight:900;padding:13px;background:#ffe082;color:#100813;border-radius:999px}.countdownPanel{display:grid;place-items:center;height:100%;text-align:center}.countdownNumber{font-size:86px;font-weight:900;color:#ffe68b;text-shadow:0 0 24px #ffe68b}.countdownPanel p{font-size:18px;color:#fff2be}.touchControls{position:fixed;z-index:18;bottom:max(10px,env(safe-area-inset-bottom));left:0;right:0;display:flex;justify-content:space-between;align-items:flex-end;padding:0 16px;pointer-events:none;opacity:.88}.stick{width:110px;height:110px;border-radius:50%;background:#ffffff18;border:1px solid #ffffff50;position:relative;pointer-events:auto;box-shadow:0 0 16px #0008}.stick span{position:absolute;width:38px;height:38px;left:calc(50% - 19px);top:calc(50% - 19px);border-radius:50%;background:#ffe6a0c8;will-change:transform}.touchButtons{pointer-events:auto;display:grid;grid-template-columns:repeat(3,52px);grid-auto-rows:48px;gap:8px;align-items:end}.touchButtons button{border-radius:16px;font-size:20px;font-weight:900;background:#2f1c50dd;color:#fff1c9;border:1px solid #e8c66a99;box-shadow:0 0 12px #0009;padding:0}.touchButtons button.primary{width:66px;height:66px;border-radius:50%;font-size:30px;background:#3b2365ee}.touchButtons button.utility{font-size:20px;background:#162847dd}.touchButtons button.wide{grid-column:span 3;border-radius:18px;height:42px}.touchButtons button.held{transform:scale(.92);background:#ffe082;color:#100813;box-shadow:0 0 18px #ffe08288}@media(pointer:fine){.touchControls{opacity:.42}.touchControls:hover{opacity:.9}}@media(max-width:760px){.menuOverlay{inset:8px 8px calc(112px + env(safe-area-inset-bottom)) 8px}.touchControls{padding:0 10px;opacity:.84}.stick{width:min(26vw,104px);height:min(26vw,104px)}.stick span{width:36px;height:36px;left:calc(50% - 18px);top:calc(50% - 18px)}.touchButtons{grid-template-columns:repeat(3,46px);grid-auto-rows:42px;gap:7px}.touchButtons button.primary{width:60px;height:60px;font-size:28px}.touchButtons button.wide{height:38px}.cardGrid{grid-template-columns:1fr}.optionGrid,.colorGrid{grid-template-columns:repeat(2,1fr)}}@media(max-height:640px) and (max-width:760px){.touchControls{transform:scale(.86);transform-origin:bottom center;left:-18px;right:-18px}.menuOverlay{inset:8px 8px calc(86px + env(safe-area-inset-bottom)) 8px}}`;
writeFileSync('style.css', css);
console.log(JSON.stringify({ ok: true, wrote: Object.keys(files).length + 1 }, null, 2));
