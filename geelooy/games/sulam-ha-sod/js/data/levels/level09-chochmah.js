// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Chochmah: fast, broad, and still readable.
 *
 * Chapter 9: The Awtsmoos flashes wisdom across the screen. The run remains
 * quick, but duplicated illusions are removed and every burst of speed now aims
 * at a shelf a human eye can name before the body lands.
 */
export const level09 = L(
  '9 · Chochmah Flash Run', 5500, { x: 60, y: 420 }, P(5220, 260, 44, 90),
  'Chochmah is fast insight: commit, but still read the flash.',
  [
    P(0,505,500,35), P(580,445,205,20), P(850,385,205,20), P(1120,325,215,20),
    P(1400,265,225,20), P(1680,205,225,20), P(1960,285,230,20), P(2240,365,235,20),
    P(2520,305,235,20), P(2800,245,235,20), P(3090,185,240,20), P(3390,265,245,20),
    P(3710,335,255,20), P(4040,275,255,20), P(4380,215,260,20), P(4740,275,260,20),
    P(550,346,205,18), P(765,280,215,18), P(985,214,225,18), P(1205,148,235,18),
    P(1425,82,245,18), P(1645,20,255,18), P(1698,-20,190,18), P(1888,-215,190,18),
    P(2078,-305,190,18), P(1870,-40,260,18), P(2090,-98,270,18), P(1040,44,195,18),
    P(1040,-64,195,18), P(1040,-172,195,18), P(1040,-270,195,18)
  ],
  [R(520,425,76,14,0.95,170), R(2100,260,86,14,-1.1,195), R(3560,305,90,14,1.15,205)],
  [
    T(930,369,90,16,'booster',{dir:1,boost:580,lift:26}), T(1200,309,90,16,'ice',{duration:0.9}),
    T(1480,249,86,16,'falseSpike'), T(1780,189,92,16,'booster',{dir:1,boost:600,lift:22}),
    T(2140,269,86,16,'falseSpike'), T(2460,349,90,16,'phantom'), T(3120,169,90,16,'ice',{duration:0.9}),
    T(3560,249,92,16,'commitDrop',{reform:2.1}), T(4200,259,96,16,'phantom'), T(1756,2,92,16,'safeSpike'),
    T(2860,229,104,16,'motionOnly',{speed:0.45}), T(3460,249,108,16,'baitShift',{shiftX:105,range:150,reset:1.95}),
    T(4820,259,110,16,'dodgePlatform',{slide:-95,range:140,panicTime:0.82})
  ],
  [
    C(250,460), C(630,405), C(900,345,'dinar'), C(1175,285), C(1460,225,'sela'),
    C(1745,165), C(2020,245,'dinar'), C(2300,325), C(2580,265,'sela'), C(2860,205),
    C(3150,145,'dinar'), C(3450,225), C(3770,295,'sela'), C(4110,235), C(4450,175),
    C(4820,235,'maneh'), C(825,238), C(1275,106,'sela'), C(1724,-16,'dinar')
  ],
  [C(4840,235,'dinar')],
  [
    S(410,481,70,22,1.8,1.2,3.0), S(1900,481,72,22,2.2,1.3,3.2),
    S(2740,481,72,22,2.5,1.4,3.3), S(4460,481,74,22,2.8,1.4,3.5),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:56,moveRate:1.95,period:3.5,duty:0.38,warning:1.15},
    {x:2045,y:-150,w:30,h:30,cycle:true,showDormant:true,orbitR:36,orbitX:2045,orbitY:-126,orbitRate:-1.05,period:4.2,duty:0.34,warning:1.35}
  ],
  [E(2300,331,2240,2460,86,'ayin','flash eye'), E(4020,241,4040,4280,90,'golem','slow certainty'), E(4820,241,4740,4990,100,'leaper','last flash')],
  [
    G(850,310,120,100,'Chochmah launches only toward a visible shelf.',{}),
    G(3000,160,140,120,'The flash is narrow but readable.',{}),
    G(3840,270,120,120,'Too much straight insight warns before teeth fall.',{spikes:[
      {x:3960,y:120,w:64,h:22,warning:1.25,duration:1.0,fallSpeed:215,safe:160,showDormant:true},
      {x:4050,y:150,w:66,h:22,warning:1.45,duration:1.0,fallSpeed:230,safe:160,showDormant:true}]}),
    G(4700,230,130,110,'Wisdom becomes the door only after one careful stop.',{openExit:true})
  ],
  ['Chochmah is the joy of no hesitation.','Every booster has a landing, if you trust the line.','The final insight is to slow down for one false platform.'],
  { fakeCoins:[F(1540,225,'sela','The insight coin was too sharp.'),F(4620,175,'dinar','The flash glittered like treasure, then stabbed.'),F(4860,235,'sela','The final flash-platform dodged if rushed.')], trickCoins:[{x:900,y:345,kind:'runner',speed:210,min:820,max:1180},{x:3600,y:225,kind:'iceRunner',speed:300,dir:1,min:3500,max:4100},{x:2865,y:205,kind:'runner',speed:200,min:2800,max:3060},{x:4825,y:235,kind:'trapBait',baitX:5000,speed:180,min:4740,max:5050}] }
);
