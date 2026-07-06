// B"H
/** @file ProceduralHeldMeshCatalog.js @description Compact procedural recipes: blades, grips, bows, tools, letters, and sparks. */
import { weaponStats } from "./WeaponStatCatalog.js";
const C=(kind,dims,material)=>({kind,dims,material});
const blade=(h=.7,w=.055)=>[C("box",{x:w,y:h,z:.025},"silver-blade"),C("box",{x:.22,y:.035,z:.045},"gold-guard"),C("cylinder",{r:.03,h:.18},"leather-grip"),C("sphere",{r:.04},"pommel")];
const pole=(h=1.2,tip="wood")=>[C("cylinder",{r:.027,h},"wood-grain"),C("sphere",{r:.055},tip)];
const bow=(hebrew=false)=>[C("arc",{w:.62,h:1.05,thick:.025},"cedar-bow"),C("line",{h:.95},hebrew?"glow-string":"bow-string"),...(hebrew?[C("text",{size:.16,letters:"אבגד"},"hebrew-glow")]:[])];
export const HELD_MESH_RECIPES = Object.freeze({
  hands:{ parts:[C("sphere",{r:.045},"hand-aura")] }, knife:{ parts:blade(.34,.035) }, dagger:{ parts:blade(.38,.04) }, shortSword:{ parts:blade(.7,.055) }, longSword:{ parts:blade(.96,.06) }, greatSword:{ parts:blade(1.18,.085) },
  staff:{ parts:pole(1.35,"warm-light") }, wand:{ parts:[C("cylinder",{r:.018,h:.48},"polished-wood"),C("sphere",{r:.045},"spark-crystal")] }, stick:{ parts:pole(.9,"wood") }, club:{ parts:[C("cylinder",{r:.045,h:.58},"heavy-wood"),C("cloth",{wraps:3},"cloth-wrap")] },
  spear:{ parts:[...pole(1.28,"wood"),C("cone",{r:.07,h:.22},"silver-blade")] }, axe:{ parts:[...pole(.82,"wood"),C("wedge",{x:.22,y:.24,z:.05},"iron-head")] }, hammer:{ parts:[...pole(.7,"wood"),C("box",{x:.28,y:.14,z:.14},"iron-head")] },
  bow:{ parts:bow(false) }, crossbow:{ parts:[C("box",{x:.42,y:.12,z:.08},"cedar-stock"),C("arc",{w:.72,h:.32,thick:.025},"bow-limb"),C("line",{w:.68},"bow-string")] }, hebrewBow:{ parts:bow(true) }, sling:{ parts:[C("line",{h:.42},"leather-cord"),C("cloth",{w:.18,h:.08},"leather-pouch")] }, throwingStone:{ parts:[C("sphere",{r:.055},"river-stone")] },
  farmingTool:{ parts:[...pole(.82,"wood"),C("wedge",{x:.2,y:.12,z:.04},"iron-hoe")] }, craftingTool:{ parts:[C("cylinder",{r:.018,h:.32},"wood-grip"),C("box",{x:.04,y:.16,z:.03},"iron-chisel")] }, trainingWeapon:{ parts:blade(.62,.045).map(p=>({...p,material:p.material.includes("blade")?"padded-cloth":p.material})) },
  holyWeapon:{ parts:[...blade(.76,.06),C("text",{size:.12,letters:"מצוה"},"holy-engraving")] }, letterWeapon:{ parts:[...pole(.72,"hebrew-glow"),C("text",{size:.18,letters:"א"},"hebrew-glow")] }, hebrewProjectile:{ parts:[C("text",{size:.22},"hebrew-glow"),C("trail",{length:.7},"spark-trail")] }
});
export function heldMeshRecipe(itemIdOrGenre) { const key=weaponStats(itemIdOrGenre)?.proceduralRecipe || itemIdOrGenre; return HELD_MESH_RECIPES[key] || HELD_MESH_RECIPES.shortSword; }
export default HELD_MESH_RECIPES;
