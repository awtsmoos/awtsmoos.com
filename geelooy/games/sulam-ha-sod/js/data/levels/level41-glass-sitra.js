// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Glass Sitra of the Backward Door.
 *
 * Chapter 3: The Awtsmoos placed a glass kingdom behind the player's own heel.
 * Every forward push became backward instruction. The shining door seemed near,
 * then fled into distance; the only honest rungs were spike-shaped, and the
 * only gentle coins were enemies pretending to be walls.
 */
export const level41 = L(
  '41 · Glass Sitra of the Backward Door',
  25000,
  { x: 60, y: 420 },
  P(24600, 74, 44, 90),
  'Walk backward to go forward. Trust only the teeth that let you stand.',
  [P(0,505,360,35),P(900,430,130,20),P(1720,350,135,20),P(2580,270,140,20),P(3480,190,145,20),P(4420,110,150,20),P(5400,190,155,20),P(6420,270,160,20),P(7480,350,165,20),P(8580,270,170,20),P(9720,190,175,20),P(10900,110,180,20),P(12120,190,185,20),P(13380,270,190,20),P(14680,350,195,20),P(16020,270,200,20),P(17400,190,210,20),P(18820,110,220,20),P(20300,150,240,20),P(23200,160,450,20)],
  [R(1420,402,106,14,6.1,1100),R(7240,242,124,14,-7,1240),R(13220,162,136,14,7.3,1360),R(19720,86,146,14,-7.6,1440)],
  [T(1920,334,92,16,'baitShift',{shiftX:170,range:230}),T(2880,254,94,16,'falseSpike'),T(3840,174,96,16,'safeSpike'),T(4820,94,98,16,'oneWay'),T(5840,174,100,16,'phantom'),T(6880,254,102,16,'commitDrop',{reform:3.55}),T(7960,334,104,16,'reverseBooster',{dir:1,boost:1420}),T(9080,254,106,16,'magnet',{pull:940}),T(10240,174,108,16,'antiJump'),T(11440,94,110,16,'falseSpike'),T(12680,174,112,16,'booster',{dir:-1,boost:1560,lift:66}),T(13960,254,114,16,'ice',{duration:2.65}),T(15280,334,116,16,'fakeCheckpoint'),T(16640,254,118,16,'phantom'),T(18040,174,120,16,'safeSpike'),T(19480,94,124,16,'antiSpeed'),T(20980,134,128,16,'falseSpike'),T(22160,144,132,16,'baitShift',{shiftX:-195,range:235})],
  [C(400,460),C(940,390),C(1760,310,'dinar'),C(2620,230),C(3520,150,'sela'),C(4460,70),C(5440,150,'maneh'),C(6460,230),C(7520,310,'dinar'),C(8620,230),C(9760,150,'sela'),C(10940,70),C(12160,150,'dinar'),C(13420,230),C(14720,310,'maneh'),C(16060,230),C(17440,150,'sela'),C(18860,70),C(20340,110,'dinar'),C(23260,120,'maneh')],
  [C(24460,99,'dinar')],
  [S(700,481,90,24,1.55,1,2),S(6800,481,100,24,2.3,1,2.2),S(12720,481,110,24,2.8,1,2.2),S(18680,481,120,24,2.5,1,2.1),S(22580,481,130,24,3.1,1,2.2),{x:10480,y:146,w:70,h:22,proximity:true,range:126,instant:true,duration:.96}],
  [E(3520,156,3460,3680,168,'golem','glass porter',{dropCoin:'dinar'}),E(7520,316,7460,7700,176,'watcher','sitra eye'),E(12160,156,12060,12400,174,'leaper','backward jumper',{dropCoin:'sela'}),E(16060,236,15940,16380,188,'herder','glass shepherd'),E(20340,116,20180,20620,172,'baitGuard','reverse judge'),E(23260,126,23160,23540,164,'feign','sleeping glass',{dropCoin:'maneh'})],
  [G(1920,230,130,130,'The glass rung runs from your certainty.',{}),G(4820,40,150,130,'The one-way mirror receives descent only.',{}),G(10900,40,150,130,'The glass ceiling remembers and falls.',{spikes:[{x:11040,y:12,w:76,h:24,warning:.55,duration:1.1,fallSpeed:580},{x:11144,y:44,w:80,h:24,warning:.7,duration:1.1,fallSpeed:610},{x:11254,y:76,w:84,h:24,warning:.85,duration:1.1,fallSpeed:640}]}),G(14720,280,150,130,'The checkpoint is glass smoke.',{}),G(22620,98,170,130,'The backward door opens after every debt is carried home.',{openExit:true})],
  ['Glass is honest only after it cuts.', 'The sitra turns forward into backward law.', 'A spike can be cleaner than a platform.'],
  {fakeCoins:[F(1940,295,'dinar','The glass coin shattered upward.'),F(11360,62,'maneh','The glass crown fell as knives.'),F(19520,62,'sela','The silent shard lied.')],trickCoins:[{x:3520,y:150,kind:'reverseRunner',speed:550,min:3380,max:3720},{x:9760,y:150,kind:'trapBait',baitX:10900,speed:400,min:9600,max:10980},{x:13420,y:230,kind:'shyVanish',safeSide:'right'},{x:18040,y:150,kind:'fakeRunner',min:17880,max:18380}]}
);
