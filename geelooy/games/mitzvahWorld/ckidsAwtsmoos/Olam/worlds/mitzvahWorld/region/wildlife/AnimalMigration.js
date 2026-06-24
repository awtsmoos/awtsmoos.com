// B"H
/** AnimalMigration: seasonal memory as a cheap constructor plus pure helpers. */
const ROUTES=Object.freeze({deer:[[-120,80],[30,120],[150,20]],goat:[[80,-120],[140,-40],[60,80]],bird:[[-220,140],[0,180],[230,120]],cow:[[-60,-30],[-30,20],[20,-10]]});
export function migrationRoute(species){return ROUTES[species]||[[0,0],[35,25],[-35,45]];}
export function migrationTarget(species,season='spring'){const r=migrationRoute(species),i={spring:0,summer:1,fall:2,winter:r.length-1}[season]??0,[x,z]=r[Math.min(r.length-1,i)];return{x,z,species,season};}
export function migrationPressure(weather={},needs={}){return(weather.drought?.6:0)+(needs.thirst>.7?.25:0)+(needs.hunger>.75?.25:0);}
export class AnimalMigration{constructor(){this.records=[];}remember(group,route,weight=1){const row={group,route,weight,at:Date.now()};this.records.push(row);return row;}summary(){return{records:this.records.length,routes:[...new Set(this.records.map(r=>r.route))],groups:[...new Set(this.records.map(r=>r.group))]};}}
export default AnimalMigration;
