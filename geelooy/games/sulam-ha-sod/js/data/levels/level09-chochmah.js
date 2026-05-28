// B"H
import {P,C,S,E,R,T,G,L,F} from '../levelPrimitives.js';
export const level09=L('9 · Chochmah Flash Run',5400,{x:60,y:420},P(5160,210,44,90),'Chochmah is fast insight: commit before fear explains it.',
[P(0,505,340,35),P(500,455,120,20),P(760,400,120,20),P(1040,345,120,20),P(1320,290,130,20),P(1620,235,130,20),P(1940,315,150,20),P(2260,390,150,20),P(2580,330,150,20),P(2920,270,150,20),P(3260,210,150,20),P(3620,290,160,20),P(3980,360,170,20),P(4360,300,170,20),P(4760,250,190,20)],
[R(660,430,80,14,2.3,380),R(2100,365,84,14,-2.6,440),R(3440,260,92,14,2.9,500)],
[T(900,384,80,16,'booster',{dir:1,boost:880,lift:25}),T(1200,330,80,16,'ice',{duration:.85}),T(1500,274,80,16,'falseSpike'),T(1800,220,80,16,'booster',{dir:1,boost:910,lift:20}),T(2460,374,80,16,'phantom'),T(3100,254,85,16,'ice',{duration:.9}),T(3800,344,90,16,'booster',{dir:1,boost:940,lift:25}),T(4560,284,90,16,'falseSpike'),T(2140,300,80,16,'falseSpike'),T(4200,272,85,16,'phantom')],
[C(240,460),C(530,415),C(800,360,'dinar'),C(1080,305),C(1360,250,'sela'),C(1660,195),C(1980,275,'dinar'),C(2300,350),C(2620,290,'sela'),C(2960,230),C(3300,170,'dinar'),C(4020,320),C(4800,210,'maneh')],
[C(4880,210,'dinar')],
[S(370,481,80,24,1.1,1,2.2),S(1880,481,90,24,1.5,1,2.4),S(2740,481,90,24,1.9,1.1,2.5),S(3540,481,90,24,2.2,1.1,2.5),S(4460,481,100,24,2.6,1.1,2.3),S(5060,486,90,24,1.1,1,2)],
[E(2300,356,2260,2400,130,'ayin','flash eye'),E(4000,326,3980,4140,90,'golem','slow certainty')],
[G(850,330,120,100,'Chochmah launches before you think.',{}),G(3000,210,140,120,'The flash is narrow but clean.',{}),G(4640,230,130,110,'Wisdom becomes the door only at speed.',{openExit:true})],
['Chochmah is the joy of no hesitation.','Every booster has a landing, if you trust the line.'],
{fakeCoins:[F(1540,235,'sela','The insight coin was too sharp.'),F(4620,245,'dinar','The flash glittered like treasure, then stabbed.')],trickCoins:[{x:900,y:330,kind:'runner',speed:240,min:820,max:1180},{x:2500,y:300,kind:'panicRunner',speed:340,min:2400,max:2900},{x:3600,y:240,kind:'iceRunner',speed:420,dir:1,min:3500,max:4100},{x:5200,y:250,kind:'fakeRunner',min:5150,max:5450}],trickCoins:[{x:900,y:330,kind:'runner',speed:240,min:820,max:1180},{x:2500,y:300,kind:'panicRunner',speed:340,min:2400,max:2900},{x:3600,y:240,kind:'iceRunner',speed:420,dir:1,min:3500,max:4100},{x:5200,y:250,kind:'fakeRunner',min:5150,max:5450}]});
