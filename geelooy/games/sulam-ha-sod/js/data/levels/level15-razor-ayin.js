// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

export const level15 = L(
  '15 · Razor Ayin Reversal Court',
  8700,
  { x: 60, y: 420 },
  P(8420, 170, 44, 90),
  'The obvious rightward rhythm is a confession the level can punish.',
  [P(0,505,330,35),P(500,455,120,20),P(820,395,115,20),P(1160,455,120,20),P(1500,390,125,20),P(1840,330,130,20),P(2220,400,135,20),P(2600,455,120,20),P(3000,370,135,20),P(3400,310,140,20),P(3840,375,145,20),P(4260,440,140,20),P(4700,355,150,20),P(5160,295,150,20),P(5620,370,160,20),P(6080,440,150,20),P(6540,360,170,20),P(7040,300,170,20),P(7540,235,180,20),P(8080,210,210,20)],
  [R(1320,430,80,14,-3,520),R(3200,342,90,14,3.4,620),R(5850,412,95,14,-3.6,720)],
  [T(680,438,92,16,'reverseBooster',{dir:1,boost:820}),T(980,379,90,16,'falseSpike'),T(1350,438,90,16,'commitDrop'),T(1700,373,90,16,'ice',{duration:1.3}),T(2050,314,92,16,'phantom'),T(2440,383,94,16,'booster',{dir:-1,boost:760,lift:20}),T(2840,438,92,16,'fakeCheckpoint'),T(3640,294,94,16,'falseSpike'),T(4060,359,96,16,'commitDrop'),T(4520,424,96,16,'antiSpeed'),T(5400,279,100,16,'reverseBooster',{dir:-1,boost:860}),T(6320,424,92,16,'phantom'),T(6820,343,110,16,'booster',{dir:1,boost:1000,lift:30}),T(7350,284,100,16,'falseSpike')],
  [C(250,460),C(540,415),C(855,355,'dinar'),C(1195,415),C(1535,350,'sela'),C(1875,290),C(2255,360),C(2635,415,'dinar'),C(3035,330),C(3435,270,'sela'),C(3875,335),C(4735,315,'dinar'),C(5195,255),C(5655,330,'sela'),C(6115,400),C(6575,320,'dinar'),C(7080,260),C(7580,195,'sela'),C(8120,170,'maneh')],
  [C(8060,170,'dinar')],
  [S(360,481,80,24,1,1,2),S(1450,481,90,24,1.2,1,2.1),S(2720,481,90,24,1.6,1,2.2),S(4180,481,100,24,2,1,2.3),S(5760,481,100,24,2.3,1,2.2),S(7300,481,110,24,1.7,1,2.1)],
  [E(1190,421,1140,1280,130,'watcher','eye that wakes'),E(3050,336,3000,3160,150,'leaper','step thief'),E(4720,321,4680,4860,120,'herder','green shove'),E(6570,326,6500,6720,120,'baitGuard','coin guard')],
  [G(900,330,140,120,'The first fake platform is a question, not a bridge.',{}),G(2840,390,140,120,'Checkpoint paint means nothing here.',{}),G(5400,240,140,120,'The arrow lies when your rhythm gets lazy.',{}),G(8000,170,160,120,'Reverse before the last bait or the court closes.',{openExit:true})],
  ['Razor Ayin watches repeated courage until it becomes foolishness.','Every safe line contains one deliberate betrayal.'],
  { fakeCoins:[F(1020,345,'sela','The first reward was teeth.'),F(7360,248,'maneh','The final bright thing bit back.')], trickCoins:[{x:1500,y:350,kind:'reverseRunner',speed:310,min:1400,max:1760},{x:4050,y:330,kind:'trapBait',baitX:4320,speed:210,min:3980,max:4380},{x:6200,y:390,kind:'shyVanish',safeSide:'left'},{x:7600,y:190,kind:'fakeRunner',min:7520,max:7780}] }
);
