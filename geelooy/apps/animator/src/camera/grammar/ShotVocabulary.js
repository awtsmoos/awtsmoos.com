// B"H
import { ShotCategories } from './ShotCategories.js';
import { ShotTypeNames, ALL_SHOT_TYPE_NAMES } from './ShotTypeNames.js';
const z={extremeWideShot:.52,wideShot:.68,longShot:.76,fullShot:.88,mediumFullShot:1,cowboyShot:1.08,mediumShot:1.18,mediumCloseUp:1.38,closeUp:1.62,bigCloseUp:1.88,extremeCloseUp:2.05,insertShot:1.65,detailShot:1.86,macroShot:2.05,twoShot:1.02,threeShot:.9,groupShot:.74,overTheShoulder:1.28,reactionShot:1.45,masterShot:.7,establishingShot:.58,foodInsert:1.48,handsInsert:1.56,comedyWide:.72,dramaticPush:1.45,heroShot:1.22,vulnerabilityShot:1.35,chaosShot:1.05};
const cat=n=>/Shot$/.test(n)&&/(wide|long|full|medium|close|insert|detail|macro|cowboy)/i.test(n)?ShotCategories.distance:/tracking|follow|push|pull|dolly|pan|tilt|whip|crane|boom|arc|orbit|reveal|walk|matchMove/.test(n)?ShotCategories.movement:/angle|eyeLevel|profile|front|back|overhead|under|dutch|birds|worms/i.test(n)?ShotCategories.angle:/reaction|object|food|hands|eyeInsert|mouth|hero|vulnerability|chaos|comedy|dramatic|matchCut|shotReverse/i.test(n)?ShotCategories.editorial:ShotCategories.composition;
export class ShotVocabulary{
 static all(){return ALL_SHOT_TYPE_NAMES.map(n=>this.get(n));}
 static get(name='mediumShot'){const n=ShotTypeNames[name]||name;return this.map[n]||this.map.mediumShot;}
 static has(name){return Boolean(this.map[name]);}
 static map=Object.fromEntries(ALL_SHOT_TYPE_NAMES.map(name=>[name,{name,category:cat(name),defaultZoom:z[name]??1,targetCountRange:thisRange(name),safeMargin:/close|insert|macro/i.test(name)?0.18:0.1,defaultPitch:0,defaultYaw:/profile/i.test(name)?90:/back/i.test(name)?180:30,defaultRoll:/dutch|chaos/i.test(name)?7:0,renderDetailMode:/close|insert|macro/i.test(name)?'high':'normal',useCases:useCases(name)}]));
}
function thisRange(n){if(/two|overTheShoulder/.test(n))return[2,2];if(/three/.test(n))return[3,3];if(/group|wide|master|establish/.test(n))return[2,99];if(/insert|detail|macro|eye|mouth|hands|object|food/.test(n))return[1,2];return[1,1];}
function useCases(n){return n.split(/(?=[A-Z])/).map(s=>s.toLowerCase());}
