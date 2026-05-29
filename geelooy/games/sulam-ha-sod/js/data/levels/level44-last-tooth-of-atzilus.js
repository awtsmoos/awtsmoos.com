// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Last Tooth of Atzilus.
 *
 * Chapter 6: The final new tooth did not look final. The Awtsmoos hid it in a
 * clean strip of purple night, then made every ordinary surface stand trial.
 * Safe spikes became ladders, bait platforms fled like sparks from a hammer,
 * and the last door demanded coins carried by enemies at the far edge of memory.
 */
export const level44 = L(
  '44 · Last Tooth of Atzilus',
  27400,
  { x: 60, y: 420 },
  P(27000, 68, 44, 90),
  'The last tooth is a ladder only after every lie has been tested.',
  [P(0,505,360,35),P(1020,430,130,20),P(1960,350,135,20),P(2940,270,140,20),P(3960,190,145,20),P(5020,110,150,20),P(6120,190,155,20),P(7260,270,160,20),P(8440,350,165,20),P(9660,270,170,20),P(10920,190,175,20),P(12220,110,180,20),P(13560,190,185,20),P(14940,270,190,20),P(16360,350,195,20),P(17820,270,200,20),P(19320,190,210,20),P(20860,110,220,20),P(22460,150,240,20),P(25480,154,480,20)],
  [R(1600,402,112,14,-6.7,1160),R(8200,242,130,14,7.6,1300),R(15020,162,142,14,-7.9,1420),R(22240,86,152,14,8.2,1500)],
  [T(2160,334,92,16,'baitShift',{shiftX:-190,range:245}),T(3240,254,94,16,'falseSpike'),T(4320,174,96,16,'safeSpike'),T(5420,94,98,16,'oneWay'),T(6560,174,100,16,'phantom'),T(7720,254,102,16,'commitDrop',{reform:3.7}),T(8920,334,104,16,'reverseBooster',{dir:1,boost:1480}),T(10160,254,106,16,'magnet',{pull:1000}),T(11440,174,108,16,'antiSpeed'),T(12760,94,110,16,'falseSpike'),T(14120,174,112,16,'booster',{dir:-1,boost:1620,lift:72}),T(15520,254,114,16,'ice',{duration:2.8}),T(16960,334,116,16,'fakeCheckpoint'),T(18440,254,118,16,'phantom'),T(19960,174,120,16,'safeSpike'),T(21520,94,124,16,'antiJump'),T(23140,134,128,16,'falseSpike'),T(24440,144,132,16,'baitShift',{shiftX:210,range:250})],
  [C(460,460),C(1060,390),C(2000,310,'dinar'),C(2980,230),C(4000,150,'sela'),C(5060,70),C(6160,150,'maneh'),C(7300,230),C(8480,310,'dinar'),C(9700,230),C(10960,150,'sela'),C(12260,70),C(13600,150,'dinar'),C(14980,230),C(16400,310,'maneh'),C(17860,230),C(19360,150,'sela'),C(20900,70),C(22500,110,'dinar'),C(25540,114,'maneh')],
  [C(26860,93,'dinar')],
  [S(760,481,90,24,1.7,1,2),S(7520,481,100,24,2.45,1,2.2),S(14040,481,110,24,2.95,1,2.2),S(20600,481,120,24,2.65,1,2.1),S(24980,481,130,24,3.25,1,2.2),{x:11680,y:146,w:76,h:22,proximity:true,range:132,instant:true,duration:1.02}],
  [E(4000,156,3940,4160,174,'golem','atzilus porter',{dropCoin:'dinar'}),E(8480,316,8420,8660,182,'watcher','last eye'),E(13600,156,13500,13840,180,'leaper','tooth jumper',{dropCoin:'sela'}),E(17860,236,17740,18180,194,'herder','final shepherd'),E(22500,116,22340,22780,178,'baitGuard','atzilus deceiver'),E(25540,120,25440,25820,170,'feign','sleeping final tooth',{dropCoin:'maneh'})],
  [G(2160,230,130,130,'The last tooth moves before your trust lands.',{}),G(5420,40,150,130,'The one-way tooth drinks only descent.',{}),G(12220,40,150,130,'The last ceiling drops three final teeth.',{spikes:[{x:12360,y:12,w:78,h:24,warning:.55,duration:1.1,fallSpeed:610},{x:12470,y:44,w:82,h:24,warning:.7,duration:1.1,fallSpeed:640},{x:12586,y:76,w:86,h:24,warning:.85,duration:1.1,fallSpeed:670}]}),G(16400,280,150,130,'The checkpoint is the last painted mercy.',{}),G(25020,98,170,130,'The last tooth opens after every hidden spark is paid.',{openExit:true})],
  ['Atzilus here is only a name for a brutal playable crown.', 'The safe spike is the rung the eye refuses.', 'The final tooth waits for every carried coin.'],
  {fakeCoins:[F(2180,295,'dinar','The final coin bit like a crown.'),F(12680,62,'maneh','The last crown became falling teeth.'),F(21560,62,'sela','The final quiet spark lied.')],trickCoins:[{x:4000,y:150,kind:'reverseRunner',speed:580,min:3860,max:4200},{x:10960,y:150,kind:'trapBait',baitX:12220,speed:430,min:10800,max:12300},{x:14980,y:230,kind:'shyVanish',safeSide:'left'},{x:19960,y:150,kind:'fakeRunner',min:19800,max:20300}]}
);
