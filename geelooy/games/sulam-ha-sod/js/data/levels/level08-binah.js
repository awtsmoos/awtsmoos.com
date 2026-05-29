// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Binah: hidden floors, but never hidden body-space.
 *
 * Chapter 8: The Awtsmoos hides a chamber inside a question. Yet the question is
 * not a trapdoor without language: each secret floor now gives enough width and
 * warning for the player to understand what was concealed.
 */
export const level08 = L(
  '8 · Binah Womb of Hidden Floors', 5100, { x: 60, y: 420 }, P(4840, 260, 44, 90),
  'Binah hides structure until you test it; the test still has room to stand.',
  [
    P(0,505,500,35), P(580,445,205,20), P(850,385,205,20), P(1120,325,215,20),
    P(1400,265,225,20), P(1680,335,225,20), P(1960,395,230,20), P(2240,335,235,20),
    P(2520,275,235,20), P(2800,215,235,20), P(3090,275,240,20), P(3390,345,245,20),
    P(3710,285,255,20), P(4040,225,255,20), P(4380,285,260,20), P(550,346,205,18),
    P(765,280,215,18), P(985,214,225,18), P(1205,148,235,18), P(1425,82,245,18),
    P(1645,20,255,18), P(1698,-20,190,18), P(1888,-215,190,18), P(2078,-305,190,18),
    P(1870,-40,260,18), P(2090,-98,270,18), P(1040,44,195,18), P(1040,-64,195,18),
    P(1040,-172,195,18), P(1040,-270,195,18)
  ],
  [R(520,425,76,14,0.9,170), R(1840,370,84,14,-1.05,185), R(3240,315,88,14,1.1,195)],
  [
    T(930,369,90,16,'phantom'), T(1190,309,90,16,'ice',{duration:1.0}),
    T(1465,249,86,16,'falseSpike'), T(2260,319,92,16,'booster',{dir:1,boost:560,lift:28}),
    T(2580,259,92,16,'commitDrop',{reform:2.3}), T(2860,199,90,16,'vanish',{reform:1.7}),
    T(3500,329,96,16,'phantom'), T(4300,209,96,16,'booster',{dir:1,boost:560,lift:22}),
    T(1756,2,92,16,'safeSpike'), T(3180,259,104,16,'baitShift',{shiftX:-100,range:150,reset:2.05}),
    T(3760,269,108,16,'dodgePlatform',{slide:100,range:145,panicTime:0.85}), T(4460,269,110,16,'oneWay')
  ],
  [
    C(250,460), C(630,405), C(900,345,'dinar'), C(1175,285), C(1460,225,'sela'),
    C(1745,295), C(2020,355,'dinar'), C(2300,295), C(2580,235,'sela'), C(2860,175),
    C(3150,235,'dinar'), C(3450,305), C(3770,245,'sela'), C(4110,185), C(4450,245,'maneh'),
    C(825,238), C(1275,106,'sela'), C(1724,-16,'dinar')
  ],
  [C(4460,245,'dinar')],
  [
    S(410,481,70,22,1.9,1.3,3.1), S(1740,481,72,22,2.2,1.4,3.3),
    S(2550,251,62,22,2.5,1.4,3.3), S(4380,481,74,22,2.8,1.4,3.6),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:56,moveRate:1.9,period:3.6,duty:0.38,warning:1.15},
    {x:2045,y:-150,w:30,h:30,cycle:true,showDormant:true,orbitR:36,orbitX:2045,orbitY:-126,orbitRate:1.05,period:4.2,duty:0.34,warning:1.35}
  ],
  [E(2300,301,2240,2460,82,'gravity','understanding beast'), E(4140,191,4040,4280,90,'watcher','hidden watcher')],
  [
    G(920,300,120,110,'Binah shows a floor, but the next landing is real.',{}),
    G(2240,270,130,100,'The push is aimed at a visible shelf. Jump late.',{}),
    G(3340,250,120,120,'The absent floor warns before ceiling teeth fall.',{spikes:[
      {x:3460,y:120,w:64,h:22,warning:1.25,duration:1.0,fallSpeed:210,safe:160,showDormant:true},
      {x:3550,y:150,w:66,h:22,warning:1.45,duration:1.0,fallSpeed:220,safe:160,showDormant:true}]}),
    G(4300,220,130,120,'Understanding becomes a door.',{openExit:true})
  ],
  ['Binah makes absence visible.','Phantom floors teach distrust without clutter.','The real path is the high thought, not the low coin line.'],
  { fakeCoins:[F(1580,225,'sela','Binah asked: was that coin born yet?'),F(3650,305,'dinar','The hidden coin bit back.'),F(4470,245,'sela','The final visible floor lied only if chased.')], trickCoins:[{x:2420,y:295,kind:'shyVanish',safeSide:'left'},{x:3185,y:235,kind:'trapBait',baitX:3420,speed:165,min:3090,max:3480},{x:3765,y:245,kind:'reverseRunner',speed:190,min:3710,max:3950}] }
);
