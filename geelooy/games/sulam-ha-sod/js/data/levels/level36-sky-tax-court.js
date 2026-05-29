// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Sky Tax Court of Vanishing Mercy.
 *
 * The Awtsmoos raises a court above the court. Every fee is paid by patience:
 * bait ledges flee, safe spikes become receipts, and proximity teeth appear
 * only when the player comes near enough to confess motion.
 */
export const level36 = L(
  '36 · Sky Tax Court of Vanishing Mercy',
  21000,
  { x: 60, y: 420 },
  P(20620, 90, 44, 90),
  'The sky court taxes speed, fear, and fake certainty.',
  [P(0,505,360,35),P(700,435,130,20),P(1320,355,135,20),P(1980,275,140,20),P(2680,195,145,20),P(3420,115,150,20),P(4200,195,155,20),P(5020,275,160,20),P(5880,355,165,20),P(6780,275,170,20),P(7720,195,175,20),P(8700,115,180,20),P(9720,195,185,20),P(10780,275,190,20),P(11880,355,195,20),P(13020,275,200,20),P(14200,195,210,20),P(15420,115,220,20),P(16700,155,240,20),P(19260,175,380,20)],
  [R(1100,408,96,14,-5.1,1000),R(5740,248,114,14,6,1140),R(10500,168,126,14,-6.3,1260),R(16080,92,136,14,6.7,1340)],
  [T(1560,339,92,16,'falseSpike'),T(2300,259,94,16,'baitShift',{shiftX:-145,range:195}),T(3040,179,96,16,'safeSpike'),T(3800,99,98,16,'oneWay'),T(4600,179,100,16,'phantom'),T(5420,259,102,16,'commitDrop',{reform:3.3}),T(6280,339,104,16,'reverseBooster',{dir:1,boost:1320}),T(7180,259,106,16,'magnet',{pull:840}),T(8120,179,108,16,'antiJump'),T(9100,99,110,16,'falseSpike'),T(10120,179,112,16,'booster',{dir:-1,boost:1460,lift:56}),T(11180,259,114,16,'ice',{duration:2.4}),T(12280,339,116,16,'fakeCheckpoint'),T(13420,259,118,16,'phantom'),T(14600,179,120,16,'safeSpike'),T(15820,99,124,16,'antiSpeed'),T(17140,139,128,16,'falseSpike'),T(18120,149,132,16,'baitShift',{shiftX:165,range:205})],
  [C(300,460),C(740,395),C(1360,315,'dinar'),C(2020,235),C(2720,155,'sela'),C(3460,75),C(4240,155,'maneh'),C(5060,235),C(5920,315,'dinar'),C(6820,235),C(7760,155,'sela'),C(8740,75),C(9760,155,'dinar'),C(10820,235),C(11920,315,'maneh'),C(13060,235),C(14240,155,'sela'),C(15460,75),C(16740,115,'dinar'),C(19320,135,'maneh')],
  [C(20480,115,'dinar')],
  [S(600,481,90,24,1.3,1,2),S(5600,481,100,24,2.05,1,2.2),S(10520,481,110,24,2.55,1,2.2),S(15480,481,120,24,2.25,1,2.1),S(18580,481,130,24,2.85,1,2.2),{x:8420,y:151,w:64,h:22,proximity:true,range:116,instant:true,duration:.86}],
  [E(2720,161,2660,2880,158,'golem','tax collector',{dropCoin:'dinar'}),E(5920,321,5860,6100,166,'watcher','court eye'),E(9760,161,9660,9980,164,'leaper','fee jumper',{dropCoin:'sela'}),E(13060,241,12940,13340,178,'herder','audit shepherd'),E(16740,121,16580,17000,162,'baitGuard','false clerk'),E(19320,141,19220,19580,154,'feign','sleeping tax',{dropCoin:'maneh'})],
  [G(1560,235,130,130,'The first fee is hidden under a normal ledge.',{}),G(3800,45,150,130,'The sky court accepts one-way testimony.',{}),G(8700,45,150,130,'Three receipts fall as teeth.',{spikes:[{x:8840,y:12,w:74,h:24,warning:.55,duration:1.1,fallSpeed:530},{x:8934,y:44,w:78,h:24,warning:.7,duration:1.1,fallSpeed:560},{x:9034,y:76,w:82,h:24,warning:.85,duration:1.1,fallSpeed:590}]}),G(11920,280,150,130,'The checkpoint is taxable fiction.',{}),G(18620,98,170,130,'The court opens after every hidden fee returns.',{openExit:true})],
  ['The sky court charges certainty.', 'A moving platform is a receipt with legs.', 'The spike bridge is the honest clerk.'],
  {fakeCoins:[F(1580,300,'dinar','The tax coin billed your hand.'),F(9120,70,'maneh','The court crown was iron paperwork.'),F(15860,70,'sela','The mercy spark charged interest.')],trickCoins:[{x:2720,y:155,kind:'reverseRunner',speed:500,min:2580,max:2920},{x:7760,y:155,kind:'trapBait',baitX:8700,speed:350,min:7600,max:8780},{x:10820,y:235,kind:'shyVanish',safeSide:'right'},{x:14600,y:155,kind:'fakeRunner',min:14440,max:14880}]}
);
