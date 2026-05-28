// B"H
import {P,C,S,E,R,T,G,L,F} from '../levelPrimitives.js';
export const level11=L('11 · Daas Hidden Line',6400,{x:60,y:420},P(6160,230,44,90),'Daas is the line between knowing and falling.',
[P(0,505,320,35),P(500,455,115,20),P(780,405,115,20),P(1060,355,120,20),P(1340,305,125,20),P(1640,255,130,20),P(1960,320,145,20),P(2300,390,145,20),P(2640,330,150,20),P(3000,270,150,20),P(3360,210,150,20),P(3740,285,160,20),P(4120,360,160,20),P(4520,300,170,20),P(4920,240,170,20),P(5340,310,180,20),P(5780,270,190,20)],
[R(660,430,80,14,2.5,430),R(2140,365,85,14,-2.7,500),R(3540,260,92,14,3,560),R(5140,285,95,14,-3.1,590)],
[T(910,390,80,16,'phantom'),T(1210,340,80,16,'falseSpike'),T(1510,290,85,16,'ice',{duration:1.15}),T(1820,240,85,16,'booster',{dir:1,boost:940,lift:35}),T(2480,374,85,16,'falseSpike'),T(3180,254,90,16,'ice',{duration:1.2}),T(3940,340,90,16,'booster',{dir:1,boost:980,lift:30}),T(4720,284,95,16,'phantom'),T(5520,294,90,16,'booster',{dir:1,boost:1020,lift:25}),T(2800,374,82,16,'falseSpike'),T(5140,224,90,16,'phantom')],
[C(230,460),C(530,415),C(810,365,'dinar'),C(1090,315),C(1370,265,'sela'),C(1670,215),C(2000,280,'dinar'),C(2340,350),C(2680,290,'sela'),C(3040,230),C(3400,170,'dinar'),C(4160,320),C(4960,200,'sela'),C(5820,230,'maneh')],
[C(5920,230,'dinar')],
[S(360,481,80,24,1.1,1,2.2),S(1880,481,90,24,1.5,1,2.4),S(2840,481,90,24,1.9,1.1,2.5),S(4300,481,90,24,2.2,1.1,2.5),S(5620,481,100,24,2.6,1.1,2.3),S(6040,486,95,24,1.1,1,2)],
[E(2340,356,2300,2440,135,'ayin','knowing eye'),E(4560,266,4560,4700,90,'golem','silent proof')],
[G(1460,250,130,110,'Daas says: not-solid is still information.',{}),G(3900,290,140,120,'The line is hidden but the spacing is fair.',{}),G(5600,230,140,120,'Knowledge opens when the line is followed.',{openExit:true})],
['Daas is not an extra platform; it is a missing one.','The player must learn which rectangles are promises.'],
{fakeCoins:[F(1245,300,'sela','Knowledge glittered falsely.'),F(4780,245,'dinar','The hidden line hid teeth.')],trickCoins:[{x:900,y:330,kind:'runner',speed:240,min:820,max:1180},{x:2500,y:300,kind:'panicRunner',speed:340,min:2400,max:2900},{x:3600,y:240,kind:'iceRunner',speed:420,dir:1,min:3500,max:4100},{x:5200,y:250,kind:'fakeRunner',min:5150,max:5450}],trickCoins:[{x:900,y:330,kind:'runner',speed:240,min:820,max:1180},{x:2500,y:300,kind:'panicRunner',speed:340,min:2400,max:2900},{x:3600,y:240,kind:'iceRunner',speed:420,dir:1,min:3500,max:4100},{x:5200,y:250,kind:'fakeRunner',min:5150,max:5450}]});
