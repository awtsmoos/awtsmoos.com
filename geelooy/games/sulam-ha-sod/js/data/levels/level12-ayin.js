// B"H
import { P, C, S, E, R, T, G, L, F } from '../levelPrimitives.js';

/** Ayin Empty Platform Trial: absence, but with humane landings. */
export const level12 = L(
  '12 · Ayin Empty Platform Trial',
  7000,
  { x: 60, y: 420 },
  P(6700, 220, 44, 90),
  'Ayin makes absence dangerous and presence suspicious, but every collectible is reachable.',
  [
    P(0,505,520,35), P(620,445,190,20), P(900,385,195,20), P(1180,325,200,20),
    P(1460,265,210,20), P(1760,205,210,20), P(2060,285,220,20), P(2360,365,220,20),
    P(2660,425,230,20), P(2980,365,230,20), P(3300,305,230,20), P(3620,245,240,20),
    P(3960,185,240,20), P(4320,255,250,20), P(4680,325,250,20), P(5060,265,260,20),
    P(5440,205,260,20), P(5840,275,270,20), P(6260,235,280,20), P(560,340,170,18),
    P(780,270,180,18), P(1000,200,190,18), P(1220,130,200,18), P(1440,60,210,18),
    P(1660,-10,220,18), P(1880,-80,230,18), P(2100,-150,240,18), P(1040,40,180,18),
    P(1040,-80,180,18), P(1040,-200,180,18), P(1040,-300,180,18)
  ],
  [R(540,425,80,14,1.0,180), R(2240,340,88,14,-1.25,210), R(3840,260,92,14,1.3,230), R(6040,250,96,14,-1.35,240)],
  [
    T(1010,369,92,16,'phantom'), T(1300,309,96,16,'ice',{duration:1.15}),
    T(1580,249,98,16,'falseSpike'), T(1880,189,98,16,'booster',{dir:1,boost:700,lift:30}),
    T(2480,349,104,16,'baitShift',{shiftX:120,range:165,reset:1.8}), T(2780,409,104,16,'phantom'),
    T(3380,289,104,16,'dodgePlatform',{slide:-120,range:160,panicTime:0.75}), T(4020,169,106,16,'oneWay'),
    T(4740,309,108,16,'magnet',{pull:0.55}), T(5220,249,110,16,'falseSpike'), T(5880,259,110,16,'antiJump')
  ],
  [
    C(260,460), C(675,405), C(955,345,'dinar'), C(1235,285), C(1515,225,'sela'),
    C(1815,165), C(2120,245,'dinar'), C(2420,325), C(2725,385,'sela'), C(3040,325),
    C(3360,265,'dinar'), C(3680,205), C(4020,145,'sela'), C(4380,215), C(4740,285),
    C(5120,225,'sela'), C(5500,165), C(5900,235,'dinar'), C(6320,195,'maneh'),
    C(820,228), C(1265,88,'sela'), C(1710,-52,'dinar')
  ],
  [C(6360,195,'dinar')],
  [
    S(420,481,76,22,1.6,1.2,2.9), S(1900,481,80,22,2.1,1.3,3.1), S(3100,481,82,22,2.4,1.4,3.2), S(4580,481,86,22,2.7,1.4,3.3),
    {x:760,y:472,w:30,h:30,cycle:true,showDormant:true,moveX:62,moveRate:2.2,period:3.3,duty:0.42,warning:1.05},
    {x:2140,y:-123,w:30,h:30,cycle:true,showDormant:true,orbitR:48,orbitX:2140,orbitY:-101,orbitRate:1.8,period:3.5,duty:0.38,warning:1.1}
  ],
  [E(2420,331,2360,2580,92,'gilgul','empty echo'), E(4380,221,4320,4570,108,'ayin','nothing eye'), E(5900,241,5840,6110,120,'leaper','absence leaper')],
  [
    G(1000,300,130,110,'Ayin: the missing floor is shown before it matters.',{}),
    G(3380,260,140,120,'The dodging absence has a broad recovery shelf.',{}),
    G(5060,230,130,120,'Nothing drops teeth only after visible warning.',{spikes:[
      {x:5200,y:105,w:68,h:22,warning:1.2,duration:1.0,fallSpeed:235,safe:150,showDormant:true},
      {x:5290,y:135,w:70,h:22,warning:1.45,duration:1.0,fallSpeed:255,safe:150,showDormant:true}]}),
    G(6240,195,150,120,'Nothingness opens after patience.',{openExit:true})
  ],
  ['Ayin removes certainty, not body space.','The player can collect every visible argument.','The last empty shelf is optional practice.'],
  { fakeCoins:[F(1340,285,'sela','Ayin made treasure suspicious.'),F(4800,285,'dinar','The magnetic coin lied.'),F(5960,235,'maneh','The last empty gift was a spike.')], trickCoins:[{x:2485,y:325,kind:'trapBait',baitX:2740,speed:190,min:2360,max:2820},{x:3385,y:265,kind:'runner',speed:230,min:3300,max:3620},{x:5885,y:235,kind:'shyVanish',safeSide:'left'}] }
);
