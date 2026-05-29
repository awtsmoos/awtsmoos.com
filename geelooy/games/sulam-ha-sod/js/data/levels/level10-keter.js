// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Keter Crown Switchback.
 *
 * The Awtsmoos crowns the route with reversal rather than clutter. Every prize
 * sits near a broad landing; every fake prize is optional; every falling tooth
 * warns first. The crown still teaches reverse momentum, bait platforms, and a
 * final calm approach to the door.
 */
export const level10 = L(
  '10 · Keter Crown Switchback',
  6200,
  { x: 60, y: 420 },
  P(5900, 230, 44, 90),
  'Keter bends the path backward; the crown is earned by reading the reversal.',
  [
    P(0,505,520,35), P(620,445,190,20), P(900,385,195,20), P(1180,325,200,20),
    P(1460,265,210,20), P(1760,335,210,20), P(2060,395,220,20), P(2360,335,220,20),
    P(2660,275,230,20), P(2960,215,230,20), P(3280,285,230,20), P(3600,355,240,20),
    P(3940,295,240,20), P(4300,235,250,20), P(4660,305,250,20), P(5040,245,260,20),
    P(5420,230,260,20), P(560,340,170,18), P(780,270,180,18), P(1000,200,190,18),
    P(1220,130,200,18), P(1440,60,210,18), P(1660,-10,220,18), P(1880,-80,230,18),
    P(2100,-150,240,18), P(1040,40,180,18), P(1040,-80,180,18), P(1040,-200,180,18),
    P(1040,-300,180,18)
  ],
  [R(540,425,80,14,1.0,180), R(2240,370,88,14,-1.25,210), R(3840,330,92,14,1.3,230)],
  [
    T(1010,369,92,16,'falseSpike'), T(1300,309,96,16,'ice',{duration:1.1}),
    T(1580,249,98,16,'booster',{dir:1,boost:660,lift:30}), T(1880,319,96,16,'phantom'),
    T(2480,319,104,16,'baitShift',{shiftX:120,range:165,reset:1.8}),
    T(2780,259,104,16,'dodgePlatform',{slide:-120,range:160,panicTime:0.75}),
    T(3380,269,104,16,'reverseBooster',{dir:1,boost:660,lift:18}),
    T(4020,279,106,16,'oneWay'), T(4740,289,108,16,'commitDrop',{reform:2.2}),
    T(5220,229,110,16,'safeSpike')
  ],
  [
    C(260,460), C(675,405), C(955,345,'dinar'), C(1235,285), C(1515,225,'sela'),
    C(1815,295), C(2120,355,'dinar'), C(2420,295), C(2725,235,'sela'), C(3020,175),
    C(3340,245,'dinar'), C(3660,315), C(4000,255,'sela'), C(4360,195), C(4720,265),
    C(5100,205,'sela'), C(5480,190,'maneh'), C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(5520,190,'dinar')],
  [
    S(420,481,76,22,1.6,1.2,2.9), S(1900,481,80,22,2.1,1.3,3.1),
    S(3100,481,82,22,2.4,1.4,3.2), S(4580,481,86,22,2.7,1.4,3.3),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:62,moveRate:2.2,period:3.3,duty:0.42,warning:1.05},
    {x:2140,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:2140,orbitY:-101,orbitRate:1.8,period:3.5,duty:0.38,warning:1.1}
  ],
  [E(2120,361,2060,2280,88,'thief','crown thief'), E(3650,321,3600,3840,105,'watcher','crown watcher'), E(5100,211,5040,5300,115,'leaper','crown leaper')],
  [
    G(1500,220,130,110,'Keter: the crown boost has a visible landing.',{}),
    G(2480,270,130,110,'The bait shelf moves; jump after it confesses.',{}),
    G(4300,210,130,120,'The crown drops teeth only after red warning.',{spikes:[
      {x:4440,y:105,w:68,h:22,warning:1.2,duration:1.0,fallSpeed:230,safe:150,showDormant:true},
      {x:4530,y:135,w:70,h:22,warning:1.45,duration:1.0,fallSpeed:250,safe:150,showDormant:true}]}),
    G(5400,190,150,120,'The crown opens from the calm side.',{openExit:true})
  ],
  ['Keter is reversal without clutter.','The bait shelf is optional practice, not a mandatory blind guess.','The crown opens when speed bows to timing.'],
  { fakeCoins:[F(1340,285,'sela','The crown coin had teeth.'),F(2800,235,'dinar','The dodging shelf carried a false reward.'),F(5260,190,'maneh','The last crown glittered falsely.')], trickCoins:[{x:2485,y:295,kind:'trapBait',baitX:2740,speed:190,min:2360,max:2820},{x:3385,y:245,kind:'reverseRunner',speed:230,min:3280,max:3600},{x:4745,y:265,kind:'shyVanish',safeSide:'left'}] }
);
