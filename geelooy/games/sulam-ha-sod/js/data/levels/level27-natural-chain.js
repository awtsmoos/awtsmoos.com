// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Natural Chain III: Mountain Breath.
 *
 * The Awtsmoos carves height into a puzzle. The mountain route folds back on
 * itself, and the safe ledge is sometimes the spike drawn as stone.
 */
export const level27 = L(
  '27 · Natural Chain III: Mountain Breath',
  15000,
  { x: 60, y: 420 },
  P(14620, 90, 44, 90),
  'Climb, return, and do not believe the ledge just because it is stone.',
  [P(0,505,360,35),P(560,430,130,20),P(1000,350,135,20),P(1480,270,140,20),P(2000,190,145,20),P(2560,110,150,20),P(3160,190,155,20),P(3800,270,160,20),P(4480,350,165,20),P(5200,270,170,20),P(5960,190,175,20),P(6760,110,180,20),P(7600,190,185,20),P(8480,270,190,20),P(9400,350,195,20),P(10360,270,200,20),P(11360,190,210,20),P(12400,110,220,20),P(13480,150,230,20),P(14400,170,260,20)],
  [R(800,402,84,14,3.7,800),R(4860,322,106,14,-4.3,920),R(8980,322,114,14,4.8,1040),R(12840,158,120,14,-5,1100)],
  [T(1200,334,92,16,'falseSpike'),T(1760,254,94,16,'ice',{duration:1.8}),T(2320,174,96,16,'booster',{dir:1,boost:1200,lift:52}),T(2920,94,98,16,'oneWay'),T(3560,174,100,16,'phantom'),T(4240,254,102,16,'commitDrop',{reform:2.7}),T(4960,334,104,16,'reverseBooster',{dir:1,boost:1120}),T(5720,254,106,16,'magnet',{pull:660}),T(6520,174,108,16,'antiJump'),T(7360,94,110,16,'falseSpike'),T(8240,174,112,16,'booster',{dir:-1,boost:1220,lift:36}),T(9160,254,114,16,'ice',{duration:1.9}),T(10120,334,116,16,'fakeCheckpoint'),T(11120,254,118,16,'phantom'),T(12160,174,120,16,'oneWay'),T(13240,94,124,16,'antiSpeed'),T(14160,154,126,16,'falseSpike')],
  [C(260,460),C(600,390),C(1040,310,'dinar'),C(1520,230),C(2040,150,'sela'),C(2600,70),C(3200,150,'maneh'),C(3840,230),C(4520,310,'dinar'),C(5240,230),C(6000,150,'sela'),C(6800,70),C(7640,150,'dinar'),C(8520,230),C(9440,310,'maneh'),C(10400,230),C(11400,150,'sela'),C(12440,70),C(13520,110,'dinar')],
  [C(14520,120,'dinar')],
  [S(440,481,90,24,1.1,1,2),S(4080,481,100,24,1.8,1,2.2),S(7820,481,110,24,2.3,1,2.2),S(11580,481,120,24,2,1,2.1),S(14020,481,130,24,2.6,1,2.2)],
  [E(2040,156,1980,2180,138,'golem','stone goat',{dropCoin:'dinar'}),E(4520,316,4460,4680,146,'watcher','peak eye'),E(7640,156,7560,7820,144,'leaper','cliff leaper',{dropCoin:'sela'}),E(10400,236,10320,10620,156,'herder','wind shepherd'),E(13520,116,13420,13720,140,'feign','sleeping boulder')],
  [G(1200,230,130,130,'The mountain ledge is a spike in stone clothing.',{}),G(2920,40,150,130,'Rise through the breath-rung, fall back onto it.',{}),G(6760,40,150,130,'The summit coughs three falling stones.',{spikes:[{x:6900,y:16,w:72,h:24,warning:.55,duration:1.1,fallSpeed:450},{x:6990,y:46,w:76,h:24,warning:.7,duration:1.1,fallSpeed:480},{x:7085,y:76,w:80,h:24,warning:.85,duration:1.1,fallSpeed:510}]}),G(9440,260,150,130,'The low road is bait; return to the ridge.',{}),G(14120,100,170,130,'The mountain gate opens to the full chain.',{openExit:true})],
  ['Stone is not truth; it is only a shape truth can borrow.','The mountain demands upward patience.','A false ledge is readable when its edge shivers.'],
  {fakeCoins:[F(1220,295,'dinar','The ledge-coin was shale teeth.'),F(7380,60,'maneh','The summit crown was a falling stone.'),F(13260,60,'sela','The ridge sparkle cracked open.')],trickCoins:[{x:2040,y:150,kind:'reverseRunner',speed:420,min:1900,max:2220},{x:6000,y:150,kind:'trapBait',baitX:6760,speed:290,min:5840,max:6820},{x:8520,y:230,kind:'shyVanish',safeSide:'right'},{x:12160,y:150,kind:'fakeRunner',min:12000,max:12400}]}
);
