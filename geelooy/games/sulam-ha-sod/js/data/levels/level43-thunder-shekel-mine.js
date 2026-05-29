// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Thunder Shekel Mine.
 *
 * Chapter 5: The Awtsmoos hammered currency into thunder until every shekel was
 * a cave, every cave a blade, every blade a lesson. The mine is not random: its
 * thunder falls in authored order, its safe spikes are bridges, and its enemies
 * carry required sparks like ore locked in walking stone.
 */
export const level43 = L(
  '43 · Thunder Shekel Mine',
  26600,
  { x: 60, y: 420 },
  P(26200, 70, 44, 90),
  'The mine pays only the player who memorizes thunder and mistrusts gold.',
  [P(0,505,360,35),P(980,430,130,20),P(1880,350,135,20),P(2820,270,140,20),P(3800,190,145,20),P(4820,110,150,20),P(5880,190,155,20),P(6980,270,160,20),P(8120,350,165,20),P(9300,270,170,20),P(10520,190,175,20),P(11780,110,180,20),P(13080,190,185,20),P(14420,270,190,20),P(15800,350,195,20),P(17220,270,200,20),P(18680,190,210,20),P(20180,110,220,20),P(21740,150,240,20),P(24720,156,470,20)],
  [R(1540,402,110,14,6.5,1140),R(7880,242,128,14,-7.4,1280),R(14420,162,140,14,7.7,1400),R(21400,86,150,14,-8,1480)],
  [T(2080,334,92,16,'baitShift',{shiftX:180,range:240}),T(3120,254,94,16,'falseSpike'),T(4160,174,96,16,'safeSpike'),T(5220,94,98,16,'oneWay'),T(6320,174,100,16,'phantom'),T(7440,254,102,16,'commitDrop',{reform:3.65}),T(8600,334,104,16,'reverseBooster',{dir:1,boost:1460}),T(9800,254,106,16,'magnet',{pull:980}),T(11040,174,108,16,'antiJump'),T(12320,94,110,16,'falseSpike'),T(13640,174,112,16,'booster',{dir:-1,boost:1600,lift:70}),T(15000,254,114,16,'ice',{duration:2.75}),T(16400,334,116,16,'fakeCheckpoint'),T(17840,254,118,16,'phantom'),T(19320,174,120,16,'safeSpike'),T(20840,94,124,16,'antiSpeed'),T(22420,134,128,16,'falseSpike'),T(23680,144,132,16,'baitShift',{shiftX:-205,range:245})],
  [C(440,460),C(1020,390),C(1920,310,'dinar'),C(2860,230),C(3840,150,'sela'),C(4860,70),C(5920,150,'maneh'),C(7020,230),C(8160,310,'dinar'),C(9340,230),C(10560,150,'sela'),C(11820,70),C(13120,150,'dinar'),C(14460,230),C(15840,310,'maneh'),C(17260,230),C(18720,150,'sela'),C(20220,70),C(21780,110,'dinar'),C(24780,116,'maneh')],
  [C(26060,95,'dinar')],
  [S(740,481,90,24,1.65,1,2),S(7280,481,100,24,2.4,1,2.2),S(13600,481,110,24,2.9,1,2.2),S(19960,481,120,24,2.6,1,2.1),S(24180,481,130,24,3.2,1,2.2),{x:11280,y:146,w:74,h:22,proximity:true,range:130,instant:true,duration:1}],
  [E(3840,156,3780,4000,172,'golem','ore porter',{dropCoin:'dinar'}),E(8160,316,8100,8340,180,'watcher','mine eye'),E(13120,156,13020,13360,178,'leaper','thunder jumper',{dropCoin:'sela'}),E(17260,236,17140,17580,192,'herder','ore shepherd'),E(21780,116,21620,22060,176,'baitGuard','false miner'),E(24780,122,24680,25060,168,'feign','sleeping thunder',{dropCoin:'maneh'})],
  [G(2080,230,130,130,'The mine shifts the bridge before the ore lands.',{}),G(5220,40,150,130,'The one-way shaft catches only descent.',{}),G(11780,40,150,130,'Thunder teeth fall through the mine ceiling.',{spikes:[{x:11920,y:12,w:78,h:24,warning:.55,duration:1.1,fallSpeed:600},{x:12028,y:44,w:82,h:24,warning:.7,duration:1.1,fallSpeed:630},{x:12142,y:76,w:86,h:24,warning:.85,duration:1.1,fallSpeed:660}]}),G(15840,280,150,130,'The mine checkpoint is fool gold.',{}),G(24220,98,170,130,'The thunder door opens after the carriers are mined.',{openExit:true})],
  ['Thunder repeats before it kills.', 'Gold can be bait and spikes can be bridges.', 'The mine is paid in memory.'],
  {fakeCoins:[F(2100,295,'dinar','The mine coin rang like teeth.'),F(12240,62,'maneh','The thunder crown fell heavy.'),F(20880,62,'sela','The quiet ore lied.')],trickCoins:[{x:3840,y:150,kind:'reverseRunner',speed:570,min:3700,max:4040},{x:10560,y:150,kind:'trapBait',baitX:11780,speed:420,min:10400,max:11860},{x:14460,y:230,kind:'shyVanish',safeSide:'right'},{x:19320,y:150,kind:'fakeRunner',min:19160,max:19660}]}
);
