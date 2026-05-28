// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Natural Chain I: River Teeth.
 *
 * The Awtsmoos makes nature itself into a liar: moss becomes ice, reeds become
 * spikes, and the river asks the player to move backward before moving onward.
 */
export const level25 = L(
  '25 · Natural Chain I: River Teeth',
  14000,
  { x: 60, y: 420 },
  P(13620, 120, 44, 90),
  'The river is natural, but every natural thing may lie.',
  [P(0,505,360,35),P(520,440,130,20),P(920,365,130,20),P(1360,290,140,20),P(1840,360,145,20),P(2360,430,150,20),P(2920,350,155,20),P(3520,270,160,20),P(4160,350,165,20),P(4840,430,170,20),P(5560,350,175,20),P(6320,270,180,20),P(7120,190,185,20),P(7960,270,190,20),P(8840,350,195,20),P(9760,270,200,20),P(10720,190,210,20),P(11720,270,220,20),P(12760,190,230,20),P(13480,210,260,20)],
  [R(760,414,84,14,3.5,760),R(4540,402,102,14,-4.1,870),R(8500,320,112,14,4.6,980),R(12100,238,116,14,-4.8,1040)],
  [T(1120,349,92,16,'falseSpike'),T(1580,274,94,16,'ice',{duration:1.65}),T(2100,344,96,16,'booster',{dir:1,boost:1120,lift:34}),T(2640,414,98,16,'phantom'),T(3240,334,100,16,'oneWay'),T(3860,254,102,16,'commitDrop',{reform:2.5}),T(4520,334,104,16,'reverseBooster',{dir:1,boost:1050}),T(5260,414,106,16,'magnet',{pull:620}),T(6040,334,108,16,'antiJump'),T(6840,254,110,16,'booster',{dir:-1,boost:1160,lift:36}),T(7680,174,112,16,'falseSpike'),T(8560,254,114,16,'ice',{duration:1.8}),T(9480,334,116,16,'fakeCheckpoint'),T(10440,254,118,16,'phantom'),T(11440,174,120,16,'antiSpeed'),T(12480,254,124,16,'oneWay')],
  [C(260,460),C(560,400),C(960,325,'dinar'),C(1400,250),C(1880,320,'sela'),C(2400,390),C(2960,310,'dinar'),C(3560,230),C(4200,310,'maneh'),C(4880,390),C(5600,310,'sela'),C(6360,230),C(7160,150,'dinar'),C(8000,230),C(8880,310,'sela'),C(9800,230),C(10760,150,'maneh'),C(11760,230),C(12800,150,'dinar')],
  [C(13420,150,'dinar')],
  [S(400,481,90,24,1,1,2),S(3720,481,100,24,1.6,1,2.2),S(7060,481,110,24,2.1,1,2.2),S(10420,481,120,24,1.8,1,2.1),S(13120,481,130,24,2.4,1,2.2)],
  [E(1880,326,1820,2020,132,'thief','reed thief',{dropCoin:'dinar'}),E(4200,316,4140,4380,142,'watcher','river eye'),E(7160,156,7080,7320,138,'leaper','frog lie',{dropCoin:'sela'}),E(9800,236,9720,10000,152,'herder','current herder'),E(12800,156,12700,12980,136,'baitGuard','gate heron')],
  [G(1120,245,130,130,'The mossy stone is teeth under green.',{}),G(3240,275,140,120,'The thin reed catches only your fall.',{}),G(6320,120,150,130,'The river drops three white fangs.',{spikes:[{x:6460,y:60,w:72,h:24,warning:.55,duration:1.1,fallSpeed:430},{x:6550,y:90,w:76,h:24,warning:.7,duration:1.1,fallSpeed:460},{x:6645,y:120,w:80,h:24,warning:.85,duration:1.1,fallSpeed:490}]}),G(10720,120,150,130,'The high spring forces a return route.',{}),G(13040,120,170,130,'The river gate opens only after every honest coin.',{openExit:true})],
  ['Nature lies without malice; the player must read it without panic.','The chain begins in water and ends in reversal.','A reed-platform is mercy only from above.'],
  {fakeCoins:[F(1140,310,'dinar','The moss coin bit like a pike.'),F(7700,145,'maneh','The bright river crown was a fang.'),F(11460,140,'sela','The spring sparkle was a thorn.')],trickCoins:[{x:1880,y:320,kind:'reverseRunner',speed:400,min:1740,max:2060},{x:5600,y:310,kind:'trapBait',baitX:6320,speed:280,min:5480,max:6380},{x:8000,y:230,kind:'shyVanish',safeSide:'right'},{x:10440,y:230,kind:'fakeRunner',min:10280,max:10680}]}
);
