// B"H
/** @file MerchantInventoryRuntime.js @description Merchants carry runtime equipment and clothing through the shared peruta economy. */
import { WEAPON_STATS, weaponList } from "../../equipment/runtime/WeaponStatCatalog.js";
import { CLOTHING_STATS } from "../../gear/runtime/ClothingStatCatalog.js";
const byGenre=(...genres)=>weaponList().filter(w=>genres.includes(w.genre)).map(w=>w.id);
const MERCHANTS={
  blacksmith:{label:"Blacksmith",markup:1.05,sellRate:1,categories:["Blades","Blunt","Tools"],items:[...byGenre("knife","dagger","shortSword","longSword","greatSword","axe","hammer","spear"),"builderHammer"]},
  tailor:{label:"Tailor",markup:1,sellRate:1,categories:["Clothes"],items:["blackHat","velvetYarmulka","roundGlasses","longCoat","whiteShirt","darkPants","leatherShoes","simpleBelt","workGloves"]},
  scribe:{label:"Scribe",markup:.95,sellRate:1.05,categories:["Letters","Holy"],items:[...byGenre("hebrewBow","holyWeapon","letterWeapon","wand")]},
  bowyer:{label:"Bowyer",markup:1.1,sellRate:.95,categories:["Ranged"],items:[...byGenre("bow","crossbow","sling","throwingStone","hebrewBow")]},
  farmer:{label:"Farmer",markup:.9,sellRate:1,categories:["Tools","Animals"],items:[...byGenre("farmingTool","stick","sling")]},
  carpenter:{label:"Carpenter",markup:1,sellRate:1,categories:["Tools","Furniture"],items:[...byGenre("craftingTool","hammer","staff")]},
  trainer:{label:"Trainer",markup:.85,sellRate:.75,categories:["Training"],items:[...byGenre("hands","trainingWeapon","stick","throwingStone")]},
  animalSeller:{label:"Animal Seller",markup:1.2,sellRate:.85,categories:["Animals"],items:[]}, bookSeller:{label:"Book Seller",markup:1,sellRate:1,categories:["Books"],items:[]},
  furnitureSeller:{label:"Furniture Seller",markup:1.15,sellRate:.8,categories:["Furniture"],items:[]}, foodSeller:{label:"Food Seller",markup:.9,sellRate:.7,categories:["Food"],items:[]}
};
export function merchantProfile(id="blacksmith"){ return { id, supply:1, demand:1, regionMultiplier:1, ...(MERCHANTS[id]||MERCHANTS.blacksmith) }; }
export function merchantItems(id="blacksmith"){ const m=merchantProfile(id); return m.items.map(itemId=>({ id:itemId, ...(WEAPON_STATS[itemId]||CLOTHING_STATS[itemId]||{}), merchantId:id })); }
export function merchantTypes(){ return Object.keys(MERCHANTS); }
export default { merchantProfile, merchantItems, merchantTypes };
