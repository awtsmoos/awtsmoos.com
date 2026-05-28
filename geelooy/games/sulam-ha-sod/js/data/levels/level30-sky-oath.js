// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Sky Oath of Returning Iron.
 *
 * The Awtsmoos raises the player into a contract written in air. The door is
 * visible early, but the real oath is above: one-way ladders, fake safe spikes,
 * rotating saw-rungs, and an enemy who carries a required spark.
 */
export const level30 = L(
  '30 · Sky Oath of Returning Iron',
  16800,
  { x: 60, y: 420 },
  P(16420, 120, 44, 90),
  'The door is not the ending until the sky signs your name.',
  [P(0,505,360,35),P(580,430,130,20),P(1080,350,135,20),P(1600,270,140,20),P(2160,190,145,20),P(2760,110,150,20),P(3420,190,155,20),P(4140,270,160,20),P(4920,350,165,20),P(5760,270,170,20),P(6660,190,175,20),P(7620,110,180,20),P(8640,190,185,20),P(9720,270,190,20),P(10860,350,195,20),P(12060,270,200,20),P(13320,190,210,20),P(14640,110,220,20),P(15820,190,250,20),P(16340,210,280,20)],
  [R(840,402,88,14,4.1,880),R(4480,242,104,14,-5.1,1000),R(9180,162,118,14,5.4,1120),R(13900,82,126,14,-5.8,1200)],
  [T(1260,334,92,16,'falseSpike'),T(1880,254,94,16,'ice',{duration:2}),T(2500,174,96,16,'booster',{dir:1,boost:1320,lift:58}),T(3180,94,98,16,'oneWay'),T(3900,174,100,16,'phantom'),T(4660,254,102,16,'commitDrop',{reform:2.8}),T(5460,334,104,16,'reverseBooster',{dir:1,boost:1180}),T(6300,254,106,16,'magnet',{pull:720}),T(7180,174,108,16,'antiJump'),T(8100,94,110,16,'falseSpike'),T(9060,174,112,16,'booster',{dir:-1,boost:1320,lift:42}),T(10060,254,114,16,'ice',{duration:2.1}),T(11100,334,116,16,'fakeCheckpoint'),T(12180,254,118,16,'phantom'),T(13300,174,120,16,'oneWay'),T(14460,94,124,16,'antiSpeed'),T(15480,174,126,16,'falseSpike')],
  [C(260,460),C(620,390),C(1120,310,'dinar'),C(1640,230),C(2200,150,'sela'),C(2800,70),C(3460,150,'maneh'),C(4180,230),C(4960,310,'dinar'),C(5800,230),C(6700,150,'sela'),C(7660,70),C(8680,150,'dinar'),C(9760,230),C(10900,310,'maneh'),C(12100,230),C(13360,138,'sela'),C(14680,70),C(15860,150,'dinar')],
  [C(16280,155,'dinar')],
  [S(500,481,90,24,1.1,1,2),S(4380,481,100,24,1.8,1,2.2),S(8400,481,110,24,2.3,1,2.2),S(12480,481,120,24,2,1,2.1),S(15440,481,130,24,2.6,1,2.2)],
  [E(2200,156,2140,2360,144,'watcher','oath eye',{dropCoin:'dinar'}),E(4960,316,4900,5140,152,'scroll','sky contract'),E(8680,156,8580,8880,150,'leaper','oath jumper',{dropCoin:'sela'}),E(12100,236,12020,12360,164,'herder','return herder'),E(15860,156,15720,16040,148,'baitGuard','gate signer')],
  [G(1260,230,130,130,'The oath begins with a platform that is really teeth.',{}),G(3180,40,150,130,'Rise through the sky rung; fall to be caught.',{}),G(7620,40,150,130,'The contract drops three iron signatures.',{spikes:[{x:7760,y:10,w:72,h:24,warning:.55,duration:1.1,fallSpeed:480},{x:7850,y:42,w:76,h:24,warning:.7,duration:1.1,fallSpeed:515},{x:7945,y:74,w:80,h:24,warning:.85,duration:1.1,fallSpeed:545}]}),G(10900,280,150,130,'The checkpoint symbol only sells confidence.',{}),G(15480,110,170,130,'Return with every real spark or the oath refuses you.',{openExit:true})],
  ['The sky oath is signed by reversing.', 'A safe-looking ledge may be a written spike.', 'The door remembers enemy-carried coins.'],
  {fakeCoins:[F(1280,295,'dinar','The first oath coin had iron teeth.'),F(8120,62,'maneh','The sky crown was a falling signature.'),F(14500,62,'sela','The high oath sparkle lied.')],trickCoins:[{x:2200,y:150,kind:'reverseRunner',speed:450,min:2060,max:2400},{x:6700,y:150,kind:'trapBait',baitX:7620,speed:305,min:6540,max:7700},{x:9760,y:230,kind:'shyVanish',safeSide:'right'},{x:13300,y:150,kind:'fakeRunner',min:13140,max:13560}]}
);
