// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Natural Chain II: Wind Orchard.
 *
 * The Awtsmoos bends branches into verdicts. Wind platforms push, fruit coins
 * lie, and the correct route climbs above the obvious orchard road.
 */
export const level26 = L(
  '26 · Natural Chain II: Wind Orchard',
  14500,
  { x: 60, y: 420 },
  P(14140, 100, 44, 90),
  'The orchard path is obvious, therefore suspicious.',
  [P(0,505,360,35),P(540,435,130,20),P(960,355,135,20),P(1420,275,140,20),P(1920,195,145,20),P(2460,275,150,20),P(3040,355,155,20),P(3660,435,160,20),P(4320,355,165,20),P(5020,275,170,20),P(5760,195,175,20),P(6540,275,180,20),P(7360,355,185,20),P(8220,275,190,20),P(9120,195,195,20),P(10060,275,200,20),P(11040,355,210,20),P(12060,275,220,20),P(13120,195,230,20),P(13900,185,260,20)],
  [R(780,408,84,14,-3.6,780),R(4040,408,104,14,4.2,890),R(8740,248,112,14,-4.7,1000),R(12460,248,118,14,4.9,1060)],
  [T(1160,339,92,16,'falseSpike'),T(1660,259,94,16,'booster',{dir:1,boost:1160,lift:48}),T(2200,179,96,16,'ice',{duration:1.75}),T(2760,259,98,16,'phantom'),T(3360,339,100,16,'oneWay'),T(4000,419,102,16,'reverseBooster',{dir:1,boost:1080}),T(4680,339,104,16,'commitDrop',{reform:2.6}),T(5400,259,106,16,'magnet',{pull:640}),T(6160,179,108,16,'falseSpike'),T(6960,259,110,16,'antiJump'),T(7800,339,112,16,'booster',{dir:-1,boost:1180,lift:34}),T(8680,259,114,16,'ice',{duration:1.85}),T(9600,179,116,16,'fakeCheckpoint'),T(10560,259,118,16,'phantom'),T(11560,339,120,16,'antiSpeed'),T(12600,259,124,16,'oneWay'),T(13680,179,126,16,'falseSpike')],
  [C(260,460),C(580,395),C(1000,315,'dinar'),C(1460,235),C(1960,155,'sela'),C(2500,235),C(3080,315,'dinar'),C(3700,395),C(4360,315,'maneh'),C(5060,235),C(5800,155,'sela'),C(6580,235),C(7400,315,'dinar'),C(8260,235),C(9160,155,'maneh'),C(10100,235),C(11080,315,'sela'),C(12100,235),C(13160,155,'dinar')],
  [C(14020,130,'dinar')],
  [S(420,481,90,24,1.1,1,2),S(3840,481,100,24,1.7,1,2.2),S(7380,481,110,24,2.2,1,2.2),S(10940,481,120,24,1.9,1,2.1),S(13560,481,130,24,2.5,1,2.2)],
  [E(1960,161,1900,2100,136,'scroll','branch scribe',{dropCoin:'dinar'}),E(4360,321,4300,4520,144,'watcher','apple eye'),E(7400,321,7320,7560,142,'leaper','wind hopper',{dropCoin:'sela'}),E(10100,241,10020,10300,154,'gravity','falling branch'),E(13160,161,13060,13360,138,'baitGuard','orchard guard')],
  [G(1160,235,130,130,'The bark platform has teeth beneath its rings.',{}),G(3360,280,150,130,'A one-way branch is climbed through, not blocked by.',{}),G(5760,90,150,130,'Three apples fall as spikes.',{spikes:[{x:5900,y:36,w:72,h:24,warning:.55,duration:1.1,fallSpeed:440},{x:5990,y:68,w:76,h:24,warning:.7,duration:1.1,fallSpeed:470},{x:6085,y:100,w:80,h:24,warning:.85,duration:1.1,fallSpeed:500}]}),G(9160,110,150,130,'The high fruit is honest only after the wind reverses.',{}),G(13720,110,170,130,'The orchard gate counts every natural link.',{openExit:true})],
  ['Branches lie by bending just enough.','The chain climbs through wind, not against it.','Fruit becomes reward only after patience.'],
  {fakeCoins:[F(1180,300,'dinar','The bark fruit had iron seeds.'),F(9620,140,'maneh','The high fruit was painted teeth.'),F(13700,140,'sela','The gate-fruit was bait.')],trickCoins:[{x:1960,y:155,kind:'reverseRunner',speed:410,min:1820,max:2140},{x:5800,y:155,kind:'trapBait',baitX:6160,speed:285,min:5640,max:6220},{x:8260,y:235,kind:'shyVanish',safeSide:'left'},{x:11560,y:315,kind:'fakeRunner',min:11400,max:11800}]}
);
