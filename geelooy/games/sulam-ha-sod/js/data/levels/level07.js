// B"H
import {L,P,C,S,E,R,T,G} from '../levelKit.js';
export default L('07 - - - - · Chesed Overflow Cistern',4900,{x:45,y:390},P(4680,210,44,92),'Chesed gives too much, then asks where you put it.',
[P(0,505,280,40),P(380,455,130,22),P(660,405,130,22),P(960,355,130,22),P(1260,305,130,22),P(1560,255,130,22),P(1880,320,140,22),P(2200,385,140,22),P(2520,330,140,22),P(2850,275,140,22),P(3180,220,140,22),P(3520,285,140,22),P(3890,350,260,24),P(4230,300,180,24),P(4520,285,150,22)],
[R(540,430,80,16,2.2,430),R(1100,330,80,16,-2.7,490),R(1740,275,80,16,2.9,520),R(2380,360,85,16,-3,540),R(3360,250,90,16,2.7,520)],
[T(810,380,74,18,'ambush',{range:130,jump:125}),T(1420,280,74,18,'vanish'),T(2030,350,74,18,'shatter'),T(2700,305,74,18,'ambush',{range:130,jump:140}),T(3700,320,80,18,'vanish',{reform:.9}),T(4380,270,76,18,'shatter')],
[C(410,415),C(690,365,'dinar'),C(990,315),C(1290,265,'sela'),C(1590,215),C(1910,280,'dinar'),C(2230,345),C(2550,290,'sela'),C(2880,235),C(3210,180,'dinar'),C(3550,245),C(3930,310,'sela'),C(4270,260,'maneh')],
[C(3210,180)],
[S(300,473,90,32,.7,.8,2),S(920,473,100,32,1.2),S(1480,473,105,32,1.6),S(2140,473,110,32,2),S(2840,473,115,32,2.4),S(3660,473,125,32,2.9)],
[E(970,321,960,1090,175,'thief','overflow collector'),E(1890,286,1880,2020,185,'ayin','kindness watcher'),E(3185,186,3180,3320,195,'gilgul','generous slime')],
[
 G(620,320,130,150,'Chesed overflows: coins appear, and so do thieves.',{coins:[C(760,340,'dinar'),C(790,320,'sela')],enemies:[E(820,371,790,910,170,'thief','charity auditor')]}),
 G(1760,210,130,170,'Too much kindness becomes stepping stones over nothing.',{platforms:[P(1755,235,90,18),P(1860,255,90,18)]}),
 G(3020,150,130,160,'The cistern pours a secret key upward.',{keys:[C(3360,180)],spikes:[S(3330,473,125,32,.15,.6,1.2)]}),
 G(4100,220,130,160,'The blessing opens the exit, but the floor asks repayment.',{openExit:true,spikes:[S(4200,473,120,32,.1,.6,1.1)]})
]);
