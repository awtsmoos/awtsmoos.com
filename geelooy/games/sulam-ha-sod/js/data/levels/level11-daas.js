// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/** Daas Hidden Line: phantom knowledge with visible spacing. */
export const level11 = L(
  '11 · Daas Hidden Line',
  6600,
  { x: 60, y: 420 },
  P(6300, 230, 44, 90),
  'Daas is the missing floor made readable.',
  [
    P(0,505,520,35), P(620,445,190,20), P(900,385,195,20), P(1180,325,200,20),
    P(1460,265,210,20), P(1760,205,210,20), P(2060,285,220,20), P(2360,365,220,20),
    P(2660,305,230,20), P(2960,245,230,20), P(3280,185,230,20), P(3600,265,240,20),
    P(3940,335,240,20), P(4300,275,250,20), P(4660,215,250,20), P(5040,285,260,20),
    P(5420,345,260,20), P(5800,275,270,20), P(560,340,170,18), P(780,270,180,18),
    P(1000,200,190,18), P(1220,130,200,18), P(1440,60,210,18), P(1660,-10,220,18),
    P(1880,-80,230,18), P(2100,-150,240,18), P(1040,40,180,18), P(1040,-80,180,18),
    P(1040,-200,180,18), P(1040,-300,180,18)
  ],
  [R(540,425,80,14,1.0,180), R(2240,340,88,14,-1.25,210), R(3840,300,92,14,1.3,230), R(5600,320,96,14,-1.35,240)],
  [
    T(1010,369,92,16,'phantom'), T(1300,309,96,16,'falseSpike'), T(1580,249,98,16,'ice',{duration:1.15}),
    T(1880,189,98,16,'booster',{dir:1,boost:680,lift:30}), T(2480,349,104,16,'baitShift',{shiftX:-120,range:165,reset:1.8}),
    T(2780,289,104,16,'oneWay'), T(3380,169,104,16,'dodgePlatform',{slide:120,range:160,panicTime:0.75}),
    T(4020,319,106,16,'magnet',{pull:0.55}), T(4740,199,108,16,'phantom'), T(5220,269,110,16,'antiSpeed',{duration:0.95})
  ],
  [
    C(260,460), C(675,405), C(955,345,'dinar'), C(1235,285), C(1515,225,'sela'),
    C(1815,165), C(2120,245,'dinar'), C(2420,325), C(2725,265,'sela'), C(3020,205),
    C(3340,145,'dinar'), C(3660,225), C(4000,295,'sela'), C(4360,235), C(4720,175),
    C(5100,245,'sela'), C(5480,305), C(5860,235,'maneh'), C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(5920,235,'dinar')],
  [
    S(420,481,76,22,1.6,1.2,2.9), S(1900,481,80,22,2.1,1.3,3.1), S(3100,481,82,22,2.4,1.4,3.2), S(4580,481,86,22,2.7,1.4,3.3),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:62,moveRate:2.2,period:3.3,duty:0.42,warning:1.05},
    {x:2140,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:2140,orbitY:-101,orbitRate:-1.8,period:3.5,duty:0.38,warning:1.1}
  ],
  [E(2420,331,2360,2580,92,'ayin','knowing eye'), E(4360,241,4300,4550,108,'golem','silent proof'), E(5860,241,5800,6070,120,'herder','line shepherd')],
  [
    G(1000,300,130,110,'Daas: phantom is information, not permission.',{}),
    G(3380,140,140,120,'The hidden line is optional but collectible.',{}),
    G(5040,240,130,120,'The proof drops teeth after warning.',{spikes:[
      {x:5180,y:105,w:68,h:22,warning:1.2,duration:1.0,fallSpeed:230,safe:150,showDormant:true},
      {x:5270,y:135,w:70,h:22,warning:1.45,duration:1.0,fallSpeed:250,safe:150,showDormant:true}]}),
    G(5780,230,150,120,'Knowledge opens by refusing the fake line.',{openExit:true})
  ],
  ['Daas hides a line but leaves a route.','The fake rectangle is a question.','The all-coin path is a patient path.'],
  { fakeCoins:[F(1340,285,'sela','Knowledge glittered falsely.'),F(4060,295,'dinar','The magnetic proof was bait.'),F(5260,245,'maneh','The last proof wore gold teeth.')], trickCoins:[{x:2485,y:325,kind:'trapBait',baitX:2740,speed:190,min:2360,max:2820},{x:3385,y:145,kind:'runner',speed:230,min:3280,max:3600},{x:5225,y:245,kind:'shyVanish',safeSide:'right'}] }
);
