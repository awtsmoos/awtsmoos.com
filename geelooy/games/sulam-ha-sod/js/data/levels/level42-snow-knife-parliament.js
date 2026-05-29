// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Snow Knife Parliament.
 *
 * Chapter 4: The Awtsmoos froze the parliament of knives until every blade wore
 * a white robe. The player hears silence, then the silence votes. Ice preserves
 * momentum, safe-spikes make legal footing, and the required coins are sealed
 * inside enemies pacing like judges beneath a storm of glass.
 */
export const level42 = L(
  '42 · Snow Knife Parliament',
  25800,
  { x: 60, y: 420 },
  P(25400, 72, 44, 90),
  'The snow votes after you jump. Wait for the knife-cycle, then answer.',
  [P(0,505,360,35),P(940,430,130,20),P(1800,350,135,20),P(2700,270,140,20),P(3640,190,145,20),P(4620,110,150,20),P(5640,190,155,20),P(6700,270,160,20),P(7800,350,165,20),P(8940,270,170,20),P(10120,190,175,20),P(11340,110,180,20),P(12600,190,185,20),P(13900,270,190,20),P(15240,350,195,20),P(16620,270,200,20),P(18040,190,210,20),P(19500,110,220,20),P(21020,150,240,20),P(23960,158,460,20)],
  [R(1480,402,108,14,-6.3,1120),R(7560,242,126,14,7.2,1260),R(13820,162,138,14,-7.5,1380),R(20560,86,148,14,7.8,1460)],
  [T(2000,334,92,16,'baitShift',{shiftX:-175,range:235}),T(3000,254,94,16,'falseSpike'),T(4000,174,96,16,'safeSpike'),T(5020,94,98,16,'oneWay'),T(6080,174,100,16,'phantom'),T(7160,254,102,16,'commitDrop',{reform:3.6}),T(8280,334,104,16,'reverseBooster',{dir:1,boost:1440}),T(9440,254,106,16,'magnet',{pull:960}),T(10640,174,108,16,'antiSpeed'),T(11880,94,110,16,'falseSpike'),T(13160,174,112,16,'booster',{dir:-1,boost:1580,lift:68}),T(14480,254,114,16,'ice',{duration:2.7}),T(15840,334,116,16,'fakeCheckpoint'),T(17240,254,118,16,'phantom'),T(18680,174,120,16,'safeSpike'),T(20160,94,124,16,'antiJump'),T(21700,134,128,16,'falseSpike'),T(22920,144,132,16,'baitShift',{shiftX:200,range:240})],
  [C(420,460),C(980,390),C(1840,310,'dinar'),C(2740,230),C(3680,150,'sela'),C(4660,70),C(5680,150,'maneh'),C(6740,230),C(7840,310,'dinar'),C(8980,230),C(10160,150,'sela'),C(11380,70),C(12640,150,'dinar'),C(13940,230),C(15280,310,'maneh'),C(16660,230),C(18080,150,'sela'),C(19540,70),C(21060,110,'dinar'),C(24020,118,'maneh')],
  [C(25260,97,'dinar')],
  [S(720,481,90,24,1.6,1,2),S(7040,481,100,24,2.35,1,2.2),S(13160,481,110,24,2.85,1,2.2),S(19320,481,120,24,2.55,1,2.1),S(23380,481,130,24,3.15,1,2.2),{x:10880,y:146,w:72,h:22,proximity:true,range:128,instant:true,duration:.98}],
  [E(3680,156,3620,3840,170,'golem','snow porter',{dropCoin:'dinar'}),E(7840,316,7780,8020,178,'watcher','white eye'),E(12640,156,12540,12880,176,'leaper','knife jumper',{dropCoin:'sela'}),E(16660,236,16540,16980,190,'herder','parliament shepherd'),E(21060,116,20900,21340,174,'baitGuard','cold clerk'),E(24020,124,23920,24300,166,'feign','sleeping snow',{dropCoin:'maneh'})],
  [G(2000,230,130,130,'The snow floor votes to move.',{}),G(5020,40,150,130,'One-way snow catches the falling answer.',{}),G(11340,40,150,130,'The parliament drops three white knives.',{spikes:[{x:11480,y:12,w:78,h:24,warning:.55,duration:1.1,fallSpeed:590},{x:11586,y:44,w:82,h:24,warning:.7,duration:1.1,fallSpeed:620},{x:11698,y:76,w:86,h:24,warning:.85,duration:1.1,fallSpeed:650}]}),G(15280,280,150,130,'The checkpoint is snow-painted betrayal.',{}),G(23420,98,170,130,'The parliament opens after every judge drops truth.',{openExit:true})],
  ['Snow is silence until it votes.', 'The knife that is a bridge glows faintly.', 'Momentum is a witness against haste.'],
  {fakeCoins:[F(2020,295,'dinar','The snow coin opened into frost teeth.'),F(11800,62,'maneh','The white crown fell hard.'),F(20200,62,'sela','The quiet snow spark lied.')],trickCoins:[{x:3680,y:150,kind:'reverseRunner',speed:560,min:3540,max:3880},{x:10160,y:150,kind:'trapBait',baitX:11340,speed:410,min:10000,max:11420},{x:13940,y:230,kind:'shyVanish',safeSide:'left'},{x:18680,y:150,kind:'fakeRunner',min:18520,max:19020}]}
);
