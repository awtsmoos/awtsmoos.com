// B"H
import {L,P,C,S,E,R,T,G} from '../levelKit.js';
export default L('04 - - - - · Netzach Garden of Stubborn Teeth',3700,{x:40,y:390},P(3480,220,44,92),'Netzach does not stop; it only becomes more annoying.',
[P(0,505,260,40),P(360,455,120,22),P(610,405,130,22),P(880,350,120,22),P(1160,295,130,22),P(1440,250,130,22),P(1730,320,140,22),P(2050,380,140,22),P(2360,320,130,22),P(2660,260,130,22),P(3000,330,260,24),P(3320,285,170,22)],
[R(500,430,74,16,2.4,420),R(1325,275,70,16,-2.1,440),R(2200,350,80,16,2.7,460)],
[T(760,380,70,18,'ambush',{range:120,jump:115}),T(1010,322,62,18,'shatter'),T(1590,230,78,18,'vanish'),T(1920,350,66,18,'ambush',{range:100,jump:105}),T(2860,236,70,18,'shatter')],
[C(390,415),C(650,365,'dinar'),C(910,310),C(1200,255,'sela'),C(1465,210),C(1760,280,'dinar'),C(2080,340),C(2390,280,'sela'),C(2680,220),C(3060,290,'maneh')],
[C(1458,210)],
[S(275,475,75,30,.8,1,2.8),S(750,386,95,28,1.4),S(1260,276,90,28,2),S(1960,360,80,28,2.6),S(2840,473,120,32,3.2)],
[E(620,371,610,740,150,'scroll','platform lawyer'),E(1740,286,1730,1870,155,'ayin','staring eye'),E(2380,286,2360,2490,160,'thief','tax imp')],
[
 G(700,300,120,150,'Netzach summons another bridge, then insults you.',{platforms:[P(820,300,100,18)],enemies:[E(930,316,900,1030,140,'thief','garden pickpocket')]}),
 G(1880,280,130,140,'A root snaps. The garden grows spikes behind you.',{spikes:[S(1680,473,115,32,.1,.7,1.2),S(1985,362,80,28,.3,.8,1.4)]}),
 G(2910,180,100,150,'The flower-gate blooms only when annoyed enough.',{openExit:true})
]);
