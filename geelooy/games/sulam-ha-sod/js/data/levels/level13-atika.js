// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/** Atika Ancient Boost Spiral: old momentum, clear shelves. */
export const level13 = L(
  '13 · Atika Ancient Boost Spiral',
  7600,
  { x: 60, y: 420 },
  P(7300, 210, 44, 90),
  'Atika is old momentum returning from before the jump.',
  [
    P(0,505,520,35), P(620,445,190,20), P(900,385,195,20), P(1180,325,200,20),
    P(1460,265,210,20), P(1760,205,210,20), P(2060,285,220,20), P(2360,365,220,20),
    P(2660,425,230,20), P(2980,365,230,20), P(3300,305,230,20), P(3620,245,240,20),
    P(3960,185,240,20), P(4320,255,250,20), P(4680,325,250,20), P(5060,265,260,20),
    P(5440,205,260,20), P(5840,275,270,20), P(6260,335,280,20), P(6700,275,280,20), P(7000,215,260,20), P(7000,215,260,20),
    P(560,340,170,18), P(780,270,180,18), P(1000,200,190,18), P(1220,130,200,18),
    P(1440,60,210,18), P(1660,-10,220,18), P(1880,-80,230,18), P(2100,-150,240,18),
    P(1040,40,180,18), P(1040,-80,180,18), P(1040,-200,180,18), P(1040,-300,180,18), P(2770,-430,230,18), P(3030,-195,230,18), P(3230,-270,230,18), P(3300,-350,230,18), P(4060,-430,260,18), P(4300,-585,260,18), P(2600,105,2300,18), P(2600,-25,2300,18), P(2600,-155,2300,18), P(2600,-285,2300,18), P(2600,-415,2300,18), P(4000,-545,900,18), P(2600,105,2300,18), P(2600,-25,2300,18), P(2600,-155,2300,18), P(2600,-285,2300,18), P(2600,-415,2300,18), P(4000,-545,900,18), P(2770,-430,230,18), P(3030,-195,230,18), P(3230,-270,230,18), P(3300,-350,230,18), P(4060,-430,260,18), P(4300,-585,260,18)
  ],
  [R(540,425,80,14,1.0,180), R(2240,340,88,14,-1.25,210), R(3840,260,92,14,1.3,230), R(6040,300,96,14,-1.35,240)],
  [
    T(1010,369,92,16,'ice',{duration:1.25}), T(1300,309,96,16,'booster',{dir:1,boost:720,lift:32}),
    T(1580,249,98,16,'falseSpike'), T(1880,189,98,16,'phantom'), T(2480,349,104,16,'booster',{dir:1,boost:760,lift:34}),
    T(2780,409,104,16,'commitDrop',{reform:2.0}), T(3380,289,104,16,'ice',{duration:1.25}),
    T(4020,169,106,16,'baitShift',{shiftX:-125,range:170,reset:1.8}), T(4740,309,108,16,'reverseBooster',{dir:1,boost:720,lift:18}),
    T(5220,249,110,16,'phantom'), T(5900,259,112,16,'dodgePlatform',{slide:120,range:165,panicTime:0.75}),
    T(6740,259,116,16,'safeSpike')
  ],
  [
    C(260,460), C(675,405), C(955,345,'dinar'), C(1235,285), C(1515,225,'sela'),
    C(1815,165), C(2120,245,'dinar'), C(2420,325), C(2725,385,'sela'), C(3040,325),
    C(3360,265,'dinar'), C(3680,205), C(4020,145,'sela'), C(4380,215), C(4740,285),
    C(5120,225,'sela'), C(5500,165), C(5900,235,'dinar'), C(6320,295), C(6760,235,'maneh'),
    C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(6820,235,'dinar')],
  [
    S(420,481,76,22,1.6,1.2,2.9), S(1900,481,80,22,2.1,1.3,3.1), S(3100,481,82,22,2.4,1.4,3.2), S(4580,481,86,22,2.7,1.4,3.3),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:62,moveRate:2.2,period:3.3,duty:0.42,warning:1.05},
    {x:2140,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:2140,orbitY:-101,orbitRate:-1.8,period:3.5,duty:0.38,warning:1.1}
  ],
  [E(2420,331,2360,2580,92,'scroll','ancient scroll'), E(4380,221,4320,4570,108,'golem','old shell'), E(6760,241,6700,6980,120,'watcher','old eye')],
  [
    G(1300,280,130,110,'Atika remembers the first shove.',{}),
    G(4020,140,140,120,'The old bait shelf moves after you commit.',{}),
    G(5840,230,130,120,'The spiral drops teeth after visible warning.',{spikes:[
      {x:5980,y:105,w:68,h:22,warning:1.2,duration:1.0,fallSpeed:235,safe:150,showDormant:true},
      {x:6070,y:135,w:70,h:22,warning:1.45,duration:1.0,fallSpeed:255,safe:150,showDormant:true}]}),
    G(6680,235,150,120,'The ancient spiral opens.',{openExit:true})
  ],
  ['Atika is momentum with memory.','Every ancient shove has a landing.','The all-coin path requires braking, not guessing.'],
  { fakeCoins:[F(1340,285,'sela','The ancient coin remembered teeth.'),F(4800,285,'dinar','The reverse boost wore gold.'),F(5960,235,'maneh','The old crown was a spike fossil.')], trickCoins:[{x:2485,y:325,kind:'trapBait',baitX:2740,speed:190,min:2360,max:2820},{x:4025,y:145,kind:'panicRunner',speed:240,min:3960,max:4320},{x:5905,y:235,kind:'reverseRunner',speed:230,min:5840,max:6260}] }
);
