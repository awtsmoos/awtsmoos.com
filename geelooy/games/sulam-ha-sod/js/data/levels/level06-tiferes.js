// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Tiferes: broad balance shelves, visible sky path, and humane symmetry.
 *
 * Chapter 6: The Awtsmoos balances beauty against betrayal. The prism still
 * tests timing and distrust, but each landing receives enough width for a human
 * correction before the next glittering argument begins.
 */
export const level06 = L(
  '6 · Tiferes Balance Prism', 4300, { x: 60, y: 420 }, P(4020, 300, 44, 90),
  'Tiferes balances beauty against betrayal: symmetry is bait, spacing is mercy.',
  [
    P(0,505,500,35), P(580,445,205,20), P(850,385,205,20), P(1120,325,215,20),
    P(1390,265,225,20), P(1660,335,225,20), P(1940,395,230,20), P(2220,335,235,20),
    P(2500,275,235,20), P(2780,335,235,20), P(3060,395,240,20), P(3360,335,245,20),
    P(3660,300,255,20), P(550,346,205,18), P(765,280,215,18), P(985,214,225,18),
    P(1205,148,235,18), P(1425,82,245,18), P(1645,20,255,18), P(1698,-20,190,18),
    P(1888,-215,190,18), P(2078,-305,190,18), P(1870,-40,260,18), P(2090,-98,270,18),
    P(1040,44,195,18), P(1040,-64,195,18), P(1040,-172,195,18), P(1040,-270,195,18)
  ],
  [R(520,425,76,14,0.9,170), R(1840,370,84,14,-1.05,185), R(3200,370,88,14,1.05,190)],
  [
    T(930,369,86,16,'ice',{duration:0.9}), T(1180,309,90,16,'falseSpike'),
    T(1450,249,92,16,'booster',{dir:1,boost:540,lift:26}), T(2300,319,86,16,'phantom'),
    T(2580,259,92,16,'vanish',{reform:2.0}), T(3180,379,96,16,'reverseBooster',{dir:1,boost:540,lift:18}),
    T(1756,2,92,16,'safeSpike'), T(1980,-78,104,16,'commitDrop',{reform:2.3}),
    T(2860,319,104,16,'baitShift',{shiftX:100,range:150,reset:2.0}),
    T(3460,319,104,16,'dodgePlatform',{slide:-95,range:140,panicTime:0.82}), T(3700,284,110,16,'oneWay')
  ],
  [
    C(250,460), C(630,405), C(900,345,'dinar'), C(1175,285,'sela'), C(1450,225),
    C(1725,295,'dinar'), C(2000,355,'sela'), C(2280,295), C(2560,235,'sela'),
    C(2840,295), C(3125,355,'dinar'), C(3420,295), C(3720,260,'maneh'),
    C(825,238), C(1275,106,'sela'), C(1724,-16,'dinar')
  ],
  [C(3740,260,'dinar')],
  [
    S(410,481,70,22,1.9,1.3,3.1), S(1730,481,72,22,2.2,1.4,3.3),
    S(2550,251,62,22,2.5,1.4,3.3), S(3340,481,74,22,2.8,1.4,3.6),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:56,moveRate:1.9,period:3.6,duty:0.38,warning:1.15},
    {x:2045,y:-150,w:30,h:30,cycle:true,showDormant:true,orbitR:36,orbitX:2045,orbitY:-126,orbitRate:1.05,period:4.2,duty:0.34,warning:1.35}
  ],
  [E(2000,361,1940,2150,75,'ayin','balance eye'), E(3120,361,3060,3290,88,'leaper','prism leaper')],
  [
    G(1040,250,120,105,'Tiferes: the beautiful route still has a broad landing.',{}),
    G(1660,80,120,120,'The high prism path is optional and visible.',{}),
    G(2800,245,120,120,'The centered route warns before teeth fall.',{spikes:[
      {x:2920,y:110,w:64,h:22,warning:1.25,duration:1.0,fallSpeed:210,safe:160,showDormant:true},
      {x:3010,y:140,w:66,h:22,warning:1.45,duration:1.0,fallSpeed:220,safe:160,showDormant:true}]}),
    G(3620,260,130,120,'The prism accepts a balanced route.',{openExit:true})
  ],
  ['Tiferes is readable beauty.','The false platform looks honest on purpose.','Balance means stopping before the boost finishes speaking.'],
  { fakeCoins:[F(1230,285,'sela','Beauty wore a spike-mask.'), F(3185,355,'dinar','The bright coin snapped shut.'), F(3520,295,'sela','The balanced fake waited on a dodging shelf.')], trickCoins:[{x:2470,y:235,kind:'shyVanish',safeSide:'right'},{x:2865,y:295,kind:'trapBait',baitX:3100,speed:160,min:2780,max:3180},{x:3465,y:295,kind:'runner',speed:185,min:3360,max:3600}] }
);
