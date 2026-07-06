// B"H
/** @file WeaponGenreCatalog.js @description Weapon families are vessels: grip, range, motion, shop, and future trainer gates. */
const G=(label,clip,range,damage,grip,projectile,shopCategory,trainerRequirement=null)=>({label,clip,range,damage,grip,projectile,shopCategory,trainerRequirement});
export const WEAPON_GENRES = Object.freeze({
  hands:G("Hands","punch",1,4,null,null,"Training"),
  knife:G("Knife","stab",1.15,8,"dagger",null,"Blades"), dagger:G("Dagger","stab",1.2,9,"dagger",null,"Blades"),
  shortSword:G("Short Sword","stab",1.55,13,"sword",null,"Blades","sword trainer:1"),
  longSword:G("Long Sword","slash",2.1,20,"sword",null,"Blades","sword trainer:2"),
  greatSword:G("Great Sword","heavy-slash",2.45,28,"greatSword",null,"Blades","sword trainer:3"),
  staff:G("Staff","hands-out",2.4,10,"staff","spark","Staves","staff trainer:1"),
  wand:G("Wand","cast",12,6,"wand","spark","Staves","scribe trainer:1"), stick:G("Stick","slash",1.45,6,"staff",null,"Training"),
  club:G("Club","bash",1.35,11,"club",null,"Blunt"), spear:G("Spear","stab",2.8,18,"spear",null,"Polearms","staff trainer:2"),
  axe:G("Axe","cleave",1.7,19,"axe",null,"Tools"), hammer:G("Hammer","bash",1.55,22,"hammer",null,"Tools"),
  bow:G("Bow","hands-out",22,12,"bow","arrow","Ranged","bow trainer:1"),
  crossbow:G("Crossbow","crossbow-release",26,18,"crossbow","bolt","Ranged","bow trainer:2"),
  hebrewBow:G("Hebrew Letter Bow","hands-out",28,8,"bow","hebrew-letter","Letters","bow trainer:2|scribe trainer:1"),
  sling:G("Sling","sling-release",18,7,"sling","stone","Ranged"), throwingStone:G("Throwing Stone","throw",12,5,"stone","stone","Training"),
  farmingTool:G("Farming Tool","tool-swing",1.6,9,"tool",null,"Tools","farming trainer:1"),
  craftingTool:G("Crafting Tool","tool-swing",1.25,5,"tool",null,"Tools","builder trainer:1"),
  trainingWeapon:G("Training Weapon","training-swing",1.4,4,"sword",null,"Training"),
  holyWeapon:G("Holy Weapon","cast",2,14,"holy","spark","Letters","scribe trainer:2"),
  letterWeapon:G("Letter Weapon","cast",16,10,"letter","hebrew-letter","Letters","scribe trainer:1")
});
export function weaponGenre(key="hands") { return WEAPON_GENRES[key] || WEAPON_GENRES.hands; }
export function weaponGenreKeys(){ return Object.keys(WEAPON_GENRES); }
export default WEAPON_GENRES;
