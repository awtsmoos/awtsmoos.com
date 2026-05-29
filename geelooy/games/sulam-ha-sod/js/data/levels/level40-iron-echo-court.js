// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Iron Echo Court.
 *
 * Chapter 2: In the next hall the Awtsmoos let iron remember every footstep.
 * The echo was not sound; it was geometry returning with a blade. Platforms
 * moved once before mercy, spike-bridges glowed like forbidden honesty, and the
 * judges carried coins in their ribs until the climber learned to stomp truth
 * out of motion.
 */
export const level40 = L(
  '40 · Iron Echo Court',
  24200,
  { x: 60, y: 420 },
  P(23800, 76, 44, 90),
  'The echo moves first. Wait, bait, return, and step on the honest spikes.',
  [P(0,505,360,35),P(860,430,130,20),P(1640,350,135,20),P(2460,270,140,20),P(3320,190,145,20),P(4220,110,150,20),P(5160,190,155,20),P(6140,270,160,20),P(7160,350,165,20),P(8220,270,170,20),P(9320,190,175,20),P(10460,110,180,20),P(11640,190,185,20),P(12860,270,190,20),P(14120,350,195,20),P(15420,270,200,20),P(16760,190,210,20),P(18140,110,220,20),P(19580,150,240,20),P(22440,162,440,20)],
  [R(1360,402,104,14,-5.9,1080),R(6920,242,122,14,6.8,1220),R(12620,162,134,14,-7.1,1340),R(18880,86,144,14,7.4,1420)],
  [T(1840,334,92,16,'baitShift',{shiftX:-165,range:225}),T(2760,254,94,16,'falseSpike'),T(3680,174,96,16,'safeSpike'),T(4620,94,98,16,'oneWay'),T(5600,174,100,16,'phantom'),T(6600,254,102,16,'commitDrop',{reform:3.5}),T(7640,334,104,16,'reverseBooster',{dir:1,boost:1400}),T(8720,254,106,16,'magnet',{pull:920}),T(9840,174,108,16,'antiSpeed'),T(11000,94,110,16,'falseSpike'),T(12200,174,112,16,'booster',{dir:-1,boost:1540,lift:64}),T(13440,254,114,16,'ice',{duration:2.6}),T(14720,334,116,16,'fakeCheckpoint'),T(16040,254,118,16,'phantom'),T(17400,174,120,16,'safeSpike'),T(18800,94,124,16,'antiJump'),T(20260,134,128,16,'falseSpike'),T(21400,144,132,16,'baitShift',{shiftX:190,range:230})],
  [C(380,460),C(900,390),C(1680,310,'dinar'),C(2500,230),C(3360,150,'sela'),C(4260,70),C(5200,150,'maneh'),C(6180,230),C(7200,310,'dinar'),C(8260,230),C(9360,150,'sela'),C(10500,70),C(11680,150,'dinar'),C(12900,230),C(14160,310,'maneh'),C(15460,230),C(16800,150,'sela'),C(18180,70),C(19620,110,'dinar'),C(22500,122,'maneh')],
  [C(23660,101,'dinar')],
  [S(680,481,90,24,1.5,1,2),S(6560,481,100,24,2.25,1,2.2),S(12280,481,110,24,2.75,1,2.2),S(18040,481,120,24,2.45,1,2.1),S(21780,481,130,24,3.05,1,2.2),{x:10080,y:146,w:68,h:22,proximity:true,range:124,instant:true,duration:.94}],
  [E(3360,156,3300,3520,166,'scroll','echo clerk',{dropCoin:'dinar'}),E(7200,316,7140,7380,174,'watcher','iron eye'),E(11680,156,11580,11920,172,'leaper','echo jumper',{dropCoin:'sela'}),E(15460,236,15340,15780,186,'herder','iron shepherd'),E(19620,116,19460,19900,170,'baitGuard','fake bailiff'),E(22500,128,22400,22780,162,'feign','sleeping echo',{dropCoin:'maneh'})],
  [G(1840,230,130,130,'The echo dodges the foot that trusts it.',{}),G(4620,40,150,130,'One-way testimony must be entered from below.',{}),G(10460,40,150,130,'Three iron echoes fall back as teeth.',{spikes:[{x:10600,y:12,w:76,h:24,warning:.55,duration:1.1,fallSpeed:570},{x:10702,y:44,w:80,h:24,warning:.7,duration:1.1,fallSpeed:600},{x:10810,y:76,w:84,h:24,warning:.85,duration:1.1,fallSpeed:630}]}),G(14160,280,150,130,'The checkpoint is an echo, not a refuge.',{}),G(21820,98,170,130,'The iron court opens only after the coin carriers fall.',{openExit:true})],
  ['Echo is memory with teeth.', 'The bridge shaped like spikes is the truthful witness.', 'A fake checkpoint is only a louder lie.'],
  {fakeCoins:[F(1860,295,'dinar','The echo coin struck back.'),F(10920,62,'maneh','The iron crown fell singing.'),F(18840,62,'sela','The quiet echo lied.')],trickCoins:[{x:3360,y:150,kind:'reverseRunner',speed:540,min:3220,max:3560},{x:9360,y:150,kind:'trapBait',baitX:10460,speed:390,min:9200,max:10540},{x:12900,y:230,kind:'shyVanish',safeSide:'left'},{x:17400,y:150,kind:'fakeRunner',min:17240,max:17720}]}
);
