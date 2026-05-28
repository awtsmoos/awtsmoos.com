// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/**
 * Cave of Breath Beneath the Crown.
 *
 * The Awtsmoos hides a sky inside the cave. The player must climb through dark
 * one-way lips, wait for rotating stone saws, and return after the cave coughs
 * required coins from armored carriers.
 */
export const level32 = L(
  '32 · Cave of Breath Beneath the Crown',
  18000,
  { x: 60, y: 420 },
  P(17620, 110, 44, 90),
  'The cave breathes upward. Do not jump on every inhale.',
  [P(0,505,360,35),P(620,440,130,20),P(1160,365,135,20),P(1740,285,140,20),P(2360,205,145,20),P(3020,125,150,20),P(3720,205,155,20),P(4460,285,160,20),P(5240,365,165,20),P(6060,285,170,20),P(6920,205,175,20),P(7820,125,180,20),P(8760,205,185,20),P(9740,285,190,20),P(10760,365,195,20),P(11820,285,200,20),P(12920,205,210,20),P(14060,125,220,20),P(15240,165,230,20),P(17120,190,320,20)],
  [R(940,414,90,14,4.3,920),R(5060,258,108,14,-5.3,1040),R(9380,178,120,14,5.6,1160),R(14560,102,130,14,-6,1240)],
  [T(1380,349,92,16,'falseSpike'),T(2060,269,94,16,'ice',{duration:2.1}),T(2740,189,96,16,'booster',{dir:1,boost:1360,lift:60}),T(3440,109,98,16,'oneWay'),T(4180,189,100,16,'phantom'),T(4940,269,102,16,'commitDrop',{reform:3}),T(5740,349,104,16,'reverseBooster',{dir:1,boost:1220}),T(6580,269,106,16,'magnet',{pull:760}),T(7460,189,108,16,'antiJump'),T(8380,109,110,16,'falseSpike'),T(9340,189,112,16,'booster',{dir:-1,boost:1360,lift:46}),T(10340,269,114,16,'ice',{duration:2.2}),T(11380,349,116,16,'fakeCheckpoint'),T(12460,269,118,16,'phantom'),T(13580,189,120,16,'oneWay'),T(14740,109,124,16,'antiSpeed'),T(15960,149,128,16,'falseSpike')],
  [C(260,460),C(660,400),C(1200,325,'dinar'),C(1780,245),C(2400,165,'sela'),C(3060,85),C(3760,165,'maneh'),C(4500,245),C(5280,325,'dinar'),C(6100,245),C(6960,165,'sela'),C(7860,85),C(8800,165,'dinar'),C(9780,245),C(10800,325,'maneh'),C(11860,245),C(12960,165,'sela'),C(14100,85),C(15280,125,'dinar')],
  [C(17480,135,'dinar')],
  [S(540,481,90,24,1.15,1,2),S(4860,481,100,24,1.9,1,2.2),S(9200,481,110,24,2.4,1,2.2),S(13620,481,120,24,2.1,1,2.1),S(16580,481,130,24,2.7,1,2.2)],
  [E(2400,171,2340,2560,148,'golem','breath stone',{dropCoin:'dinar'}),E(5280,331,5220,5460,156,'watcher','cave eye'),E(8800,171,8700,9020,154,'leaper','breath cricket',{dropCoin:'sela'}),E(11860,251,11760,12140,168,'gravity','falling breath'),E(15280,131,15120,15480,152,'baitGuard','cave toller')],
  [G(1380,245,130,130,'The cave shelf wears stone but keeps teeth.',{}),G(3440,55,150,130,'The cave lip lets you pass upward, then catches the fall.',{}),G(7820,55,150,130,'The cave exhales three falling stones.',{spikes:[{x:7960,y:20,w:72,h:24,warning:.55,duration:1.1,fallSpeed:490},{x:8050,y:52,w:76,h:24,warning:.7,duration:1.1,fallSpeed:525},{x:8145,y:84,w:80,h:24,warning:.85,duration:1.1,fallSpeed:555}]}),G(10800,280,150,130,'The false checkpoint is a cave echo, not mercy.',{}),G(16640,110,170,130,'The cave gate opens when the breath returns with sparks.',{openExit:true})],
  ['The cave is a lung under the crown.', 'Wait for the saw-stones to finish breathing.', 'A dark coin may be a falling tooth.'],
  {fakeCoins:[F(1400,310,'dinar','The cave coin was a buried tooth.'),F(8380,78,'maneh','The breath crown fell as stone.'),F(14760,78,'sela','The quiet cave sparkle lied.')],trickCoins:[{x:2400,y:165,kind:'reverseRunner',speed:460,min:2260,max:2600},{x:6960,y:165,kind:'trapBait',baitX:7820,speed:315,min:6800,max:7900},{x:9780,y:245,kind:'shyVanish',safeSide:'right'},{x:13580,y:165,kind:'fakeRunner',min:13420,max:13840}]}
);
