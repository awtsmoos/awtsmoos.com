// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Mirror Abattoir of Remembered Floors.
 *
 * The Awtsmoos makes this chamber a butcher of assumptions. Platforms dodge,
 * spikes serve as bridges, fake coins wear real faces, and the door waits until
 * the player returns through a route already proven to be alive and hostile.
 */
export const level35 = L(
  '35 · Mirror Abattoir of Remembered Floors',
  20200,
  { x: 60, y: 420 },
  P(19820, 95, 44, 90),
  'The abattoir remembers your first jump and punishes the second.',
  [P(0,505,360,35),P(660,430,130,20),P(1260,350,135,20),P(1900,270,140,20),P(2580,190,145,20),P(3300,110,150,20),P(4060,190,155,20),P(4860,270,160,20),P(5700,350,165,20),P(6580,270,170,20),P(7500,190,175,20),P(8460,110,180,20),P(9460,190,185,20),P(10500,270,190,20),P(11580,350,195,20),P(12700,270,200,20),P(13860,190,210,20),P(15060,110,220,20),P(16320,160,230,20),P(18480,175,360,20)],
  [R(1040,402,96,14,5,980),R(5520,242,112,14,-5.9,1120),R(10140,162,124,14,6.2,1240),R(15540,86,134,14,-6.5,1320)],
  [T(1500,334,92,16,'baitShift',{shiftX:140,range:190}),T(2240,254,94,16,'falseSpike'),T(2960,174,96,16,'safeSpike'),T(3700,94,98,16,'oneWay'),T(4480,174,100,16,'commitDrop',{reform:3.2}),T(5280,254,102,16,'phantom'),T(6120,334,104,16,'reverseBooster',{dir:1,boost:1300}),T(7000,254,106,16,'magnet',{pull:820}),T(7920,174,108,16,'antiSpeed'),T(8880,94,110,16,'falseSpike'),T(9880,174,112,16,'booster',{dir:-1,boost:1440,lift:54}),T(10920,254,114,16,'ice',{duration:2.35}),T(12000,334,116,16,'fakeCheckpoint'),T(13120,254,118,16,'phantom'),T(14280,174,120,16,'safeSpike'),T(15480,94,124,16,'antiJump'),T(16780,134,128,16,'falseSpike'),T(17740,144,130,16,'baitShift',{shiftX:-160,range:200})],
  [C(280,460),C(700,390),C(1300,310,'dinar'),C(1940,230),C(2620,150,'sela'),C(3340,70),C(4100,150,'maneh'),C(4900,230),C(5740,310,'dinar'),C(6620,230),C(7540,150,'sela'),C(8500,70),C(9500,150,'dinar'),C(10540,230),C(11620,310,'maneh'),C(12740,230),C(13900,150,'sela'),C(15100,70),C(16360,120,'dinar'),C(18520,140,'maneh')],
  [C(19680,120,'dinar')],
  [S(580,481,90,24,1.25,1,2),S(5360,481,100,24,2,1,2.2),S(10080,481,110,24,2.5,1,2.2),S(14840,481,120,24,2.2,1,2.1),S(17780,481,130,24,2.8,1,2.2),{x:8120,y:146,w:62,h:22,proximity:true,range:112,instant:true,duration:.84}],
  [E(2620,156,2560,2780,156,'scroll','mirror butcher',{dropCoin:'dinar'}),E(5740,316,5680,5920,164,'watcher','abattoir eye'),E(9500,156,9400,9720,162,'leaper','mirror jumper',{dropCoin:'sela'}),E(12740,236,12620,13020,176,'gravity','falling butcher'),E(16360,126,16200,16620,160,'baitGuard','return cleaver'),E(18520,146,18420,18780,152,'feign','sleeping mirror',{dropCoin:'maneh'})],
  [G(1500,230,130,130,'The first platform moves because it has memory.',{}),G(3700,40,150,130,'Fall through the one-way mirror and land again.',{}),G(8460,40,150,130,'The abattoir drops three mirrored knives.',{spikes:[{x:8600,y:10,w:74,h:24,warning:.55,duration:1.1,fallSpeed:520},{x:8692,y:42,w:78,h:24,warning:.7,duration:1.1,fallSpeed:550},{x:8790,y:74,w:82,h:24,warning:.85,duration:1.1,fallSpeed:580}]}),G(11620,280,150,130,'The fake checkpoint smiles like a blade.',{}),G(17820,98,170,130,'The door opens after every butcher has paid.',{openExit:true})],
  ['Mirror floors learn your rhythm.', 'The required bridge may look like a spike.', 'The second jump is judged harder than the first.'],
  {fakeCoins:[F(1520,295,'dinar','The mirror coin opened its mouth.'),F(8900,62,'maneh','The mirror crown was a knife.'),F(15520,62,'sela','The reflected spark betrayed you.')],trickCoins:[{x:2620,y:150,kind:'reverseRunner',speed:490,min:2480,max:2820},{x:7540,y:150,kind:'trapBait',baitX:8460,speed:340,min:7380,max:8540},{x:10540,y:230,kind:'shyVanish',safeSide:'left'},{x:14280,y:150,kind:'fakeRunner',min:14120,max:14580}]}
);
