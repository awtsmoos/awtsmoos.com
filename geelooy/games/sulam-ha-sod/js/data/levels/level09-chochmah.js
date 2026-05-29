// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/** Chochmah: fast, broad, and still readable. */
export const level09 = L(
  '9 · Chochmah Flash Run', 5500, { x: 60, y: 420 }, P(5220, 260, 44, 90),
  'Chochmah is fast insight: commit, but still read the flash.',
  [
    P(0,505,500,35), P(580,445,190,20), P(850,385,190,20), P(1120,325,200,20),
    P(1400,265,210,20), P(1680,205,210,20), P(1960,285,215,20), P(2240,365,220,20),
    P(2520,305,220,20), P(2800,245,220,20), P(3090,185,230,20), P(3390,265,230,20),
    P(3710,335,240,20), P(4040,275,240,20), P(4380,215,250,20), P(4740,275,250,20),
    P(560,340,170,18), P(780,270,180,18), P(1000,200,190,18), P(1220,130,200,18),
    P(1440,60,210,18), P(1660,-10,220,18), P(1880,-80,230,18), P(2100,-150,240,18),
    P(1040,40,180,18), P(1040,-80,180,18), P(1040,-200,180,18), P(1040,-300,180,18)
  ],
  [R(520,425,76,14,1.1,180), R(2100,260,86,14,-1.3,210), R(3560,305,90,14,1.35,230)],
  [
    T(930,369,90,16,'booster',{dir:1,boost:660,lift:28}), T(1200,309,90,16,'ice',{duration:0.95}),
    T(1480,249,86,16,'falseSpike'), T(1780,189,92,16,'booster',{dir:1,boost:680,lift:24}),
    T(2140,269,86,16,'falseSpike'), T(2460,349,90,16,'phantom'), T(3120,169,90,16,'ice',{duration:1.0}),
    T(3560,249,92,16,'commitDrop',{reform:2.1}), T(4200,259,96,16,'phantom'), T(1700,-28,104,16,'safeSpike'), T(2860,229,104,16,'motionOnly',{speed:0.55}), T(3460,249,108,16,'baitShift',{shiftX:125,range:165,reset:1.75}), T(4820,259,110,16,'dodgePlatform',{slide:-120,range:155,panicTime:0.72}), T(2860,229,104,16,'motionOnly',{speed:0.55}), T(3460,249,108,16,'baitShift',{shiftX:125,range:165,reset:1.75}), T(4820,259,110,16,'dodgePlatform',{slide:-120,range:155,panicTime:0.72})
  ],
  [
    C(250,460), C(630,405), C(900,345,'dinar'), C(1175,285), C(1460,225,'sela'),
    C(1745,165), C(2020,245,'dinar'), C(2300,325), C(2580,265,'sela'), C(2860,205),
    C(3150,145,'dinar'), C(3450,225), C(3770,295,'sela'), C(4110,235), C(4450,175),
    C(4820,235,'maneh'), C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(4840,235,'dinar')],
  [
    S(410,481,76,22,1.6,1.2,2.9), S(1900,481,78,22,2.1,1.3,3.1),
    S(2740,481,78,22,2.4,1.4,3.2), S(4460,481,80,22,2.7,1.4,3.4),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:60,moveRate:2.2,period:3.3,duty:0.42,warning:1.05},
    {x:1920,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:1920,orbitY:-101,orbitRate:-1.8,period:3.5,duty:0.38,warning:1.1}
  ],
  [E(2300,331,2240,2460,96,'ayin','flash eye'), E(4020,241,4040,4280,100,'golem','slow certainty'), E(4820,241,4740,4990,115,'leaper','last flash')],
  [
    G(850,310,120,100,'Chochmah launches only toward a visible shelf.',{}),
    G(3000,160,140,120,'The flash is narrow but readable.',{}),
    G(3840,270,120,120,'Too much straight insight warns before teeth fall.',{spikes:[
      {x:3960,y:120,w:68,h:22,warning:1.15,duration:1.0,fallSpeed:240,safe:150,showDormant:true},
      {x:4050,y:150,w:70,h:22,warning:1.4,duration:1.0,fallSpeed:260,safe:150,showDormant:true}]}),
    G(4700,230,130,110,'Wisdom becomes the door only after one careful stop.',{openExit:true})
  ],
  ['Chochmah is the joy of no hesitation.','Every booster has a landing, if you trust the line.','The final insight is to slow down for one false platform.'],
  { fakeCoins:[F(1540,225,'sela','The insight coin was too sharp.'),F(4620,175,'dinar','The flash glittered like treasure, then stabbed.'), F(4860,235,'sela','The final flash-platform dodged if rushed.'), F(4860,235,'sela','The final flash-platform dodged if rushed.')], trickCoins:[{x:900,y:345,kind:'runner',speed:240,min:820,max:1180},{x:3600,y:225,kind:'iceRunner',speed:360,dir:1,min:3500,max:4100},{x:2865,y:205,kind:'runner',speed:230,min:2800,max:3060},{x:4825,y:235,kind:'trapBait',baitX:5000,speed:210,min:4740,max:5050},{x:2865,y:205,kind:'runner',speed:230,min:2800,max:3060},{x:4825,y:235,kind:'trapBait',baitX:5000,speed:210,min:4740,max:5050}] }
);
