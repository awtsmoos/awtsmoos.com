// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Natural Chain V: Root Crown.
 *
 * The Awtsmoos ties river, orchard, mountain, and cave into roots. The final
 * natural chain asks for backtracking, enemy-held coins, and tested surfaces.
 */
export const level29 = L(
  '29 · Natural Chain V: Root Crown',
  16000,
  { x: 60, y: 420 },
  P(15640, 90, 44, 90),
  'The root crown opens only when every natural lie has been tested.',
  [P(0,505,360,35),P(600,435,130,20),P(1080,355,135,20),P(1600,275,140,20),P(2160,195,145,20),P(2760,115,150,20),P(3400,195,155,20),P(4080,275,160,20),P(4800,355,165,20),P(5560,275,170,20),P(6360,195,175,20),P(7200,115,180,20),P(8080,195,185,20),P(9000,275,190,20),P(9960,355,195,20),P(10960,275,200,20),P(12000,195,210,20),P(13080,115,220,20),P(14200,155,230,20),P(15400,170,260,20)],
  [R(860,408,88,14,3.9,840),R(5160,328,110,14,-4.5,960),R(9560,328,118,14,5,1080),R(13680,168,124,14,-5.2,1140)],
  [T(1280,339,92,16,'falseSpike'),T(1920,259,94,16,'ice',{duration:1.9}),T(2560,179,96,16,'booster',{dir:1,boost:1280,lift:56}),T(3240,99,98,16,'oneWay'),T(3960,179,100,16,'phantom'),T(4720,259,102,16,'commitDrop',{reform:2.9}),T(5520,339,104,16,'reverseBooster',{dir:1,boost:1160}),T(6360,259,106,16,'magnet',{pull:700}),T(7240,179,108,16,'antiJump'),T(8160,99,110,16,'falseSpike'),T(9120,179,112,16,'booster',{dir:-1,boost:1280,lift:40}),T(10120,259,114,16,'ice',{duration:2}),T(11160,339,116,16,'fakeCheckpoint'),T(12240,259,118,16,'phantom'),T(13360,179,120,16,'oneWay'),T(14520,99,124,16,'antiSpeed'),T(15300,154,126,16,'falseSpike')],
  [C(260,460),C(640,395),C(1120,315,'dinar'),C(1640,235),C(2200,155,'sela'),C(2800,75),C(3440,155,'maneh'),C(4120,235),C(4840,315,'dinar'),C(5600,235),C(6400,155,'sela'),C(7240,75),C(8120,155,'dinar'),C(9040,235),C(10000,315,'maneh'),C(11000,235),C(12040,155,'sela'),C(13120,75),C(14240,115,'dinar')],
  [C(15540,120,'dinar')],
  [S(480,481,90,24,1.1,1,2),S(4540,481,100,24,1.8,1,2.2),S(8740,481,110,24,2.3,1,2.2),S(12960,481,120,24,2,1,2.1),S(15060,481,130,24,2.6,1,2.2)],
  [E(2200,161,2140,2340,142,'watcher','root eye',{dropCoin:'dinar'}),E(4840,321,4780,5000,150,'scroll','root ledger'),E(8120,161,8040,8300,148,'leaper','root jumper',{dropCoin:'sela'}),E(11000,241,10920,11220,160,'herder','root herder'),E(14240,121,14140,14440,144,'baitGuard','crown root guard')],
  [G(1280,235,130,130,'The first root is a spike pretending to hold you.',{}),G(3240,45,150,130,'The root-ladder catches only your descent.',{}),G(7200,45,150,130,'The root crown sheds three falling thorns.',{spikes:[{x:7340,y:18,w:72,h:24,warning:.55,duration:1.1,fallSpeed:470},{x:7430,y:50,w:76,h:24,warning:.7,duration:1.1,fallSpeed:500},{x:7525,y:82,w:80,h:24,warning:.85,duration:1.1,fallSpeed:530}]}),G(10000,280,150,130,'The honest coin sits after the false checkpoint, not before.',{}),G(15160,100,170,130,'The Natural Chain closes only after every carried coin drops.',{openExit:true})],
  ['Roots remember every previous natural lie.','The crown is not final until it sends you backward.','The Awtsmoos reveals truth in the tested surface.'],
  {fakeCoins:[F(1300,300,'dinar','The root coin had teeth.'),F(8180,70,'maneh','The root crown was a falling thorn.'),F(14540,70,'sela','The final green sparkle lied.')],trickCoins:[{x:2200,y:155,kind:'reverseRunner',speed:440,min:2060,max:2380},{x:6400,y:155,kind:'trapBait',baitX:7200,speed:300,min:6240,max:7260},{x:9040,y:235,kind:'shyVanish',safeSide:'right'},{x:13360,y:155,kind:'fakeRunner',min:13200,max:13600}]}
);
