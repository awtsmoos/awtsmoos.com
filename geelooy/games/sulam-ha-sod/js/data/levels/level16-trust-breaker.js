// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/** Trust Breaker Mirror Hall: symmetry lies, spacing tells truth. */
export const level16 = L(
  '16 · Trust Breaker Mirror Hall',
  9100,
  { x: 60, y: 420 },
  P(8800, 190, 44, 90),
  'The mirrored route teaches that symmetry is not honesty.',
  [
    P(0,505,520,35), P(620,445,190,20), P(900,385,195,20), P(1180,325,200,20),
    P(1460,265,210,20), P(1760,335,210,20), P(2060,395,220,20), P(2360,335,220,20),
    P(2660,275,230,20), P(2960,215,230,20), P(3280,285,230,20), P(3600,355,240,20),
    P(3940,295,240,20), P(4300,235,250,20), P(4660,305,250,20), P(5040,365,260,20),
    P(5420,305,260,20), P(5820,245,270,20), P(6240,315,280,20), P(6680,255,280,20),
    P(7140,195,290,20), P(7600,255,290,20), P(8080,315,290,20), P(8400,265,260,20), P(6900,255,2200,20), P(6900,255,2200,20), P(8400,265,260,20), P(560,340,170,18),
    P(780,270,180,18), P(1000,200,190,18), P(1220,130,200,18), P(1440,60,210,18),
    P(1660,-10,220,18), P(1880,-80,230,18), P(2100,-150,240,18), P(1040,40,180,18),
    P(1040,-80,180,18), P(1040,-200,180,18), P(1040,-300,180,18), P(7200,145,250,18), P(7660,215,250,18), P(8140,265,250,18), P(3080,-470,230,18), P(3340,-230,230,18), P(3540,-310,230,18), P(4060,-470,250,18), P(4610,-630,270,18), P(3000,105,1900,18), P(3000,-25,1900,18), P(3000,-155,1900,18), P(3000,-285,1900,18), P(3000,-415,1900,18), P(4200,-585,900,18), P(6900,145,1700,18), P(7600,215,1200,18), P(8080,265,1000,18), P(3000,105,1900,18), P(3000,-25,1900,18), P(3000,-155,1900,18), P(3000,-285,1900,18), P(3000,-415,1900,18), P(4200,-585,900,18), P(6900,145,1700,18), P(7600,215,1200,18), P(8080,265,1000,18), P(7200,145,250,18), P(7660,215,250,18), P(8140,265,250,18), P(3080,-470,230,18), P(3340,-230,230,18), P(3540,-310,230,18), P(4060,-470,250,18), P(4610,-630,270,18)
  ],
  [R(540,425,80,14,1.0,180), R(2240,370,88,14,-1.25,210), R(3840,330,92,14,1.3,230), R(6040,280,96,14,-1.35,240), R(8200,290,100,14,1.4,260)],
  [
    T(1010,369,92,16,'phantom'), T(1300,309,96,16,'falseSpike'), T(1580,249,98,16,'commitDrop',{reform:2.1}),
    T(1880,319,98,16,'ice',{duration:1.25}), T(2480,319,104,16,'booster',{dir:1,boost:720,lift:24}),
    T(2780,259,104,16,'baitShift',{shiftX:-120,range:165,reset:1.8}), T(3380,269,104,16,'magnet',{pull:0.55}),
    T(4020,279,106,16,'reverseBooster',{dir:1,boost:720,lift:18}), T(4740,289,108,16,'antiJump'),
    T(5220,349,110,16,'fakeCheckpoint'), T(5880,229,112,16,'phantom'), T(6740,239,116,16,'dodgePlatform',{slide:120,range:165,panicTime:0.75}),
    T(7200,179,116,16,'safeSpike'), T(8100,299,118,16,'oneWay')
  ],
  [
    C(260,460), C(675,405), C(955,345,'dinar'), C(1235,285), C(1515,225,'sela'),
    C(1815,295), C(2120,355,'dinar'), C(2420,295), C(2725,235,'sela'), C(3020,175),
    C(3340,245,'dinar'), C(3660,315), C(4000,255,'sela'), C(4360,195), C(4720,265),
    C(5100,325,'sela'), C(5480,265), C(5880,205,'dinar'), C(6300,275), C(6740,215),
    C(7200,155,'sela'), C(7660,215), C(8140,275,'maneh'), C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(8180,275,'dinar')],
  [
    S(420,481,76,22,1.6,1.2,2.9), S(1900,481,80,22,2.1,1.3,3.1), S(3100,481,82,22,2.4,1.4,3.2), S(4580,481,86,22,2.7,1.4,3.3), S(7060,481,90,22,2.8,1.3,3.2),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:62,moveRate:2.2,period:3.3,duty:0.42,warning:1.05},
    {x:2140,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:2140,orbitY:-101,orbitRate:1.8,period:3.5,duty:0.38,warning:1.1}
  ],
  [E(2420,301,2360,2580,100,'feign','dead liar'), E(4360,201,4300,4550,115,'watcher','mirror watcher'), E(6740,221,6680,6980,126,'herder','mirror shove')],
  [
    G(1000,300,130,110,'Trust Breaker: symmetry is not honesty.',{}),
    G(3380,240,140,120,'The magnet pulls only if you trust the mirror.',{}),
    G(6500,220,130,120,'The mirror curtain warns before falling.',{spikes:[
      {x:6640,y:105,w:68,h:22,warning:1.2,duration:1.0,fallSpeed:240,safe:150,showDormant:true},
      {x:6730,y:135,w:70,h:22,warning:1.45,duration:1.0,fallSpeed:260,safe:150,showDormant:true}]}),
    G(8080,270,150,120,'The mirror opens after distrust.',{openExit:true})
  ],
  ['The hall copies shape but not truth.','Every mirrored coin has a reachable test.','The all-coin path compares motion, not color.'],
  { fakeCoins:[F(1340,285,'sela','The mirror coin was a fang.'),F(4820,265,'dinar','The checkpoint image lied.'),F(7240,155,'maneh','The mirror crown was bait.')], trickCoins:[{x:2485,y:295,kind:'trapBait',baitX:2740,speed:190,min:2360,max:2820},{x:3385,y:245,kind:'reverseRunner',speed:230,min:3280,max:3600},{x:6745,y:215,kind:'shyVanish',safeSide:'right'},{x:8145,y:215,kind:'trapBait',baitX:8380,speed:200,min:8080,max:8460}] }
);
