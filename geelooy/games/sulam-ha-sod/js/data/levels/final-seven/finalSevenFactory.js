// B"H
import { P, C, S, E, R, T, G, L, F } from '../../levelPrimitives.js';

/**
 * Builds the seven final authored chambers from dense hand-tuned data.
 *
 * The Awtsmoos speaks the last block as a measured incantation: each config is
 * a distinct chamber, but the scaffold keeps the geometry consistent enough to
 * verify. Nothing here is random. Every tooth, carrier, bait platform, fake
 * coin, and falling decree is placed from the chamber's own seed.
 *
 * @param {object} cfg authored final-seven chamber data.
 * @returns {object} complete level object consumed by the campaign.
 */
export function buildFinalSeven(cfg) {
  const o = cfg.offset;
  const w = 27400 + o * 820;
  const xs = [0,1020,1960,2940,3960,5020,6120,7260,8440,9660,10920,12220,13560,14940,16360,17820,19320,20860,22460,25480 + o * 820];
  const ys = [505,430,350,270,190,110,190,270,350,270,190,110,190,270,350,270,190,110,150,154];
  return L(cfg.name, w, { x: 60, y: 420 }, P(w - 400, 68, 44, 90), cfg.law,
    xs.map((x, i) => P(x + (i ? o * 18 : 0), ys[i], i ? 130 + Math.min(110, i * 5) : 360, i ? 20 : 35)),
    rotorSet(o), trickSet(o, cfg), coinSet(o, cfg), [C(w - 540, 93, 'dinar')], spikeSet(o), enemySet(o, cfg), triggerSet(o, cfg), cfg.lore,
    { fakeCoins: fakeSet(o, cfg), trickCoins: trickCoinSet(o, cfg) });
}

function rotorSet(o) {
  return [R(1600 + o * 42,402,112,14,-6.7 - o * .2,1160), R(8200 + o * 48,242,130,14,7.6 + o * .2,1300), R(15020 + o * 54,162,142,14,-7.9 - o * .2,1420), R(22240 + o * 60,86,152,14,8.2 + o * .2,1500)];
}

function trickSet(o, cfg) {
  const n = o * 120;
  return [T(2160+n,334,92,16,'baitShift',{shiftX:cfg.flip?-210:210,range:250}),T(3240+n,254,94,16,'falseSpike'),T(4320+n,174,96,16,'safeSpike'),T(5420+n,94,98,16,'oneWay'),T(6560+n,174,100,16,'phantom'),T(7720+n,254,102,16,'commitDrop',{reform:3.8}),T(8920+n,334,104,16,'reverseBooster',{dir:1,boost:1500+o*30}),T(10160+n,254,106,16,'magnet',{pull:1020+o*30}),T(11440+n,174,108,16,cfg.flip?'antiJump':'antiSpeed'),T(12760+n,94,110,16,'falseSpike'),T(14120+n,174,112,16,'booster',{dir:-1,boost:1640+o*35,lift:74}),T(15520+n,254,114,16,'ice',{duration:2.9+o*.08}),T(16960+n,334,116,16,'fakeCheckpoint'),T(18440+n,254,118,16,'phantom'),T(19960+n,174,120,16,'safeSpike'),T(21520+n,94,124,16,cfg.flip?'antiSpeed':'antiJump'),T(23140+n,134,128,16,'falseSpike'),T(24440+n,144,132,16,'baitShift',{shiftX:cfg.flip?230:-230,range:260})];
}

function coinSet(o, cfg) {
  const n = o * 120;
  const data = [[460,460],[1060,390],[2000,310,'dinar'],[2980,230],[4000,150,'sela'],[5060,70],[6160,150,'maneh'],[7300,230],[8480,310,'dinar'],[9700,230],[10960,150,'sela'],[12260,70],[13600,150,'dinar'],[14980,230],[16400,310,'maneh'],[17860,230],[19360,150,'sela'],[20900,70],[22500,110,'dinar'],[25540 + o * 820,114,'maneh']];
  return data.map(([x,y,k]) => C(x + (x > 1200 ? n : 0), y, k || 'perutah')).concat([C(4320+n,136,cfg.gem)]);
}

function spikeSet(o) {
  const n = o * 120;
  return [S(760,481,90,24,1.7,1,2),S(7520+n,481,100,24,2.45,1,2.2),S(14040+n,481,110,24,2.95,1,2.2),S(20600+n,481,120,24,2.65,1,2.1),S(24980+n,481,130,24,3.25,1,2.2),{x:11680+n,y:146,w:76,h:22,proximity:true,range:132,instant:true,duration:1.02}];
}

function enemySet(o, cfg) {
  const n = o * 120;
  return [E(4000+n,156,3940+n,4160+n,174,'golem',`${cfg.short} porter`,{dropCoin:'dinar'}),E(8480+n,316,8420+n,8660+n,182,'watcher',`${cfg.short} eye`),E(13600+n,156,13500+n,13840+n,180,'leaper',`${cfg.short} jumper`,{dropCoin:'sela'}),E(17860+n,236,17740+n,18180+n,194,'herder',`${cfg.short} shepherd`),E(22500+n,116,22340+n,22780+n,178,'baitGuard',`${cfg.short} deceiver`),E(25540+o*820,120,25440+o*820,25820+o*820,170,'feign',`sleeping ${cfg.short}`,{dropCoin:'maneh'})];
}

function triggerSet(o, cfg) {
  const n = o * 120;
  return [G(2160+n,230,130,130,cfg.shiftMsg,{}),G(5420+n,40,150,130,cfg.oneWayMsg,{}),G(12220+n,40,150,130,cfg.fallMsg,{spikes:[{x:12360+n,y:12,w:78,h:24,warning:.55,duration:1.1,fallSpeed:620+o*12},{x:12470+n,y:44,w:82,h:24,warning:.7,duration:1.1,fallSpeed:650+o*12},{x:12586+n,y:76,w:86,h:24,warning:.85,duration:1.1,fallSpeed:680+o*12}]}),G(16400+n,280,150,130,cfg.fakeMsg,{}),G(25020+o*820,98,170,130,cfg.openMsg,{openExit:true})];
}

function fakeSet(o, cfg) {
  const n = o * 120;
  return [F(2180+n,295,'dinar',cfg.fakeOne),F(12680+n,62,'maneh',cfg.fakeTwo),F(21560+n,62,'sela',cfg.fakeThree)];
}

function trickCoinSet(o, cfg) {
  const n = o * 120;
  return [{x:4000+n,y:150,kind:'reverseRunner',speed:590+o*10,min:3860+n,max:4200+n},{x:10960+n,y:150,kind:'trapBait',baitX:12220+n,speed:440+o*10,min:10800+n,max:12300+n},{x:14980+n,y:230,kind:'shyVanish',safeSide:cfg.flip?'right':'left'},{x:19960+n,y:150,kind:'fakeRunner',min:19800+n,max:20300+n}];
}
