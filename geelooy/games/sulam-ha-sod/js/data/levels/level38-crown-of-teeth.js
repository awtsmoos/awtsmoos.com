// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Crown of Teeth Above the Locked Beginning.
 *
 * The Awtsmoos crowns the new block with a chamber that opens only after the
 * player distrusts every symbol. The needed bridges are spikes, the greedy
 * shortcuts shift, and enemy-held coins drag the route backward through memory.
 */
export const level38 = L(
  '38 · Crown of Teeth Above the Locked Beginning',
  22600,
  { x: 60, y: 420 },
  P(22220, 80, 44, 90),
  'The crown is made of teeth, and some teeth are stairs.',
  [P(0,505,360,35),P(780,430,130,20),P(1480,350,135,20),P(2220,270,140,20),P(3000,190,145,20),P(3820,110,150,20),P(4680,190,155,20),P(5580,270,160,20),P(6520,350,165,20),P(7500,270,170,20),P(8520,190,175,20),P(9580,110,180,20),P(10680,190,185,20),P(11820,270,190,20),P(13000,350,195,20),P(14220,270,200,20),P(15480,190,210,20),P(16780,110,220,20),P(18140,150,240,20),P(20920,165,420,20)],
  [R(1240,402,100,14,-5.5,1040),R(6280,242,118,14,6.4,1180),R(11420,162,130,14,-6.7,1300),R(17200,86,140,14,7.1,1380)],
  [T(1680,334,92,16,'baitShift',{shiftX:-155,range:210}),T(2520,254,94,16,'falseSpike'),T(3360,174,96,16,'safeSpike'),T(4220,94,98,16,'oneWay'),T(5120,174,100,16,'phantom'),T(6040,254,102,16,'commitDrop',{reform:3.4}),T(7000,334,104,16,'reverseBooster',{dir:1,boost:1360}),T(8000,254,106,16,'magnet',{pull:880}),T(9040,174,108,16,'antiJump'),T(10120,94,110,16,'falseSpike'),T(11240,174,112,16,'booster',{dir:-1,boost:1500,lift:60}),T(12400,254,114,16,'ice',{duration:2.5}),T(13600,334,116,16,'fakeCheckpoint'),T(14840,254,118,16,'phantom'),T(16120,174,120,16,'safeSpike'),T(17440,94,124,16,'antiSpeed'),T(18860,134,128,16,'falseSpike'),T(19920,144,132,16,'baitShift',{shiftX:180,range:220})],
  [C(340,460),C(820,390),C(1520,310,'dinar'),C(2260,230),C(3040,150,'sela'),C(3860,70),C(4720,150,'maneh'),C(5620,230),C(6560,310,'dinar'),C(7540,230),C(8560,150,'sela'),C(9620,70),C(10720,150,'dinar'),C(11860,230),C(13040,310,'maneh'),C(14260,230),C(15520,150,'sela'),C(16820,70),C(18180,110,'dinar'),C(20980,125,'maneh')],
  [C(22080,105,'dinar')],
  [S(640,481,90,24,1.4,1,2),S(6080,481,100,24,2.15,1,2.2),S(11400,481,110,24,2.65,1,2.2),S(16760,481,120,24,2.35,1,2.1),S(20180,481,130,24,2.95,1,2.2),{x:9360,y:146,w:66,h:22,proximity:true,range:120,instant:true,duration:.9}],
  [E(3040,156,2980,3200,162,'golem','crown porter',{dropCoin:'dinar'}),E(6560,316,6500,6740,170,'watcher','tooth eye'),E(10720,156,10620,10960,168,'leaper','crown jumper',{dropCoin:'sela'}),E(14260,236,14140,14560,182,'herder','return judge'),E(18180,116,18020,18460,166,'baitGuard','crown deceiver'),E(20980,131,20880,21260,158,'feign','sleeping crown',{dropCoin:'maneh'})],
  [G(1680,230,130,130,'The crown moves the step before your foot arrives.',{}),G(4220,40,150,130,'The one-way tooth accepts only descent.',{}),G(9580,40,150,130,'The crown drops three royal teeth.',{spikes:[{x:9720,y:12,w:76,h:24,warning:.55,duration:1.1,fallSpeed:550},{x:9818,y:44,w:80,h:24,warning:.7,duration:1.1,fallSpeed:580},{x:9922,y:76,w:84,h:24,warning:.85,duration:1.1,fallSpeed:610}]}),G(13040,280,150,130,'The checkpoint is only a painted throne.',{}),G(20220,98,170,130,'The crown opens after the sleepers surrender their coins.',{openExit:true})],
  ['The final crown is not mercy.', 'Required spikes carry the safest truth.', 'The beginning stays locked until the far sky is paid.'],
  {fakeCoins:[F(1700,295,'dinar','The crown coin bit like a king.'),F(10040,62,'maneh','The royal crown fell as teeth.'),F(17480,62,'sela','The quiet throne-spark lied.')],trickCoins:[{x:3040,y:150,kind:'reverseRunner',speed:520,min:2900,max:3240},{x:8560,y:150,kind:'trapBait',baitX:9580,speed:370,min:8400,max:9660},{x:11860,y:230,kind:'shyVanish',safeSide:'right'},{x:16120,y:150,kind:'fakeRunner',min:15960,max:16440}]}
);
