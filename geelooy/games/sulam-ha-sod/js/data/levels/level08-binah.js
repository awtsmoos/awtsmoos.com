// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/** Binah: hidden floors, but never hidden body-space. */
export const level08 = L(
  '8 · Binah Womb of Hidden Floors', 5100, { x: 60, y: 420 }, P(4840, 260, 44, 90),
  'Binah hides structure until you test it; the test still has room to stand.',
  [
    P(0,505,500,35), P(580,445,190,20), P(850,385,190,20), P(1120,325,200,20),
    P(1400,265,210,20), P(1680,335,210,20), P(1960,395,215,20), P(2240,335,220,20),
    P(2520,275,220,20), P(2800,215,220,20), P(3090,275,230,20), P(3390,345,230,20),
    P(3710,285,240,20), P(4040,225,240,20), P(4380,285,250,20), P(560,340,170,18),
    P(780,270,180,18), P(1000,200,190,18), P(1220,130,200,18), P(1440,60,210,18),
    P(1660,-10,220,18), P(1880,-80,230,18), P(2100,-150,240,18), P(1040,40,180,18),
    P(1040,-80,180,18), P(1040,-200,180,18), P(1040,-300,180,18)
  ],
  [R(520,425,76,14,1.0,180), R(1840,370,84,14,-1.2,200), R(3240,315,88,14,1.3,220)],
  [
    T(930,369,90,16,'phantom'), T(1190,309,90,16,'ice',{duration:1.1}),
    T(1465,249,86,16,'falseSpike'), T(2260,319,92,16,'booster',{dir:1,boost:650,lift:30}),
    T(2580,259,92,16,'commitDrop',{reform:2.3}), T(2860,199,90,16,'vanish',{reform:1.7}),
    T(3500,329,96,16,'phantom'), T(4300,209,96,16,'booster',{dir:1,boost:670,lift:24}),
    T(1700,-28,104,16,'safeSpike'), T(3180,259,104,16,'baitShift',{shiftX:-120,range:165,reset:1.85}), T(3760,269,108,16,'dodgePlatform',{slide:120,range:155,panicTime:0.75}), T(4460,269,110,16,'oneWay'), T(3180,259,104,16,'baitShift',{shiftX:-120,range:165,reset:1.85}), T(3760,269,108,16,'dodgePlatform',{slide:120,range:155,panicTime:0.75}), T(4460,269,110,16,'oneWay')
  ],
  [
    C(250,460), C(630,405), C(900,345,'dinar'), C(1175,285), C(1460,225,'sela'),
    C(1745,295), C(2020,355,'dinar'), C(2300,295), C(2580,235,'sela'), C(2860,175),
    C(3150,235,'dinar'), C(3450,305), C(3770,245,'sela'), C(4110,185), C(4450,245,'maneh'),
    C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(4460,245,'dinar')],
  [
    S(410,481,76,22,1.7,1.3,3.0), S(1740,481,78,22,2.1,1.4,3.2),
    S(2550,251,66,22,2.4,1.4,3.2), S(4380,481,80,22,2.7,1.4,3.5),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:60,moveRate:2.1,period:3.4,duty:0.42,warning:1.05},
    {x:1920,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:1920,orbitY:-101,orbitRate:1.7,period:3.6,duty:0.38,warning:1.1}
  ],
  [E(2300,301,2240,2460,92,'gravity','understanding beast'), E(4140,191,4040,4280,100,'watcher','hidden watcher')],
  [
    G(920,300,120,110,'Binah shows a floor, but the next landing is real.',{}),
    G(2240,270,130,100,'The push is aimed at a visible shelf. Jump late.',{}),
    G(3340,250,120,120,'The absent floor warns before ceiling teeth fall.',{spikes:[
      {x:3460,y:120,w:68,h:22,warning:1.15,duration:1.0,fallSpeed:230,safe:150,showDormant:true},
      {x:3550,y:150,w:70,h:22,warning:1.4,duration:1.0,fallSpeed:250,safe:150,showDormant:true}]}),
    G(4300,220,130,120,'Understanding becomes a door.',{openExit:true})
  ],
  ['Binah makes absence visible.','Phantom floors teach distrust without clutter.','The real path is the high thought, not the low coin line.'],
  { fakeCoins:[F(1580,225,'sela','Binah asked: was that coin born yet?'),F(3650,305,'dinar','The hidden coin bit back.'), F(4470,245,'sela','The final visible floor lied only if chased.'), F(4470,245,'sela','The final visible floor lied only if chased.')], trickCoins:[{x:2420,y:295,kind:'shyVanish',safeSide:'left'},{x:3185,y:235,kind:'trapBait',baitX:3420,speed:185,min:3090,max:3480},{x:3765,y:245,kind:'reverseRunner',speed:220,min:3710,max:3950}] }
);
