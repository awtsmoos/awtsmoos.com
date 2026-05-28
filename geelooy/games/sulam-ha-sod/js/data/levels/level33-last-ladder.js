// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Last Ladder of the Laughing Door.
 *
 * The Awtsmoos lets the final new chamber mock certainty. The door appears
 * close enough to insult the player, then demands a huge side climb, returning
 * descent, enemy-held coins, and a final test of which spike is secretly floor.
 */
export const level33 = L(
  '33 · Last Ladder of the Laughing Door',
  18800,
  { x: 60, y: 420 },
  P(18420, 100, 44, 90),
  'The last ladder laughs because the beginning was never behind you.',
  [P(0,505,360,35),P(640,435,130,20),P(1200,355,135,20),P(1800,275,140,20),P(2440,195,145,20),P(3120,115,150,20),P(3840,195,155,20),P(4600,275,160,20),P(5400,355,165,20),P(6240,275,170,20),P(7120,195,175,20),P(8040,115,180,20),P(9000,195,185,20),P(10000,275,190,20),P(11040,355,195,20),P(12120,275,200,20),P(13240,195,210,20),P(14400,115,220,20),P(15600,155,230,20),P(17680,185,340,20)],
  [R(980,408,92,14,-4.4,940),R(5280,248,110,14,5.4,1060),R(9660,168,122,14,-5.8,1180),R(14940,92,132,14,6.2,1260)],
  [T(1440,339,92,16,'falseSpike'),T(2140,259,94,16,'booster',{dir:1,boost:1380,lift:62}),T(2840,179,96,16,'ice',{duration:2.2}),T(3560,99,98,16,'oneWay'),T(4320,179,100,16,'phantom'),T(5100,259,102,16,'commitDrop',{reform:3.1}),T(5920,339,104,16,'reverseBooster',{dir:1,boost:1240}),T(6780,259,106,16,'magnet',{pull:780}),T(7680,179,108,16,'antiJump'),T(8620,99,110,16,'falseSpike'),T(9600,179,112,16,'booster',{dir:-1,boost:1380,lift:48}),T(10620,259,114,16,'ice',{duration:2.25}),T(11680,339,116,16,'fakeCheckpoint'),T(12780,259,118,16,'phantom'),T(13920,179,120,16,'oneWay'),T(15100,99,124,16,'antiSpeed'),T(16360,139,128,16,'falseSpike'),T(17280,149,130,16,'falseSpike')],
  [C(260,460),C(680,395),C(1240,315,'dinar'),C(1840,235),C(2480,155,'sela'),C(3160,75),C(3880,155,'maneh'),C(4640,235),C(5440,315,'dinar'),C(6280,235),C(7160,155,'sela'),C(8080,75),C(9040,155,'dinar'),C(10040,235),C(11080,315,'maneh'),C(12160,235),C(13280,155,'sela'),C(14440,75),C(15640,115,'dinar'),C(17720,145,'maneh')],
  [C(18300,125,'dinar')],
  [S(560,481,90,24,1.2,1,2),S(5080,481,100,24,1.95,1,2.2),S(9600,481,110,24,2.45,1,2.2),S(14180,481,120,24,2.15,1,2.1),S(16980,481,130,24,2.75,1,2.2)],
  [E(2480,161,2420,2640,150,'watcher','laughing eye',{dropCoin:'dinar'}),E(5440,321,5380,5620,158,'scroll','door receipt'),E(9040,161,8940,9260,156,'leaper','last jumper',{dropCoin:'sela'}),E(12160,241,12040,12420,170,'herder','return shepherd'),E(15640,121,15480,15880,154,'baitGuard','laughing lock'),E(17720,151,17620,17980,146,'feign','sleeping final coin',{dropCoin:'maneh'})],
  [G(1440,235,130,130,'The laughing door begins with a floor-shaped spike.',{}),G(3560,45,150,130,'The ladder is one-way only when you are falling back from pride.',{}),G(8040,45,150,130,'The door laughs and drops three teeth.',{spikes:[{x:8180,y:10,w:72,h:24,warning:.55,duration:1.1,fallSpeed:500},{x:8270,y:42,w:76,h:24,warning:.7,duration:1.1,fallSpeed:535},{x:8365,y:74,w:80,h:24,warning:.85,duration:1.1,fallSpeed:565}]}),G(11080,280,150,130,'The checkpoint is theater. The return is real.',{}),G(17020,98,170,130,'The final door opens only after the sleeping coin is stomped awake.',{openExit:true})],
  ['The last ladder is a joke told by the first floor.', 'A spike may be the bridge, and a bridge may be teeth.', 'The door laughs until every carrier has paid.'],
  {fakeCoins:[F(1460,300,'dinar','The laughing coin bit first.'),F(8620,70,'maneh','The final crown was a falling tooth.'),F(15120,70,'sela','The quiet end-spark lied.')],trickCoins:[{x:2480,y:155,kind:'reverseRunner',speed:470,min:2340,max:2680},{x:7160,y:155,kind:'trapBait',baitX:8040,speed:320,min:7000,max:8120},{x:10040,y:235,kind:'shyVanish',safeSide:'right'},{x:13920,y:155,kind:'fakeRunner',min:13760,max:14200}]}
);
