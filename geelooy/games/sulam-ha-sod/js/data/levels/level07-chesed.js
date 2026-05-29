// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Chesed: generous spacing, brakeable boosts, and a hand-made upper side ladder.
 *
 * Chapter 7: The Awtsmoos pours kindness like glass-water through the chamber.
 * The flood still shoves, shines, and deceives, but the blessings now arrive on
 * ledges wide enough for choice instead of panic.
 */
export const level07 = L(
  '7 · Chesed Flood of Glass', 4700, { x: 60, y: 420 }, P(4440, 300, 44, 90),
  'Chesed overflows; too much kindness becomes slippery, but never unreadable.',
  [
    P(0,505,500,35), P(580,445,205,20), P(850,385,205,20), P(1120,325,215,20),
    P(1400,265,225,20), P(1680,335,225,20), P(1960,395,230,20), P(2240,335,235,20),
    P(2520,275,235,20), P(2800,215,235,20), P(3090,295,240,20), P(3390,365,245,20),
    P(3710,305,255,20), P(4040,345,255,20), P(550,346,205,18), P(765,280,215,18),
    P(985,214,225,18), P(1205,148,235,18), P(1425,82,245,18), P(1645,20,255,18),
    P(1698,-20,190,18), P(1888,-215,190,18), P(2078,-305,190,18), P(1870,-40,260,18),
    P(2090,-98,270,18), P(1040,44,195,18), P(1040,-64,195,18), P(1040,-172,195,18),
    P(1040,-270,195,18)
  ],
  [R(520,425,76,14,0.9,170), R(1840,370,84,14,-1.05,185), R(3240,335,88,14,1.1,195)],
  [
    T(930,369,90,16,'ice',{duration:1.0}), T(1190,309,92,16,'booster',{dir:1,boost:560,lift:28}),
    T(1465,249,86,16,'falseSpike'), T(2300,319,90,16,'ice',{duration:1.0}),
    T(2580,259,92,16,'commitDrop',{reform:2.3}), T(2860,199,90,16,'phantom'),
    T(3500,349,96,16,'booster',{dir:1,boost:560,lift:22}), T(1756,2,92,16,'safeSpike'),
    T(3160,279,108,16,'magnet',{pull:0.42}), T(3450,349,106,16,'antiSpeed',{duration:1.05}),
    T(3820,289,110,16,'oneWay')
  ],
  [
    C(250,460), C(630,405), C(900,345,'dinar'), C(1175,285), C(1460,225,'sela'),
    C(1745,295), C(2020,355,'dinar'), C(2300,295), C(2580,235,'sela'), C(2860,175),
    C(3150,255,'dinar'), C(3450,325), C(3770,265,'sela'), C(4110,305,'maneh'),
    C(825,238), C(1275,106,'sela'), C(1724,-16,'dinar')
  ],
  [C(4120,305,'dinar')],
  [
    S(410,481,70,22,1.9,1.3,3.1), S(1740,481,72,22,2.2,1.4,3.3),
    S(2550,251,62,22,2.5,1.4,3.3), S(4020,481,74,22,2.8,1.4,3.6),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:56,moveRate:1.9,period:3.6,duty:0.38,warning:1.15},
    {x:2045,y:-150,w:30,h:30,cycle:true,showDormant:true,orbitR:36,orbitX:2045,orbitY:-126,orbitRate:-1.05,period:4.2,duty:0.34,warning:1.35}
  ],
  [E(2020,361,1960,2170,78,'gilgul','overflow echo'), E(3420,331,3390,3620,90,'herder','kind shove')],
  [
    G(1100,250,120,105,'Chesed pushes, but the landing is visible.',{}),
    G(2300,260,120,115,'Too much gift warns before judgment falls.',{spikes:[
      {x:2440,y:110,w:64,h:22,warning:1.25,duration:1.0,fallSpeed:210,safe:160,showDormant:true},
      {x:2530,y:140,w:66,h:22,warning:1.45,duration:1.0,fallSpeed:220,safe:160,showDormant:true}]}),
    G(3980,285,130,120,'The flood becomes a door when you brake.',{openExit:true})
  ],
  ['Chesed gives more ground than you can control.','Generosity can shove you into judgment.','The correct mercy is to stop before the gift finishes sliding.'],
  { fakeCoins:[F(1530,225,'sela','The kind coin was hiding a thorn.'),F(3560,325,'dinar','Too much gift became teeth.'),F(3830,265,'sela','The one-way gift was optional.')], trickCoins:[{x:2060,y:355,kind:'reverseRunner',speed:260,min:1960,max:2220},{x:3170,y:255,kind:'shyVanish',safeSide:'left'},{x:3460,y:325,kind:'trapBait',baitX:3680,speed:165,min:3390,max:3710}] }
);
