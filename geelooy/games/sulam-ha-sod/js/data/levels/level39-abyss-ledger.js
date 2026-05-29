// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Abyss Ledger of Borrowed Teeth.
 *
 * Chapter 1: The Awtsmoos opened a black book under the ladder, and every line
 * of ink became a platform that could run away, a spike that could forgive, or
 * a coin that charged interest in bloodless light. This chamber is brutal but
 * counted: every fall teaches, every tooth returns, every carrier pays a real
 * coin before the door agrees to exist.
 */
export const level39 = L(
  '39 · Abyss Ledger of Borrowed Teeth',
  23400,
  { x: 60, y: 420 },
  P(23000, 78, 44, 90),
  'The ledger balances only after safe spikes, fake coins, and enemy debts are paid.',
  [P(0,505,360,35),P(820,430,130,20),P(1560,350,135,20),P(2340,270,140,20),P(3160,190,145,20),P(4020,110,150,20),P(4920,190,155,20),P(5860,270,160,20),P(6840,350,165,20),P(7860,270,170,20),P(8920,190,175,20),P(10020,110,180,20),P(11160,190,185,20),P(12340,270,190,20),P(13560,350,195,20),P(14820,270,200,20),P(16120,190,210,20),P(17460,110,220,20),P(18860,150,240,20),P(21680,164,430,20)],
  [R(1300,402,102,14,5.7,1060),R(6600,242,120,14,-6.6,1200),R(12020,162,132,14,6.9,1320),R(18040,86,142,14,-7.2,1400)],
  [T(1760,334,92,16,'baitShift',{shiftX:160,range:220}),T(2640,254,94,16,'falseSpike'),T(3520,174,96,16,'safeSpike'),T(4420,94,98,16,'oneWay'),T(5360,174,100,16,'phantom'),T(6320,254,102,16,'commitDrop',{reform:3.45}),T(7320,334,104,16,'reverseBooster',{dir:1,boost:1380}),T(8360,254,106,16,'magnet',{pull:900}),T(9440,174,108,16,'antiJump'),T(10560,94,110,16,'falseSpike'),T(11720,174,112,16,'booster',{dir:-1,boost:1520,lift:62}),T(12920,254,114,16,'ice',{duration:2.55}),T(14160,334,116,16,'fakeCheckpoint'),T(15440,254,118,16,'phantom'),T(16760,174,120,16,'safeSpike'),T(18120,94,124,16,'antiSpeed'),T(19540,134,128,16,'falseSpike'),T(20640,144,132,16,'baitShift',{shiftX:-185,range:225})],
  [C(360,460),C(860,390),C(1600,310,'dinar'),C(2380,230),C(3200,150,'sela'),C(4060,70),C(4960,150,'maneh'),C(5900,230),C(6880,310,'dinar'),C(7900,230),C(8960,150,'sela'),C(10060,70),C(11200,150,'dinar'),C(12380,230),C(13600,310,'maneh'),C(14860,230),C(16160,150,'sela'),C(17500,70),C(18900,110,'dinar'),C(21740,124,'maneh')],
  [C(22860,103,'dinar')],
  [S(660,481,90,24,1.45,1,2),S(6320,481,100,24,2.2,1,2.2),S(11840,481,110,24,2.7,1,2.2),S(17400,481,120,24,2.4,1,2.1),S(20980,481,130,24,3,1,2.2),{x:9680,y:146,w:68,h:22,proximity:true,range:122,instant:true,duration:.92}],
  [E(3200,156,3140,3360,164,'golem','ledger porter',{dropCoin:'dinar'}),E(6880,316,6820,7060,172,'watcher','ink eye'),E(11200,156,11100,11440,170,'leaper','debt jumper',{dropCoin:'sela'}),E(14860,236,14740,15180,184,'herder','balance shepherd'),E(18900,116,18740,19180,168,'baitGuard','false accountant'),E(21740,130,21640,22020,160,'feign','sleeping debt',{dropCoin:'maneh'})],
  [G(1760,230,130,130,'The ledger moves the first rung before your landing.',{}),G(4420,40,150,130,'One-way ink catches only a falling vessel.',{}),G(10020,40,150,130,'Three debt teeth descend in order.',{spikes:[{x:10160,y:12,w:76,h:24,warning:.55,duration:1.1,fallSpeed:560},{x:10260,y:44,w:80,h:24,warning:.7,duration:1.1,fallSpeed:590},{x:10366,y:76,w:84,h:24,warning:.85,duration:1.1,fallSpeed:620}]}),G(13600,280,150,130,'The ledger checkpoint is just painted mercy.',{}),G(21020,98,170,130,'The ledger opens when the sleepers surrender their coins.',{openExit:true})],
  ['Every debt is a platform until it moves.', 'Some teeth are stairs because the Awtsmoos writes truth in reversal.', 'The ledger cannot be rushed.'],
  {fakeCoins:[F(1780,295,'dinar','The ledger coin bit like inked iron.'),F(10480,62,'maneh','The debt crown fell as teeth.'),F(18160,62,'sela','The quiet receipt lied.')],trickCoins:[{x:3200,y:150,kind:'reverseRunner',speed:530,min:3060,max:3400},{x:8960,y:150,kind:'trapBait',baitX:10020,speed:380,min:8800,max:10100},{x:12380,y:230,kind:'shyVanish',safeSide:'right'},{x:16760,y:150,kind:'fakeRunner',min:16600,max:17080}]}
);
