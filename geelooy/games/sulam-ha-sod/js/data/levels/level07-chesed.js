// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/** Chesed: generous spacing, brakeable boosts, and a hand-made upper side ladder. */
export const level07 = L(
  '7 · Chesed Flood of Glass', 4700, { x: 60, y: 420 }, P(4440, 300, 44, 90),
  'Chesed overflows; too much kindness becomes slippery, but never unreadable.',
  [
    P(0,505,500,35), P(580,445,190,20), P(850,385,190,20), P(1120,325,200,20),
    P(1400,265,210,20), P(1680,335,210,20), P(1960,395,215,20), P(2240,335,220,20),
    P(2520,275,220,20), P(2800,215,220,20), P(3090,295,230,20), P(3390,365,230,20),
    P(3710,305,240,20), P(4040,345,240,20), P(560,340,170,18), P(780,270,180,18),
    P(1000,200,190,18), P(1220,130,200,18), P(1440,60,210,18), P(1660,-10,220,18),
    P(1880,-80,230,18), P(2100,-150,240,18), P(1040,40,180,18), P(1040,-80,180,18),
    P(1040,-200,180,18), P(1040,-300,180,18)
  ],
  [R(520,425,76,14,1.0,180), R(1840,370,84,14,-1.2,200), R(3240,335,88,14,1.3,220)],
  [
    T(930,369,90,16,'ice',{duration:1.25}), T(1190,309,92,16,'booster',{dir:1,boost:650,lift:30}),
    T(1465,249,86,16,'falseSpike'), T(2300,319,90,16,'ice',{duration:1.15}),
    T(2580,259,92,16,'commitDrop',{reform:2.3}), T(2860,199,90,16,'phantom'),
    T(3500,349,96,16,'booster',{dir:1,boost:650,lift:24}), T(1700,-28,104,16,'safeSpike'), T(3160,279,108,16,'magnet',{pull:0.55}), T(3450,349,106,16,'antiSpeed',{duration:0.95}), T(3820,289,110,16,'oneWay'), T(3160,279,108,16,'magnet',{pull:0.55}), T(3450,349,106,16,'antiSpeed',{duration:0.95}), T(3820,289,110,16,'oneWay')
  ],
  [
    C(250,460), C(630,405), C(900,345,'dinar'), C(1175,285), C(1460,225,'sela'),
    C(1745,295), C(2020,355,'dinar'), C(2300,295), C(2580,235,'sela'), C(2860,175),
    C(3150,255,'dinar'), C(3450,325), C(3770,265,'sela'), C(4110,305,'maneh'),
    C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(4120,305,'dinar')],
  [
    S(410,481,76,22,1.7,1.3,3.0), S(1740,481,78,22,2.1,1.4,3.2),
    S(2550,251,66,22,2.4,1.4,3.2), S(4020,481,80,22,2.7,1.4,3.5),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:60,moveRate:2.1,period:3.4,duty:0.42,warning:1.05},
    {x:1920,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:1920,orbitY:-101,orbitRate:-1.7,period:3.6,duty:0.38,warning:1.1}
  ],
  [E(2020,361,1960,2170,86,'gilgul','overflow echo'), E(3420,331,3390,3620,100,'herder','kind shove')],
  [
    G(1100,250,120,105,'Chesed pushes, but the landing is visible.',{}),
    G(2300,260,120,115,'Too much gift warns before judgment falls.',{spikes:[
      {x:2440,y:110,w:68,h:22,warning:1.15,duration:1.0,fallSpeed:230,safe:150,showDormant:true},
      {x:2530,y:140,w:70,h:22,warning:1.4,duration:1.0,fallSpeed:250,safe:150,showDormant:true}]}),
    G(3980,285,130,120,'The flood becomes a door when you brake.',{openExit:true})
  ],
  ['Chesed gives more ground than you can control.','Generosity can shove you into judgment.','The correct mercy is to stop before the gift finishes sliding.'],
  { fakeCoins:[F(1530,225,'sela','The kind coin was hiding a thorn.'),F(3560,325,'dinar','Too much gift became teeth.'), F(3830,265,'sela','The one-way gift was optional.'), F(3830,265,'sela','The one-way gift was optional.')], trickCoins:[{x:2060,y:355,kind:'reverseRunner',speed:300,min:1960,max:2220},{x:3170,y:255,kind:'shyVanish',safeSide:'left'},{x:3460,y:325,kind:'trapBait',baitX:3680,speed:190,min:3390,max:3710}] }
);
