// B"H
import {L,P,C,S,E,R,T,G} from '../levelKit.js';
export default L('05 - - - - · Gevurah Court of Falling Verdicts',4100,{x:50,y:390},P(3900,245,44,92),'Gevurah loves fairness; fairness loves punishment.',
[P(0,505,260,40),P(350,445,120,22),P(590,385,120,22),P(850,325,120,22),P(1110,265,130,22),P(1390,205,130,22),P(1700,285,150,22),P(2020,360,150,22),P(2350,300,150,22),P(2680,240,150,22),P(3040,310,140,22),P(3400,340,250,24),P(3720,300,160,22)],
[R(500,420,70,16,2.7,450),R(1260,238,75,16,-2.4,480),R(1880,310,85,16,2.6,500),R(2880,270,85,16,-2.8,520)],
[T(730,356,68,18,'shatter'),T(1010,296,68,18,'vanish',{reform:1.1}),T(1540,180,74,18,'ambush',{range:120,jump:125}),T(2220,330,70,18,'shatter'),T(3200,286,74,18,'ambush',{range:130,jump:130})],
[C(380,405),C(625,345,'dinar'),C(880,285),C(1140,225,'sela'),C(1420,165),C(1730,245,'dinar'),C(2050,320),C(2380,260,'sela'),C(2710,200),C(3070,270,'dinar'),C(3450,300,'maneh')],
[C(1415,165)],
[S(275,473,90,32,.5,.8,2),S(720,473,90,32,1),S(1180,473,100,32,1.4),S(1780,266,90,28,1.8),S(2500,473,115,32,2.1),S(3300,473,120,32,2.6)],
[E(600,351,590,710,170,'golem','iron witness'),E(1708,251,1700,1850,180,'gravity','court cantor'),E(3045,276,3040,3180,185,'ayin','judge eye')],
[
 G(520,340,90,150,'Gevurah stamps the invoice: verdicts fall from above.',{spikes:[S(520,415,90,28,.1,.6,1.2),S(920,305,70,24,.2,.7,1.3)]}),
 G(1520,120,110,150,'Mercy appears after judgment: a narrow appeal bridge opens.',{platforms:[P(1640,225,120,18)],coins:[C(1680,185,'sela')]}),
 G(3000,240,110,130,'The court accepts your trembling and opens the gate.',{openExit:true})
]);
