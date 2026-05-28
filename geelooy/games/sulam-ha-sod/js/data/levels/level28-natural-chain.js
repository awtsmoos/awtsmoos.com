// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Natural Chain IV: Cave Rain.
 *
 * The Awtsmoos makes darkness readable by rhythm. Drips warn before falling,
 * crystals glitter like coins, and the cave asks for a vertical detour.
 */
export const level28 = L(
  '28 · Natural Chain IV: Cave Rain',
  15500,
  { x: 60, y: 420 },
  P(15140, 110, 44, 90),
  'The cave ceiling speaks before it bites.',
  [P(0,505,360,35),P(580,440,130,20),P(1040,365,135,20),P(1540,285,140,20),P(2080,205,145,20),P(2660,125,150,20),P(3280,205,155,20),P(3940,285,160,20),P(4640,365,165,20),P(5380,285,170,20),P(6160,205,175,20),P(6980,125,180,20),P(7840,205,185,20),P(8740,285,190,20),P(9680,365,195,20),P(10660,285,200,20),P(11680,205,210,20),P(12740,125,220,20),P(13840,165,230,20),P(14900,190,260,20)],
  [R(820,414,86,14,-3.8,820),R(5000,338,108,14,4.4,940),R(9280,338,116,14,-4.9,1060),R(13260,178,122,14,5.1,1120)],
  [T(1240,349,92,16,'falseSpike'),T(1840,269,94,16,'ice',{duration:1.85}),T(2440,189,96,16,'booster',{dir:1,boost:1240,lift:54}),T(3080,109,98,16,'oneWay'),T(3760,189,100,16,'phantom'),T(4480,269,102,16,'commitDrop',{reform:2.8}),T(5240,349,104,16,'reverseBooster',{dir:1,boost:1140}),T(6040,269,106,16,'magnet',{pull:680}),T(6880,189,108,16,'antiJump'),T(7760,109,110,16,'falseSpike'),T(8680,189,112,16,'booster',{dir:-1,boost:1240,lift:38}),T(9640,269,114,16,'ice',{duration:1.95}),T(10640,349,116,16,'fakeCheckpoint'),T(11680,269,118,16,'phantom'),T(12760,189,120,16,'oneWay'),T(13880,109,124,16,'antiSpeed'),T(14780,174,126,16,'falseSpike')],
  [C(260,460),C(620,400),C(1080,325,'dinar'),C(1580,245),C(2120,165,'sela'),C(2700,85),C(3320,165,'maneh'),C(3980,245),C(4680,325,'dinar'),C(5420,245),C(6200,165,'sela'),C(7020,85),C(7880,165,'dinar'),C(8780,245),C(9720,325,'maneh'),C(10700,245),C(11720,165,'sela'),C(12780,85),C(13880,125,'dinar')],
  [C(15040,135,'dinar')],
  [S(460,481,90,24,1.1,1,2),S(4260,481,100,24,1.8,1,2.2),S(8180,481,110,24,2.3,1,2.2),S(12120,481,120,24,2,1,2.1),S(14540,481,130,24,2.6,1,2.2)],
  [E(2120,171,2060,2260,140,'scroll','drip scribe',{dropCoin:'dinar'}),E(4680,331,4620,4840,148,'watcher','crystal eye'),E(7880,171,7800,8060,146,'leaper','cave cricket',{dropCoin:'sela'}),E(10700,251,10620,10920,158,'gravity','falling stalactite'),E(13880,131,13780,14080,142,'baitGuard','deep gate guard')],
  [G(1240,245,130,130,'The crystal shelf is actually a tooth.',{}),G(3080,55,150,130,'Jump through the wet one-way lip.',{}),G(6980,50,150,130,'The cave rain falls in three warnings.',{spikes:[{x:7120,y:20,w:72,h:24,warning:.55,duration:1.1,fallSpeed:460},{x:7210,y:52,w:76,h:24,warning:.7,duration:1.1,fallSpeed:490},{x:7305,y:84,w:80,h:24,warning:.85,duration:1.1,fallSpeed:520}]}),G(9720,280,150,130,'The low crystal is bait; climb back up.',{}),G(14640,110,170,130,'The cave gate opens after every chain spark.',{openExit:true})],
  ['Rain is timing made visible.','A cave can lie with glitter and still be fair.','The chain continues through darkness by listening.'],
  {fakeCoins:[F(1260,310,'dinar','The crystal coin was a tooth.'),F(7780,70,'maneh','The rain crown stabbed downward.'),F(13680,80,'sela','The cave sparkle was bait.')],trickCoins:[{x:2120,y:165,kind:'reverseRunner',speed:430,min:1980,max:2300},{x:6200,y:165,kind:'trapBait',baitX:6980,speed:295,min:6040,max:7040},{x:8780,y:245,kind:'shyVanish',safeSide:'left'},{x:12760,y:165,kind:'fakeRunner',min:12600,max:13000}]}
);
