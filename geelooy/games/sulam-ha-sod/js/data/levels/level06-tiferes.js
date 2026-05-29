// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/** Tiferes: broad balance shelves, visible sky path, and a hand-made side ladder to the high enriched coin. */
export const level06 = L(
  '6 · Tiferes Balance Prism', 4300, { x: 60, y: 420 }, P(4020, 300, 44, 90),
  'Tiferes balances beauty against betrayal: symmetry is bait, spacing is mercy.',
  [
    P(0,505,500,35), P(580,445,190,20), P(850,385,190,20), P(1120,325,200,20),
    P(1390,265,210,20), P(1660,335,210,20), P(1940,395,215,20), P(2220,335,220,20),
    P(2500,275,220,20), P(2780,335,220,20), P(3060,395,230,20), P(3360,335,230,20),
    P(3660,300,240,20), P(560,340,170,18), P(780,270,180,18), P(1000,200,190,18),
    P(1220,130,200,18), P(1440,60,210,18), P(1660,-10,220,18), P(1880,-80,230,18),
    P(2100,-150,240,18), P(1040,40,180,18), P(1040,-80,180,18), P(1040,-200,180,18),
    P(1040,-300,180,18)
  ],
  [R(520,425,76,14,1.0,180), R(1840,370,84,14,-1.2,200), R(3200,370,88,14,1.2,210)],
  [
    T(930,369,86,16,'ice',{duration:1.0}), T(1180,309,90,16,'falseSpike'),
    T(1450,249,92,16,'booster',{dir:1,boost:620,lift:28}), T(2300,319,86,16,'phantom'),
    T(2580,259,92,16,'vanish',{reform:2.0}), T(3180,379,96,16,'reverseBooster',{dir:1,boost:620,lift:20}),
    T(1700,-28,104,16,'safeSpike'), T(1980,-98,104,16,'commitDrop',{reform:2.3}), T(2860,319,104,16,'baitShift',{shiftX:120,range:160,reset:1.8}), T(3460,319,104,16,'dodgePlatform',{slide:-115,range:150,panicTime:0.72}), T(3700,284,110,16,'oneWay'), T(2860,319,104,16,'baitShift',{shiftX:120,range:160,reset:1.8}), T(3460,319,104,16,'dodgePlatform',{slide:-115,range:150,panicTime:0.72}), T(3700,284,110,16,'oneWay')
  ],
  [
    C(250,460), C(630,405), C(900,345,'dinar'), C(1175,285,'sela'), C(1450,225),
    C(1725,295,'dinar'), C(2000,355,'sela'), C(2280,295), C(2560,235,'sela'),
    C(2840,295), C(3125,355,'dinar'), C(3420,295), C(3720,260,'maneh'),
    C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(3740,260,'dinar')],
  [
    S(410,481,76,22,1.8,1.3,3.0), S(1730,481,78,22,2.1,1.4,3.2),
    S(2550,251,66,22,2.4,1.4,3.2), S(3340,481,80,22,2.7,1.4,3.5),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:60,moveRate:2.1,period:3.4,duty:0.42,warning:1.05},
    {x:1920,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:1920,orbitY:-101,orbitRate:1.7,period:3.6,duty:0.38,warning:1.1}
  ],
  [E(2000,361,1940,2150,80,'ayin','balance eye'), E(3120,361,3060,3290,96,'leaper','prism leaper')],
  [
    G(1040,250,120,105,'Tiferes: the beautiful route still has a broad landing.',{}),
    G(1660,80,120,120,'The high prism path is optional and visible.',{}),
    G(2800,245,120,120,'The centered route warns before teeth fall.',{spikes:[
      {x:2920,y:110,w:68,h:22,warning:1.15,duration:1.0,fallSpeed:230,safe:150,showDormant:true},
      {x:3010,y:140,w:70,h:22,warning:1.4,duration:1.0,fallSpeed:250,safe:150,showDormant:true}]}),
    G(3620,260,130,120,'The prism accepts a balanced route.',{openExit:true})
  ],
  ['Tiferes is readable beauty.','The false platform looks honest on purpose.','Balance means stopping before the boost finishes speaking.'],
  { fakeCoins:[F(1230,285,'sela','Beauty wore a spike-mask.'), F(3185,355,'dinar','The bright coin snapped shut.'), F(3520,295,'sela','The balanced fake waited on a dodging shelf.'), F(3520,295,'sela','The balanced fake waited on a dodging shelf.')], trickCoins:[{x:2470,y:235,kind:'shyVanish',safeSide:'right'},{x:2865,y:295,kind:'trapBait',baitX:3100,speed:180,min:2780,max:3180},{x:3465,y:295,kind:'runner',speed:210,min:3360,max:3600}] }
);
