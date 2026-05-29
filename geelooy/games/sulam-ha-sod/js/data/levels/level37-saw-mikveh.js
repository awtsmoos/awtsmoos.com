// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Saw Mikveh of the Upside-Down Step.
 *
 * The Awtsmoos purifies by reversal here. To descend, climb; to survive, step
 * on spikes; to reach the door, let platforms flee once, then return with the
 * memory of their betrayal burning cleanly in the hand.
 */
export const level37 = L(
  '37 · Saw Mikveh of the Upside-Down Step',
  21800,
  { x: 60, y: 420 },
  P(21420, 85, 44, 90),
  'Purification begins when the safe-looking route becomes unclean.',
  [P(0,505,360,35),P(740,430,130,20),P(1400,350,135,20),P(2100,270,140,20),P(2840,190,145,20),P(3620,110,150,20),P(4440,190,155,20),P(5300,270,160,20),P(6200,350,165,20),P(7140,270,170,20),P(8120,190,175,20),P(9140,110,180,20),P(10200,190,185,20),P(11300,270,190,20),P(12440,350,195,20),P(13620,270,200,20),P(14840,190,210,20),P(16100,110,220,20),P(17420,150,240,20),P(20100,170,400,20)],
  [R(1180,402,98,14,5.3,1020),R(6000,242,116,14,-6.2,1160),R(10920,162,128,14,6.5,1280),R(16620,86,138,14,-6.9,1360)],
  [T(1620,334,92,16,'baitShift',{shiftX:150,range:200}),T(2400,254,94,16,'falseSpike'),T(3180,174,96,16,'safeSpike'),T(3980,94,98,16,'oneWay'),T(4820,174,100,16,'phantom'),T(5680,254,102,16,'commitDrop',{reform:3.35}),T(6580,334,104,16,'reverseBooster',{dir:1,boost:1340}),T(7520,254,106,16,'magnet',{pull:860}),T(8500,174,108,16,'antiJump'),T(9520,94,110,16,'falseSpike'),T(10580,174,112,16,'booster',{dir:-1,boost:1480,lift:58}),T(11680,254,114,16,'ice',{duration:2.45}),T(12820,334,116,16,'fakeCheckpoint'),T(14000,254,118,16,'phantom'),T(15220,174,120,16,'safeSpike'),T(16480,94,124,16,'antiSpeed'),T(17840,134,128,16,'falseSpike'),T(18860,144,132,16,'baitShift',{shiftX:-170,range:210})],
  [C(320,460),C(780,390),C(1440,310,'dinar'),C(2140,230),C(2880,150,'sela'),C(3660,70),C(4480,150,'maneh'),C(5340,230),C(6240,310,'dinar'),C(7180,230),C(8160,150,'sela'),C(9180,70),C(10240,150,'dinar'),C(11340,230),C(12480,310,'maneh'),C(13660,230),C(14880,150,'sela'),C(16140,70),C(17460,110,'dinar'),C(20160,130,'maneh')],
  [C(21280,110,'dinar')],
  [S(620,481,90,24,1.35,1,2),S(5840,481,100,24,2.1,1,2.2),S(10960,481,110,24,2.6,1,2.2),S(16120,481,120,24,2.3,1,2.1),S(19380,481,130,24,2.9,1,2.2),{x:8740,y:146,w:64,h:22,proximity:true,range:118,instant:true,duration:.88}],
  [E(2880,156,2820,3040,160,'watcher','mikveh eye',{dropCoin:'dinar'}),E(6240,316,6180,6420,168,'scroll','purifying scroll'),E(10240,156,10140,10480,166,'leaper','saw jumper',{dropCoin:'sela'}),E(13660,236,13540,13940,180,'gravity','falling drop'),E(17460,116,17300,17740,164,'baitGuard','unclean guard'),E(20160,136,20060,20420,156,'feign','sleeping drop',{dropCoin:'maneh'})],
  [G(1620,230,130,130,'The mikveh moves the step you trusted.',{}),G(3980,40,150,130,'Fall through the rung and rise purified.',{}),G(9140,40,150,130,'Three saw-drops fall in order.',{spikes:[{x:9280,y:12,w:74,h:24,warning:.55,duration:1.1,fallSpeed:540},{x:9376,y:44,w:78,h:24,warning:.7,duration:1.1,fallSpeed:570},{x:9478,y:76,w:82,h:24,warning:.85,duration:1.1,fallSpeed:600}]}),G(12480,280,150,130,'The false checkpoint reflects impurity.',{}),G(19420,98,170,130,'The mikveh door opens after the carriers are emptied.',{openExit:true})],
  ['The mikveh requires reversal.', 'A spike bridge can be clean.', 'A returning platform teaches timing.'],
  {fakeCoins:[F(1640,295,'dinar','The mikveh coin was a blade.'),F(9540,62,'maneh','The purity crown cut downward.'),F(16520,62,'sela','The clean spark lied.')],trickCoins:[{x:2880,y:150,kind:'reverseRunner',speed:510,min:2740,max:3080},{x:8160,y:150,kind:'trapBait',baitX:9140,speed:360,min:8000,max:9220},{x:11340,y:230,kind:'shyVanish',safeSide:'right'},{x:15220,y:150,kind:'fakeRunner',min:15060,max:15520}]}
);
