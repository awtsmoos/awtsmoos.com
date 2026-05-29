// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Ein Sof Last Clean Spiral: precise infinity, not clutter.
 *
 * Chapter 14: The Awtsmoos stretches the path toward no-end. The route remains
 * the sharpest clean spiral so far, yet doubled shelves are removed and infinity
 * becomes a single readable sentence of danger, not a stutter.
 */
export const level14 = L(
  '14 · Ein Sof Last Clean Spiral',
  8100,
  { x: 60, y: 420 },
  P(7800, 200, 44, 90),
  'Ein Sof is the hardest route here, but every danger still has room to breathe.',
  [
    P(0,505,520,35), P(620,445,205,20), P(900,385,210,20), P(1180,325,215,20),
    P(1460,265,225,20), P(1760,205,225,20), P(2060,285,235,20), P(2360,365,235,20),
    P(2660,425,240,20), P(2980,365,240,20), P(3300,305,245,20), P(3620,245,255,20),
    P(3960,185,255,20), P(4320,255,265,20), P(4680,325,265,20), P(5060,265,275,20),
    P(5440,205,275,20), P(5840,275,285,20), P(6260,335,290,20), P(6700,275,290,20),
    P(7140,215,300,20), P(7480,190,280,20), P(550,346,205,18), P(765,280,215,18),
    P(985,214,225,18), P(1205,148,235,18), P(1425,82,245,18), P(1645,20,255,18),
    P(1698,-20,190,18), P(1888,-215,190,18), P(2078,-305,190,18), P(1870,-40,260,18),
    P(2090,-98,270,18), P(1040,44,195,18), P(1040,-64,195,18), P(1040,-172,195,18),
    P(1040,-270,195,18), P(2770,-430,230,18), P(3030,-195,230,18), P(3230,-270,230,18),
    P(3300,-350,230,18), P(4060,-430,260,18), P(4300,-585,260,18)
  ],
  [R(540,425,80,14,0.9,170), R(2240,340,88,14,-1.1,195), R(3840,260,92,14,1.15,205), R(6040,300,96,14,-1.18,215), R(7380,230,100,14,1.22,230)],
  [
    T(1010,369,92,16,'booster',{dir:1,boost:620,lift:28}), T(1300,309,96,16,'falseSpike'),
    T(1580,249,98,16,'ice',{duration:1.1}), T(1880,189,98,16,'phantom'), T(2480,349,104,16,'booster',{dir:1,boost:660,lift:30}),
    T(2780,409,104,16,'falseSpike'), T(3380,289,104,16,'baitShift',{shiftX:105,range:155,reset:1.95}),
    T(4020,169,106,16,'oneWay'), T(4740,309,108,16,'reverseBooster',{dir:1,boost:620,lift:16}),
    T(5220,249,110,16,'phantom'), T(5900,259,112,16,'dodgePlatform',{slide:-100,range:150,panicTime:0.85}),
    T(6740,259,116,16,'safeSpike'), T(7200,199,116,16,'antiSpeed',{duration:1.05})
  ],
  [
    C(260,460), C(675,405), C(955,345,'dinar'), C(1235,285), C(1515,225,'sela'),
    C(1815,165), C(2120,245,'dinar'), C(2420,325), C(2725,385,'sela'), C(3040,325),
    C(3360,265,'dinar'), C(3680,205), C(4020,145,'sela'), C(4380,215), C(4740,285),
    C(5120,225,'sela'), C(5500,165), C(5900,235,'dinar'), C(6320,295), C(6760,235),
    C(7200,175,'sela'), C(7500,160,'maneh'), C(825,238), C(1275,106,'sela'), C(1724,-16,'dinar')
  ],
  [C(7520,160,'dinar')],
  [
    S(420,481,70,22,1.8,1.2,3.0), S(1900,481,74,22,2.2,1.3,3.2),
    S(3100,481,76,22,2.5,1.4,3.3), S(4580,481,80,22,2.8,1.4,3.5), S(7060,481,84,22,2.9,1.3,3.4),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:56,moveRate:1.95,period:3.5,duty:0.38,warning:1.15},
    {x:2045,y:-150,w:30,h:30,cycle:true,showDormant:true,orbitR:36,orbitX:2045,orbitY:-126,orbitRate:1.05,period:4.2,duty:0.34,warning:1.35}
  ],
  [E(2420,331,2360,2580,84,'ayin','infinite eye'), E(4380,221,4320,4570,98,'gravity','infinite reverser'), E(6760,241,6700,6980,108,'golem','final shell')],
  [
    G(1300,280,130,110,'Ein Sof: every fake thing has escape space.',{}),
    G(3380,260,140,120,'The clean spiral moves, but the landing is wide.',{}),
    G(6500,230,130,120,'Infinity drops teeth only after warning.',{spikes:[
      {x:6640,y:105,w:64,h:22,warning:1.25,duration:1.0,fallSpeed:220,safe:160,showDormant:true},
      {x:6730,y:135,w:66,h:22,warning:1.45,duration:1.0,fallSpeed:235,safe:160,showDormant:true}]}),
    G(7140,190,150,120,'The infinite gate opens cleanly.',{openExit:true})
  ],
  ['Ein Sof is precise, not messy.','The final clean spiral is won by patience.','Every coin path has a landing.'],
  { fakeCoins:[F(1340,285,'sela','Infinity glittered falsely.'),F(4800,285,'dinar','The reverse jewel lied.'),F(7240,175,'maneh','The cleanest coin was the last lie.')], trickCoins:[{x:3385,y:265,kind:'trapBait',baitX:3620,speed:165,min:3300,max:3860},{x:5905,y:235,kind:'reverseRunner',speed:200,min:5840,max:6260},{x:7205,y:175,kind:'shyVanish',safeSide:'left'}] }
);
