// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Razor Ayin Reversal Court: harsh but readable.
 *
 * Chapter 15: The Awtsmoos sharpens absence into a razor and then gives the
 * player enough floor to notice the blade. Duplicate court floors are removed;
 * the reversal remains cruel, but its cruelty now has one voice.
 */
export const level15 = L(
  '15 · Razor Ayin Reversal Court',
  8600,
  { x: 60, y: 420 },
  P(8300, 200, 44, 90),
  'The obvious rightward rhythm is a confession the level can punish.',
  [
    P(0,505,520,35), P(620,445,205,20), P(900,385,210,20), P(1180,325,215,20),
    P(1460,265,225,20), P(1760,335,225,20), P(2060,395,235,20), P(2360,335,235,20),
    P(2660,275,240,20), P(2960,215,240,20), P(3280,285,245,20), P(3600,355,255,20),
    P(3940,295,255,20), P(4300,235,265,20), P(4660,305,265,20), P(5040,365,275,20),
    P(5420,305,275,20), P(5820,245,285,20), P(6240,315,290,20), P(6680,255,290,20),
    P(7140,195,300,20), P(7600,255,300,20), P(7900,215,280,20), P(6900,255,1900,20),
    P(550,346,205,18), P(765,280,215,18), P(985,214,225,18), P(1205,148,235,18),
    P(1425,82,245,18), P(1645,20,255,18), P(1698,-20,190,18), P(1888,-215,190,18),
    P(2078,-305,190,18), P(1870,-40,260,18), P(2090,-98,270,18), P(1040,44,195,18),
    P(1040,-64,195,18), P(1040,-172,195,18), P(1040,-270,195,18), P(3080,-470,230,18),
    P(3340,-230,230,18), P(3540,-310,230,18), P(4060,-470,250,18), P(4610,-630,270,18),
    P(3000,105,1900,18), P(3000,-25,1900,18), P(3000,-155,1900,18), P(3000,-285,1900,18),
    P(3000,-415,1900,18), P(4200,-585,900,18), P(6900,145,950,18), P(7600,215,980,18),
    P(7980,200,650,18)
  ],
  [R(540,425,80,14,0.9,170), R(2240,370,88,14,-1.1,195), R(3840,330,92,14,1.15,205), R(6040,280,96,14,-1.18,215)],
  [
    T(1010,369,92,16,'reverseBooster',{dir:1,boost:580,lift:16}), T(1300,309,96,16,'falseSpike'),
    T(1580,249,98,16,'ice',{duration:1.05}), T(1880,319,98,16,'phantom'), T(2480,319,104,16,'baitShift',{shiftX:105,range:155,reset:2.0}),
    T(2780,259,104,16,'dodgePlatform',{slide:-100,range:150,panicTime:0.85}), T(3380,269,104,16,'fakeCheckpoint'),
    T(4020,279,106,16,'antiSpeed',{duration:1.05}), T(4740,289,108,16,'commitDrop',{reform:2.2}),
    T(5220,349,110,16,'magnet',{pull:0.42}), T(5880,229,112,16,'antiJump'), T(6740,239,116,16,'safeSpike'),
    T(7200,179,116,16,'booster',{dir:1,boost:660,lift:22})
  ],
  [
    C(260,460), C(675,405), C(955,345,'dinar'), C(1235,285), C(1515,225,'sela'),
    C(1815,295), C(2120,355,'dinar'), C(2420,295), C(2725,235,'sela'), C(3020,175),
    C(3340,245,'dinar'), C(3660,315), C(4000,255,'sela'), C(4360,195), C(4720,265),
    C(5100,325,'sela'), C(5480,265), C(5880,205,'dinar'), C(6300,275), C(6740,215),
    C(7200,155,'sela'), C(7660,215,'maneh'), C(825,238), C(1275,106,'sela'), C(1724,-16,'dinar')
  ],
  [C(7700,215,'dinar')],
  [
    S(420,481,70,22,1.8,1.2,3.0), S(1900,481,74,22,2.2,1.3,3.2),
    S(3100,481,76,22,2.5,1.4,3.3), S(4580,481,80,22,2.8,1.4,3.5), S(7060,481,84,22,2.9,1.3,3.4),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:56,moveRate:1.95,period:3.5,duty:0.38,warning:1.15},
    {x:2045,y:-150,w:30,h:30,cycle:true,showDormant:true,orbitR:36,orbitX:2045,orbitY:-126,orbitRate:-1.05,period:4.2,duty:0.34,warning:1.35}
  ],
  [E(2420,301,2360,2580,90,'watcher','razor eye'), E(4360,201,4300,4550,105,'herder','razor shove'), E(6740,221,6680,6980,112,'baitGuard','razor guard')],
  [
    G(1000,300,130,110,'Razor Ayin: reverse before greed.',{}),
    G(3380,240,140,120,'Checkpoint paint is not salvation.',{}),
    G(6500,220,130,120,'The razor curtain warns before falling.',{spikes:[
      {x:6640,y:105,w:64,h:22,warning:1.25,duration:1.0,fallSpeed:220,safe:160,showDormant:true},
      {x:6730,y:135,w:66,h:22,warning:1.45,duration:1.0,fallSpeed:235,safe:160,showDormant:true}]}),
    G(7580,210,150,120,'The court opens after the bait line.',{openExit:true})
  ],
  ['Razor Ayin punishes repeated rhythm.','Every fake platform leaves recovery space.','The all-coin route includes the trick shelves but not blind leaps.'],
  { fakeCoins:[F(1340,285,'sela','The court coin was a tooth.'),F(4820,265,'dinar','The commit shelf wore gold.'),F(7240,155,'maneh','The razor crown was bait.')], trickCoins:[{x:2485,y:295,kind:'trapBait',baitX:2740,speed:165,min:2360,max:2820},{x:3385,y:245,kind:'fakeRunner',min:3280,max:3600},{x:5885,y:205,kind:'shyVanish',safeSide:'left'},{x:7665,y:215,kind:'runner',speed:190,min:7580,max:7860}] }
);
