// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Echo Orchard of Borrowed Floors.
 *
 * The Awtsmoos plants fruit that repeats the player's mistake. Branches become
 * one-way rungs, apples become fake coins, and the safe route requires stopping
 * under a ceiling that looks calm until ambition wakes it.
 */
export const level31 = L(
  '31 · Echo Orchard of Borrowed Floors',
  17400,
  { x: 60, y: 420 },
  P(17020, 100, 44, 90),
  'Every branch repeats you. Move softly or the orchard answers loudly.',
  [P(0,505,360,35),P(600,435,130,20),P(1120,355,135,20),P(1680,275,140,20),P(2280,195,145,20),P(2920,115,150,20),P(3600,195,155,20),P(4320,275,160,20),P(5080,355,165,20),P(5880,275,170,20),P(6720,195,175,20),P(7600,115,180,20),P(8520,195,185,20),P(9480,275,190,20),P(10480,355,195,20),P(11520,275,200,20),P(12600,195,210,20),P(13720,115,220,20),P(14920,175,230,20),P(16480,185,300,20)],
  [R(900,408,88,14,-4.2,900),R(4720,248,106,14,5.2,1020),R(9000,168,118,14,-5.5,1140),R(14200,92,128,14,5.9,1220)],
  [T(1320,339,92,16,'falseSpike'),T(1980,259,94,16,'booster',{dir:1,boost:1340,lift:56}),T(2620,179,96,16,'ice',{duration:2.05}),T(3300,99,98,16,'oneWay'),T(4020,179,100,16,'phantom'),T(4780,259,102,16,'commitDrop',{reform:2.9}),T(5580,339,104,16,'reverseBooster',{dir:1,boost:1200}),T(6420,259,106,16,'magnet',{pull:740}),T(7300,179,108,16,'antiJump'),T(8220,99,110,16,'falseSpike'),T(9180,179,112,16,'booster',{dir:-1,boost:1340,lift:44}),T(10180,259,114,16,'ice',{duration:2.15}),T(11220,339,116,16,'fakeCheckpoint'),T(12300,259,118,16,'phantom'),T(13420,179,120,16,'oneWay'),T(14580,99,124,16,'antiSpeed'),T(15840,159,128,16,'falseSpike')],
  [C(260,460),C(640,395),C(1160,315,'dinar'),C(1720,235),C(2320,155,'sela'),C(2960,75),C(3640,155,'maneh'),C(4360,235),C(5120,315,'dinar'),C(5920,235),C(6760,155,'sela'),C(7640,75),C(8560,155,'dinar'),C(9520,235),C(10520,315,'maneh'),C(11560,235),C(12640,155,'sela'),C(13760,75),C(14960,135,'dinar')],
  [C(16880,125,'dinar')],
  [S(520,481,90,24,1.15,1,2),S(4600,481,100,24,1.85,1,2.2),S(8760,481,110,24,2.35,1,2.2),S(12980,481,120,24,2.05,1,2.1),S(16080,481,130,24,2.65,1,2.2)],
  [E(2320,161,2260,2480,146,'scroll','echo apple',{dropCoin:'dinar'}),E(5120,321,5060,5300,154,'watcher','orchard eye'),E(8560,161,8460,8780,152,'leaper','branch echo',{dropCoin:'sela'}),E(11560,241,11460,11820,166,'gravity','falling fruit'),E(14960,141,14820,15140,150,'feign','sleeping branch')],
  [G(1320,235,130,130,'The first apple platform is actually a spike.',{}),G(3300,45,150,130,'The borrowed branch is one-way: enter from below, land from above.',{}),G(7600,45,150,130,'Three fruit-teeth fall when you rush the orchard.',{spikes:[{x:7740,y:14,w:72,h:24,warning:.55,duration:1.1,fallSpeed:485},{x:7830,y:46,w:76,h:24,warning:.7,duration:1.1,fallSpeed:520},{x:7925,y:78,w:80,h:24,warning:.85,duration:1.1,fallSpeed:550}]}),G(10520,280,150,130,'The low fruit is bait; the high branch is the receipt.',{}),G(16020,105,170,130,'The orchard gate opens after the echo has been paid.',{openExit:true})],
  ['The orchard repeats your arrogance.', 'An apple may be a coin, a tooth, or both.', 'The safest branch is sometimes entered from below.'],
  {fakeCoins:[F(1340,300,'dinar','The apple had metal seeds.'),F(8240,70,'maneh','The echo crown was teeth.'),F(14620,70,'sela','The quiet fruit was bait.')],trickCoins:[{x:2320,y:155,kind:'reverseRunner',speed:455,min:2180,max:2520},{x:6760,y:155,kind:'trapBait',baitX:7600,speed:310,min:6600,max:7680},{x:9520,y:235,kind:'shyVanish',safeSide:'left'},{x:13420,y:155,kind:'fakeRunner',min:13260,max:13680}]}
);
