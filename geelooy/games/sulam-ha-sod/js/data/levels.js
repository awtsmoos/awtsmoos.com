// B"H
/**
 * Chapter 31: the campaign became a staircase of annoyances, each one a more
 * rude teacher. Platforms shatter, vanish, jump upward, rotate sideways, and
 * hide spike geometry; the Awtsmoos makes every later level meaner but legible.
 * @type {Array<object>} scrolling platformer level scrolls.
 */
const L = (name,width,spawn,door,law,platforms,rotatingPlatforms,trickPlatforms,coins,keys,spikes,enemies)=>({name,width,spawn,door,law,platforms,rotatingPlatforms,trickPlatforms,coins,keys,spikes,enemies});
const c = (x,y,kind='perutah')=>({x,y,kind});
export const LEVELS = [
  L('Malchus Gate',2200,{x:60,y:380},{x:2080,y:300,w:44,h:92},'Greed awakens teeth; charity softens stone.',
    [{x:0,y:505,w:430,h:40},{x:520,y:455,w:210,h:24},{x:820,y:405,w:220,h:24},{x:1130,y:350,w:260,h:24},{x:1490,y:420,w:220,h:24},{x:1780,y:365,w:180,h:24},{x:2010,y:405,w:170,h:24},{x:260,y:340,w:150,h:22},{x:620,y:270,w:145,h:22},{x:1040,y:235,w:130,h:22}],
    [{x:455,y:485,w:72,h:16,spin:1.6,throw:300},{x:1365,y:315,w:92,h:16,spin:-1.3,throw:340}],
    [{x:735,y:430,w:70,h:18,kind:'shatter',reform:2.2},{x:1718,y:350,w:60,h:18,kind:'ambush',range:80,jump:74}],
    [c(300,300),c(570,415),c(870,365,'dinar'),c(1180,310),c(1540,380,'sela'),c(1830,325),c(2070,365,'dinar'),c(650,230,'maneh')],
    [{x:1090,y:195}],
    [{x:425,y:486,w:70,h:28,delay:1.2,min:1.4,max:3.8},{x:760,y:442,w:58,h:26,delay:2.1},{x:1390,y:332,w:80,h:28,delay:3.1}],
    [{x:610,y:421,w:36,h:34,min:530,max:720,vx:80,name:'klipah ember',type:'thief'},{x:1510,y:386,w:36,h:34,min:1490,max:1690,vx:100,name:'shadow husk',type:'ayin'}]
  ),
  L('Yesod Bridges',2600,{x:50,y:390},{x:2440,y:165,w:44,h:92},'Looking creates pursuit; stillness reveals warning.',
    [{x:0,y:505,w:320,h:40},{x:430,y:430,w:170,h:22},{x:710,y:365,w:170,h:22},{x:1010,y:300,w:170,h:22},{x:1290,y:235,w:180,h:22},{x:1580,y:310,w:200,h:22},{x:1900,y:250,w:190,h:22},{x:2260,y:300,w:240,h:24},{x:700,y:185,w:140,h:20},{x:1510,y:155,w:130,h:20}],
    [{x:615,y:405,w:82,h:16,spin:-1.8,throw:340},{x:1180,y:275,w:88,h:16,spin:1.2,throw:310},{x:2120,y:330,w:100,h:16,spin:1.9,throw:360}],
    [{x:890,y:335,w:74,h:18,kind:'vanish',reform:1.6},{x:1410,y:210,w:65,h:18,kind:'shatter',reform:2.4},{x:2190,y:275,w:64,h:18,kind:'ambush',range:95,jump:92}],
    [c(462,390),c(746,325,'dinar'),c(1045,260),c(1332,195,'sela'),c(1618,270),c(1940,210,'dinar'),c(2310,260),c(1540,115,'maneh')],
    [{x:760,y:145}],
    [{x:610,y:410,w:80,h:30,delay:1.6,min:1.2,max:3.5},{x:1210,y:214,w:70,h:28,delay:2.7},{x:2100,y:482,w:95,h:30,delay:3.4}],
    [{x:1040,y:266,w:36,h:34,min:1010,max:1180,vx:110,name:'forgetting wind',type:'scroll'},{x:1930,y:216,w:36,h:34,min:1900,max:2090,vx:125,name:'doubt crawler',type:'golem'}]
  ),
  L('Tiferes Trial',3000,{x:60,y:390},{x:2860,y:275,w:44,h:92},'The balanced path is never the richest path.',
    [{x:0,y:505,w:280,h:40},{x:380,y:455,w:140,h:22},{x:650,y:390,w:170,h:22},{x:960,y:330,w:150,h:22},{x:1210,y:260,w:170,h:22},{x:1510,y:360,w:190,h:22},{x:1810,y:430,w:180,h:22},{x:2110,y:365,w:170,h:22},{x:2390,y:305,w:160,h:22},{x:2740,y:395,w:240,h:40}],
    [{x:535,y:430,w:76,h:16,spin:2.1,throw:380},{x:1120,y:300,w:80,h:16,spin:-1.6,throw:340},{x:1710,y:394,w:86,h:16,spin:1.5,throw:330},{x:2570,y:360,w:92,h:16,spin:-2.2,throw:400}],
    [{x:830,y:360,w:76,h:18,kind:'shatter',reform:2},{x:1390,y:246,w:70,h:18,kind:'vanish',reform:1.4},{x:2025,y:338,w:80,h:18,kind:'ambush',range:110,jump:100},{x:2660,y:365,w:70,h:18,kind:'shatter',reform:2.8}],
    [c(405,415,'dinar'),c(690,350),c(1000,290,'sela'),c(1250,220),c(1560,320,'dinar'),c(1850,390),c(2140,325,'sela'),c(2430,265),c(2820,355,'maneh')],
    [{x:1260,y:220}],
    [{x:520,y:485,w:90,h:32,delay:1.1,min:1.1,max:3.2},{x:1120,y:312,w:85,h:28,delay:2.4},{x:1705,y:340,w:90,h:28,delay:2.9},{x:2555,y:486,w:120,h:32,delay:3.6}],
    [{x:670,y:356,w:36,h:34,min:650,max:820,vx:125,name:'red shell',type:'gilgul'},{x:1530,y:326,w:36,h:34,min:1510,max:1700,vx:135,name:'heavy husk',type:'golem'},{x:2760,y:361,w:36,h:34,min:2740,max:2960,vx:145,name:'gate guard',type:'gravity'}]
  ),
  L('Netzach Annoyance Garden',3400,{x:40,y:390},{x:3240,y:220,w:44,h:92},'The honest-looking block is sometimes the rudest demon.',
    [{x:0,y:505,w:260,h:40},{x:360,y:455,w:120,h:22},{x:610,y:405,w:130,h:22},{x:880,y:350,w:120,h:22},{x:1160,y:295,w:130,h:22},{x:1440,y:250,w:130,h:22},{x:1730,y:320,w:140,h:22},{x:2050,y:380,w:140,h:22},{x:2360,y:320,w:130,h:22},{x:2660,y:260,w:130,h:22},{x:3000,y:330,w:260,h:24}],
    [{x:500,y:430,w:74,h:16,spin:2.4,throw:420},{x:1325,y:275,w:70,h:16,spin:-2.1,throw:440},{x:2200,y:350,w:80,h:16,spin:2.7,throw:460}],
    [{x:760,y:380,w:70,h:18,kind:'ambush',range:120,jump:115},{x:1010,y:322,w:62,h:18,kind:'shatter'},{x:1590,y:230,w:78,h:18,kind:'vanish'},{x:1920,y:350,w:66,h:18,kind:'ambush',range:100,jump:105},{x:2860,y:236,w:70,h:18,kind:'shatter'}],
    [c(390,415),c(650,365,'dinar'),c(910,310),c(1200,255,'sela'),c(1465,210),c(1760,280,'dinar'),c(2080,340),c(2390,280,'sela'),c(2680,220),c(3060,290,'maneh')],
    [{x:1458,y:210}],
    [{x:275,y:486,w:75,h:30,delay:.8,min:1,max:2.8},{x:750,y:386,w:95,h:28,delay:1.4},{x:1260,y:276,w:90,h:28,delay:2},{x:1960,y:360,w:80,h:28,delay:2.6},{x:2840,y:486,w:120,h:32,delay:3.2}],
    [{x:620,y:371,w:36,h:34,min:610,max:740,vx:150,name:'platform lawyer',type:'scroll'},{x:1740,y:286,w:36,h:34,min:1730,max:1870,vx:155,name:'staring eye',type:'ayin'},{x:2380,y:286,w:36,h:34,min:2360,max:2490,vx:160,name:'tax imp',type:'thief'}]
  ),
  L('Hod Betrayal Library',3900,{x:60,y:390},{x:3740,y:170,w:44,h:92},'Pages lie, shelves jump, and silence is suspicious.',
    [{x:0,y:505,w:260,h:40},{x:360,y:430,w:110,h:22},{x:610,y:360,w:120,h:22},{x:890,y:290,w:110,h:22},{x:1160,y:220,w:130,h:22},{x:1460,y:305,w:110,h:22},{x:1740,y:385,w:120,h:22},{x:2030,y:315,w:120,h:22},{x:2320,y:245,w:120,h:22},{x:2610,y:175,w:120,h:22},{x:2910,y:260,w:130,h:22},{x:3220,y:335,w:130,h:22},{x:3600,y:260,w:220,h:24}],
    [{x:500,y:400,w:70,h:16,spin:-2.8,throw:470},{x:1320,y:245,w:76,h:16,spin:2.9,throw:490},{x:2190,y:285,w:70,h:16,spin:-3.1,throw:500},{x:3420,y:305,w:90,h:16,spin:2.5,throw:480}],
    [{x:760,y:330,w:72,h:18,kind:'vanish',reform:1.2},{x:1040,y:260,w:68,h:18,kind:'ambush',range:125,jump:130},{x:1580,y:278,w:68,h:18,kind:'shatter',reform:2.8},{x:1890,y:358,w:72,h:18,kind:'vanish',reform:1.1},{x:2470,y:215,w:70,h:18,kind:'ambush',range:130,jump:120},{x:3090,y:235,w:70,h:18,kind:'shatter'}],
    [c(390,390,'dinar'),c(645,320),c(925,250,'sela'),c(1190,180),c(1490,265,'dinar'),c(1770,345),c(2060,275,'sela'),c(2350,205),c(2640,135,'dinar'),c(2940,220),c(3250,295,'sela'),c(3660,220,'maneh')],
    [{x:2630,y:135}],
    [{x:280,y:486,w:90,h:30,delay:.6,min:.9,max:2.2},{x:740,y:340,w:95,h:28,delay:1.2,min:1,max:2.6},{x:1280,y:486,w:100,h:32,delay:1.8},{x:1990,y:296,w:100,h:28,delay:2.1},{x:2760,y:486,w:120,h:32,delay:2.7},{x:3450,y:486,w:120,h:32,delay:3.1}],
    [{x:620,y:326,w:36,h:34,min:610,max:730,vx:170,name:'book bite',type:'gilgul'},{x:1468,y:271,w:36,h:34,min:1460,max:1570,vx:175,name:'gravity footnote',type:'gravity'},{x:2920,y:226,w:36,h:34,min:2910,max:3040,vx:180,name:'angry margin',type:'scroll'}]
  ),
  L('Yesod Rage Stair',4300,{x:50,y:390},{x:4140,y:115,w:44,h:92},'Every safe landing asks for payment one breath later.',
    [{x:0,y:505,w:240,h:40},{x:330,y:455,w:100,h:20},{x:560,y:400,w:100,h:20},{x:800,y:345,w:100,h:20},{x:1040,y:290,w:100,h:20},{x:1280,y:235,w:100,h:20},{x:1530,y:180,w:100,h:20},{x:1800,y:250,w:110,h:20},{x:2070,y:320,w:110,h:20},{x:2340,y:390,w:110,h:20},{x:2640,y:330,w:110,h:20},{x:2920,y:270,w:110,h:20},{x:3220,y:210,w:110,h:20},{x:3520,y:150,w:110,h:20},{x:3860,y:220,w:260,h:24}],
    [{x:450,y:430,w:65,h:15,spin:3.3,throw:520},{x:920,y:320,w:65,h:15,spin:-3.1,throw:520},{x:1680,y:200,w:75,h:15,spin:3.5,throw:560},{x:2520,y:360,w:75,h:15,spin:-3.4,throw:560},{x:3370,y:180,w:80,h:15,spin:3.2,throw:540}],
    [{x:690,y:370,w:58,h:16,kind:'ambush',range:130,jump:140},{x:1160,y:260,w:58,h:16,kind:'shatter',reform:2.5},{x:1410,y:205,w:58,h:16,kind:'vanish',reform:1},{x:1945,y:225,w:62,h:16,kind:'ambush',range:120,jump:140},{x:2220,y:295,w:62,h:16,kind:'shatter'},{x:2800,y:302,w:62,h:16,kind:'vanish',reform:1},{x:3665,y:124,w:64,h:16,kind:'ambush',range:140,jump:150}],
    [c(350,415),c(580,360,'dinar'),c(820,305),c(1060,250,'sela'),c(1300,195),c(1550,140,'dinar'),c(1830,210),c(2100,280,'sela'),c(2370,350),c(2670,290,'dinar'),c(2950,230),c(3250,170,'sela'),c(3550,110),c(3920,180,'maneh')],
    [{x:3540,y:110}],
    [{x:250,y:486,w:80,h:30,delay:.5,min:.8,max:1.9},{x:690,y:486,w:90,h:30,delay:.9,min:.8,max:2.1},{x:1160,y:486,w:95,h:32,delay:1.3},{x:1660,y:486,w:100,h:32,delay:1.7},{x:2200,y:486,w:105,h:32,delay:2.1},{x:2750,y:486,w:110,h:32,delay:2.5},{x:3330,y:486,w:115,h:32,delay:2.9}],
    [{x:815,y:311,w:36,h:34,min:800,max:900,vx:190,name:'stairsnatcher',type:'thief'},{x:1810,y:216,w:36,h:34,min:1800,max:1910,vx:200,name:'reverse cantor',type:'gravity'},{x:3230,y:176,w:36,h:34,min:3220,max:3330,vx:210,name:'final nuisance',type:'ayin'}]
  )
];
