// B"H
import {P,C,S,E,R,T,G,L,F} from '../levelPrimitives.js';
export const level10=L('10 · Keter Crown Switchback',5900,{x:60,y:420},P(5660,170,44,90),'Keter looks simple until each safe thing asks a second question.',
[P(0,505,340,35),P(520,450,120,20),P(800,390,120,20),P(1080,330,120,20),P(1360,270,130,20),P(1660,210,130,20),P(1980,290,150,20),P(2320,360,150,20),P(2660,420,150,20),P(3020,350,160,20),P(3380,280,160,20),P(3740,210,160,20),P(4120,290,170,20),P(4500,370,170,20),P(4900,300,180,20),P(5300,240,190,20)],
[R(680,425,80,14,2.4,420),R(2140,335,85,14,-2.7,480),R(3920,260,92,14,3,540),R(5120,270,95,14,-3.1,560)],
[T(940,374,80,16,'falseSpike'),T(1220,314,80,16,'ice',{duration:1.1}),T(1520,254,85,16,'booster',{dir:1,boost:900,lift:30}),T(1840,194,80,16,'phantom'),T(2500,344,85,16,'falseSpike'),T(3200,334,90,16,'ice',{duration:1.25}),T(3560,264,90,16,'booster',{dir:1,boost:960,lift:30}),T(4320,274,95,16,'vanish',{reform:1}),T(4700,354,90,16,'booster',{dir:1,boost:980,lift:20}),T(5520,224,90,16,'falseSpike'),T(2940,404,80,16,'phantom'),T(5120,284,88,16,'falseSpike')],
[C(240,460),C(555,410),C(835,350,'dinar'),C(1120,290),C(1400,230,'sela'),C(1700,170),C(2020,250,'dinar'),C(2360,320),C(2700,380,'sela'),C(3060,310),C(3420,240,'dinar'),C(3780,170),C(4540,330),C(4940,260,'sela'),C(5340,200,'maneh')],
[C(5460,200,'dinar')],
[S(380,481,80,24,1.1,1,2.2),S(1880,481,90,24,1.5,1,2.4),S(2860,481,90,24,1.9,1.1,2.5),S(4040,481,90,24,2.2,1.1,2.5),S(5200,481,100,24,2.6,1.1,2.3),S(5660,486,90,24,1.1,1,2)],
[E(2660,386,2660,2800,120,'thief','crown thief'),E(4540,336,4500,4660,150,'gravity','crown reverser')],
[G(1460,220,130,110,'Keter says: the normal rectangle may be a crown of teeth.',{}),G(3500,220,140,120,'The crown throws only those who stand still.',{}),G(5340,200,140,120,'The crown opens upward.',{openExit:true})],
['Keter is readable but unforgiving.','The false platform is identical until touched.'],
{fakeCoins:[F(970,335,'sela','The crown coin was an accusation.'),F(5560,185,'maneh','Keter turned treasure into teeth.')],trickCoins:[{x:900,y:330,kind:'runner',speed:240,min:820,max:1180},{x:2500,y:300,kind:'panicRunner',speed:340,min:2400,max:2900},{x:3600,y:240,kind:'iceRunner',speed:420,dir:1,min:3500,max:4100},{x:5200,y:250,kind:'fakeRunner',min:5150,max:5450}],trickCoins:[{x:900,y:330,kind:'runner',speed:240,min:820,max:1180},{x:2500,y:300,kind:'panicRunner',speed:340,min:2400,max:2900},{x:3600,y:240,kind:'iceRunner',speed:420,dir:1,min:3500,max:4100},{x:5200,y:250,kind:'fakeRunner',min:5150,max:5450}]});
