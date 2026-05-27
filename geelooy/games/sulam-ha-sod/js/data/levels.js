// B"H
/**
 * Chapter 2: the ladder stretches beyond the screen. The Awtsmoos speaks
 * wider worlds where each platform is a rung, each enemy a sealed shell,
 * and each key a flash of will cutting a door through concealment.
 * @type {Array<object>} scrolling platformer level scrolls.
 */
export const LEVELS = [
  {
    name:'Malchus Gate', width:2200, spawn:{x:60,y:380}, door:{x:2080,y:300,w:44,h:92},
    platforms:[{x:0,y:505,w:430,h:40},{x:520,y:455,w:210,h:24},{x:820,y:405,w:220,h:24},{x:1130,y:350,w:260,h:24},{x:1490,y:420,w:220,h:24},{x:1780,y:365,w:180,h:24},{x:2010,y:405,w:170,h:24},{x:260,y:340,w:150,h:22},{x:620,y:270,w:145,h:22},{x:1040,y:235,w:130,h:22}],
    coins:[{x:300,y:300},{x:570,y:415},{x:870,y:365},{x:1180,y:310},{x:1540,y:380},{x:1830,y:325},{x:2070,y:365},{x:650,y:230}],
    keys:[{x:1090,y:195}],
    enemies:[{x:610,y:421,w:36,h:34,min:530,max:720,vx:80,name:'klipah ember'},{x:1510,y:386,w:36,h:34,min:1490,max:1690,vx:100,name:'shadow husk'}]
  },
  {
    name:'Yesod Bridges', width:2600, spawn:{x:50,y:390}, door:{x:2440,y:165,w:44,h:92},
    platforms:[{x:0,y:505,w:320,h:40},{x:430,y:430,w:170,h:22},{x:710,y:365,w:170,h:22},{x:1010,y:300,w:170,h:22},{x:1290,y:235,w:180,h:22},{x:1580,y:310,w:200,h:22},{x:1900,y:250,w:190,h:22},{x:2260,y:300,w:240,h:24},{x:700,y:185,w:140,h:20},{x:1510,y:155,w:130,h:20}],
    coins:[{x:462,y:390},{x:746,y:325},{x:1045,y:260},{x:1332,y:195},{x:1618,y:270},{x:1940,y:210},{x:2310,y:260},{x:1540,y:115}],
    keys:[{x:760,y:145}],
    enemies:[{x:1040,y:266,w:36,h:34,min:1010,max:1180,vx:110,name:'forgetting wind'},{x:1930,y:216,w:36,h:34,min:1900,max:2090,vx:125,name:'doubt crawler'}]
  },
  {
    name:'Tiferes Trial', width:3000, spawn:{x:60,y:390}, door:{x:2860,y:275,w:44,h:92},
    platforms:[{x:0,y:505,w:280,h:40},{x:380,y:455,w:140,h:22},{x:650,y:390,w:170,h:22},{x:960,y:330,w:150,h:22},{x:1210,y:260,w:170,h:22},{x:1510,y:360,w:190,h:22},{x:1810,y:430,w:180,h:22},{x:2110,y:365,w:170,h:22},{x:2390,y:305,w:160,h:22},{x:2740,y:395,w:240,h:40}],
    coins:[{x:405,y:415},{x:690,y:350},{x:1000,y:290},{x:1250,y:220},{x:1560,y:320},{x:1850,y:390},{x:2140,y:325},{x:2430,y:265},{x:2820,y:355}],
    keys:[{x:1260,y:220}],
    enemies:[{x:670,y:356,w:36,h:34,min:650,max:820,vx:125,name:'red shell'},{x:1530,y:326,w:36,h:34,min:1510,max:1700,vx:135,name:'heavy husk'},{x:2760,y:361,w:36,h:34,min:2740,max:2960,vx:145,name:'gate guard'}]
  }
];
