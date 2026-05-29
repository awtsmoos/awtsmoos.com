// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Thorn Contract of the Returning Door.
 *
 * The Awtsmoos signs this chamber in teeth. The first door-likeness is insult,
 * the real route climbs, reverses, steps on honest spikes, waits for moving
 * bridges, and returns with enemy-held sparks before the lock believes you.
 */
export const level34 = L(
  '34 · Thorn Contract of the Returning Door',
  19400,
  { x: 60, y: 420 },
  P(19020, 105, 44, 90),
  'A spike may be the only truthful floor. Read with your feet.',
  [P(0,505,360,35),P(620,440,130,20),P(1180,360,135,20),P(1780,280,140,20),P(2420,200,145,20),P(3100,120,150,20),P(3820,200,155,20),P(4580,280,160,20),P(5380,360,165,20),P(6220,280,170,20),P(7100,200,175,20),P(8020,120,180,20),P(8980,200,185,20),P(9980,280,190,20),P(11020,360,195,20),P(12100,280,200,20),P(13220,200,210,20),P(14380,120,220,20),P(15600,170,230,20),P(17680,185,340,20)],
  [R(980,412,92,14,-4.8,960),R(5280,252,110,14,5.8,1100),R(9660,172,122,14,-6.1,1220),R(14940,96,132,14,6.4,1300)],
  [T(1440,344,92,16,'falseSpike'),T(2140,264,94,16,'baitShift',{shiftX:135,range:180}),T(2840,184,96,16,'safeSpike'),T(3560,104,98,16,'oneWay'),T(4320,184,100,16,'phantom'),T(5100,264,102,16,'commitDrop',{reform:3.1}),T(5920,344,104,16,'reverseBooster',{dir:1,boost:1280}),T(6780,264,106,16,'magnet',{pull:800}),T(7680,184,108,16,'antiJump'),T(8620,104,110,16,'falseSpike'),T(9600,184,112,16,'booster',{dir:-1,boost:1420,lift:50}),T(10620,264,114,16,'ice',{duration:2.3}),T(11680,344,116,16,'fakeCheckpoint'),T(12780,264,118,16,'phantom'),T(13920,184,120,16,'safeSpike'),T(15100,104,124,16,'antiSpeed'),T(16360,144,128,16,'falseSpike'),T(17280,154,130,16,'baitShift',{shiftX:-150,range:190})],
  [C(260,460),C(680,400),C(1240,320,'dinar'),C(1840,240),C(2480,160,'sela'),C(3160,80),C(3880,160,'maneh'),C(4640,240),C(5440,320,'dinar'),C(6280,240),C(7160,160,'sela'),C(8080,80),C(9040,160,'dinar'),C(10040,240),C(11080,320,'maneh'),C(12160,240),C(13280,160,'sela'),C(14440,80),C(15640,130,'dinar'),C(17720,150,'maneh')],
  [C(18880,130,'dinar')],
  [S(560,481,90,24,1.2,1,2),S(5080,481,100,24,1.95,1,2.2),S(9600,481,110,24,2.45,1,2.2),S(14180,481,120,24,2.15,1,2.1),S(16980,481,130,24,2.75,1,2.2),{x:7300,y:156,w:58,h:22,proximity:true,range:110,instant:true,duration:.8}],
  [E(2480,166,2420,2640,154,'watcher','thorn witness',{dropCoin:'dinar'}),E(5440,326,5380,5620,162,'scroll','contract scribe'),E(9040,166,8940,9260,160,'leaper','thorn jumper',{dropCoin:'sela'}),E(12160,246,12040,12420,174,'herder','return shepherd'),E(15640,126,15480,15880,158,'baitGuard','lock deceiver'),E(17720,156,17620,17980,150,'feign','sleeping clause',{dropCoin:'maneh'})],
  [G(1440,240,130,130,'The first clause is a floor-shaped bite.',{}),G(3560,50,150,130,'The contract climbs through one-way breath.',{}),G(8040,50,150,130,'The ceiling signs with falling teeth.',{spikes:[{x:8180,y:15,w:72,h:24,warning:.55,duration:1.1,fallSpeed:510},{x:8270,y:47,w:76,h:24,warning:.7,duration:1.1,fallSpeed:540},{x:8365,y:79,w:80,h:24,warning:.85,duration:1.1,fallSpeed:570}]}),G(11080,285,150,130,'The checkpoint is ink, not mercy.',{}),G(17020,103,170,130,'The contract opens when every carrier has paid.',{openExit:true})],
  ['The thorn contract demands backtracking.', 'The safest spike may be the only bridge.', 'A moving rung returns after memory learns.'],
  {fakeCoins:[F(1460,305,'dinar','The contract coin had teeth.'),F(8620,75,'maneh','The crown clause fell as iron.'),F(15120,75,'sela','The quiet spark was a trap signature.')],trickCoins:[{x:2480,y:160,kind:'reverseRunner',speed:480,min:2340,max:2680},{x:7160,y:160,kind:'trapBait',baitX:8040,speed:330,min:7000,max:8120},{x:10040,y:240,kind:'shyVanish',safeSide:'right'},{x:13920,y:160,kind:'fakeRunner',min:13760,max:14200}]}
);
