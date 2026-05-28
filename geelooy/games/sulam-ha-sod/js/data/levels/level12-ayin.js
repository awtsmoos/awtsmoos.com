// B"H
import {P,C,S,E,R,T,G,L,F} from '../levelPrimitives.js';
export const level12=L('12 · Ayin Empty Platform Trial',6900,{x:60,y:420},P(6660,220,44,90),'Ayin makes absence dangerous and presence suspicious.',
[P(0,505,320,35),P(520,455,110,20),P(820,400,110,20),P(1120,345,115,20),P(1420,290,120,20),P(1740,235,125,20),P(2080,300,140,20),P(2440,365,140,20),P(2800,425,145,20),P(3180,360,150,20),P(3560,295,150,20),P(3940,230,150,20),P(4340,300,160,20),P(4740,370,160,20),P(5160,310,170,20),P(5580,250,170,20),P(6040,320,190,20),P(6420,280,190,20)],
[R(690,430,80,14,2.7,460),R(2260,338,85,14,-3,540),R(3760,272,92,14,3.1,600),R(5840,292,95,14,-3.2,640)],
[T(960,384,80,16,'phantom'),T(1260,329,80,16,'ice',{duration:1.1}),T(1580,274,90,16,'booster',{dir:1,boost:980,lift:25}),T(1900,219,85,16,'falseSpike'),T(2620,349,90,16,'phantom'),T(3400,344,90,16,'ice',{duration:1.25}),T(4140,214,95,16,'booster',{dir:1,boost:1040,lift:30}),T(4960,354,90,16,'falseSpike'),T(5800,234,95,16,'ice',{duration:1.3}),T(6260,304,90,16,'booster',{dir:1,boost:1080,lift:20}),T(3000,404,82,16,'falseSpike'),T(5400,294,90,16,'phantom')],
[C(230,460),C(560,415),C(860,360,'dinar'),C(1160,305),C(1460,250,'sela'),C(1780,195),C(2120,260,'dinar'),C(2480,325),C(2840,385,'sela'),C(3220,320),C(3600,255,'dinar'),C(3980,190),C(4780,330),C(5200,270,'sela'),C(5620,210),C(6080,280,'dinar'),C(6460,240,'maneh')],
[C(6540,240,'dinar')],
[S(350,481,80,24,1,1,2.1),S(1980,481,90,24,1.5,1,2.4),S(3000,481,90,24,1.9,1.1,2.5),S(4540,481,90,24,2.3,1.1,2.4),S(5900,481,100,24,2.6,1.1,2.3),S(6500,486,95,24,1.1,1,2)],
[E(2480,331,2440,2580,130,'gilgul','empty echo'),E(5200,276,5160,5320,160,'ayin','nothing eye')],
[G(1500,230,130,120,'Ayin: the missing floor is the lesson.',{}),G(4080,180,140,120,'Trust the gap, not the rectangle.',{}),G(6200,260,140,120,'Nothingness opens the gate.',{openExit:true})],
['Ayin removes certainty one tile at a time.','The cleanest route has the fewest promises.'],
{fakeCoins:[F(1930,180,'sela','The empty coin was full of teeth.'),F(5000,315,'dinar','Ayin made treasure suspicious.')],trickCoins:[{x:900,y:330,kind:'runner',speed:240,min:820,max:1180},{x:2500,y:300,kind:'panicRunner',speed:340,min:2400,max:2900},{x:3600,y:240,kind:'iceRunner',speed:420,dir:1,min:3500,max:4100},{x:5200,y:250,kind:'fakeRunner',min:5150,max:5450}],trickCoins:[{x:900,y:330,kind:'runner',speed:240,min:820,max:1180},{x:2500,y:300,kind:'panicRunner',speed:340,min:2400,max:2900},{x:3600,y:240,kind:'iceRunner',speed:420,dir:1,min:3500,max:4100},{x:5200,y:250,kind:'fakeRunner',min:5150,max:5450}]});
