// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Atika Ancient Boost Spiral: old momentum, clear shelves.
 *
 * Chapter 13: The Awtsmoos remembers a shove before the player was born. The
 * ancient route remains severe, but duplicate sky-bands are dissolved and the
 * spiral becomes one readable memory instead of two overlapping ghosts.
 */
export const level13 = L(
  '13 · Atika Ancient Boost Spiral',
  7600,
  { x: 60, y: 420 },
  P(7300, 210, 44, 90),
  'Atika is old momentum returning from before the jump.',
  [
    P(0,505,520,35), P(620,445,205,20), P(900,385,210,20), P(1180,325,215,20),
    P(1460,265,225,20), P(1760,205,225,20), P(2060,285,235,20), P(2360,365,235,20),
    P(2660,425,240,20), P(2980,365,240,20), P(3300,305,245,20), P(3620,245,255,20),
    P(3960,185,255,20), P(4320,255,265,20), P(4680,325,265,20), P(5060,265,275,20),
    P(5440,205,275,20), P(5840,275,285,20), P(6260,335,290,20), P(6700,275,290,20),
    P(7000,215,280,20), P(550,346,205,18), P(765,280,215,18), P(985,214,225,18),
    P(1205,148,235,18), P(1425,82,245,18), P(1645,20,255,18), P(1698,-20,190,18),
    P(1888,-215,190,18), P(2078,-305,190,18), P(1870,-40,260,18), P(2090,-98,270,18),
    P(1040,44,195,18), P(1040,-64,195,18), P(1040,-172,195,18), P(1040,-270,195,18),
    P(2770,-430,230,18), P(3030,-195,230,18), P(3230,-270,230,18), P(3300,-350,230,18),
    P(4060,-430,260,18), P(4300,-585,260,18), P(2600,105,2300,18), P(2600,-25,2300,18),
    P(2600,-155,2300,18), P(2600,-285,2300,18), P(2600,-415,2300,18), P(4000,-545,900,18)
  ],
  [R(540,425,80,14,0.9,170), R(2240,340,88,14,-1.1,195), R(3840,260,92,14,1.15,205), R(6040,300,96,14,-1.18,215)],
  [
    T(1010,369,92,16,'ice',{duration:1.05}), T(1300,309,96,16,'booster',{dir:1,boost:620,lift:28}),
    T(1580,249,98,16,'falseSpike'), T(1880,189,98,16,'phantom'), T(2480,349,104,16,'booster',{dir:1,boost:650,lift:30}),
    T(2780,409,104,16,'commitDrop',{reform:2.0}), T(3380,289,104,16,'ice',{duration:1.05}),
    T(4020,169,106,16,'baitShift',{shiftX:-105,range:155,reset:2.0}), T(4740,309,108,16,'reverseBooster',{dir:1,boost:620,lift:16}),
    T(5220,249,110,16,'phantom'), T(5900,259,112,16,'dodgePlatform',{slide:100,range:150,panicTime:0.85}),
    T(6740,259,116,16,'safeSpike')
  ],
  [
    C(260,460), C(675,405), C(955,345,'dinar'), C(1235,285), C(1515,225,'sela'),
    C(1815,165), C(2120,245,'dinar'), C(2420,325), C(2725,385,'sela'), C(3040,325),
    C(3360,265,'dinar'), C(3680,205), C(4020,145,'sela'), C(4380,215), C(4740,285),
    C(5120,225,'sela'), C(5500,165), C(5900,235,'dinar'), C(6320,295), C(6760,235,'maneh'),
    C(825,238), C(1275,106,'sela'), C(1724,-16,'dinar')
  ],
  [C(6820,235,'dinar')],
  [
    S(420,481,70,22,1.8,1.2,3.0), S(1900,481,74,22,2.2,1.3,3.2),
    S(3100,481,76,22,2.5,1.4,3.3), S(4580,481,80,22,2.8,1.4,3.5),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:56,moveRate:1.95,period:3.5,duty:0.38,warning:1.15},
    {x:2045,y:-150,w:30,h:30,cycle:true,showDormant:true,orbitR:36,orbitX:2045,orbitY:-126,orbitRate:-1.05,period:4.2,duty:0.34,warning:1.35}
  ],
  [E(2420,331,2360,2580,84,'scroll','ancient scroll'), E(4380,221,4320,4570,98,'golem','old shell'), E(6760,241,6700,6980,108,'watcher','old eye')],
  [
    G(1300,280,130,110,'Atika remembers the first shove.',{}),
    G(4020,140,140,120,'The old bait shelf moves after you commit.',{}),
    G(5840,230,130,120,'The spiral drops teeth after visible warning.',{spikes:[
      {x:5980,y:105,w:64,h:22,warning:1.25,duration:1.0,fallSpeed:215,safe:160,showDormant:true},
      {x:6070,y:135,w:66,h:22,warning:1.45,duration:1.0,fallSpeed:230,safe:160,showDormant:true}]}),
    G(6680,235,150,120,'The ancient spiral opens.',{openExit:true})
  ],
  ['Atika is momentum with memory.','Every ancient shove has a landing.','The all-coin path requires braking, not guessing.'],
  { fakeCoins:[F(1340,285,'sela','The ancient coin remembered teeth.'),F(4800,285,'dinar','The reverse boost wore gold.'),F(5960,235,'maneh','The old crown was a spike fossil.')], trickCoins:[{x:2485,y:325,kind:'trapBait',baitX:2740,speed:165,min:2360,max:2820},{x:4025,y:145,kind:'panicRunner',speed:205,min:3960,max:4320},{x:5905,y:235,kind:'reverseRunner',speed:200,min:5840,max:6260}] }
);
