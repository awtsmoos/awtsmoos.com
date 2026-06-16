// B"H
/**
 * @file AnimalMaterialIntent.js
 * @description Solid non-transparent animal materials with richer fur/skin
 * intent, combat stats, and regression-proof opacity metadata.
 */
const SPECIES = Object.freeze({
  fox:{ hp:180, armor:.18, evasion:.18, flightEvasion:0, fur:"foxfur", repeat:[3.6,1.8], tint:0xffffff, roughness:.92 },
  rabbit:{ hp:95, armor:.08, evasion:.42, flightEvasion:0, fur:"rabbitfur", repeat:[2.8,1.35], tint:0xffffff, roughness:.95 },
  deer:{ hp:260, armor:.22, evasion:.24, flightEvasion:0, fur:"deerfur", repeat:[3.1,1.55], tint:0xffffff, roughness:.88 },
  goat:{ hp:240, armor:.28, evasion:.16, flightEvasion:0, fur:"goatfur", repeat:[3.0,1.6], tint:0xffffff, roughness:.94 },
  cow:{ hp:520, armor:.34, evasion:.06, flightEvasion:0, fur:"cowhide", repeat:[2.7,1.3], tint:0xffffff, roughness:.86 },
  frog:{ hp:120, armor:.12, evasion:.35, flightEvasion:0, fur:"frogskin", repeat:[2.4,1.2], tint:0xffffff, roughness:.78 },
  bird:{ hp:150, armor:.14, evasion:.38, flightEvasion:.42, fur:"birdfeather", repeat:[2.8,1.6], tint:0xffffff, roughness:.9 }
});
const COLORS = Object.freeze({ eye:0x050303, claw:0x17110d, hoof:0x11100d, horn:0xc0b08a, beak:0xe1a32f, muzzle:0xf1dfbf, belly:0xf0e2c6, chest:0xf6e6c9, sock:0x15110e, tailTip:0xf8efd8, earInner:0xe8b6a7, wing:0x718aa6, featherBand:0xd7cf94, frogSpot:0x275422, frogBelly:0xd6dfa0, beard:0xd8ceb1, nose:0x22130f, hoofShine:0x2a261e });
function spec(species) { return SPECIES[species] || SPECIES.rabbit; }
function color(name, fallback = 0xffffff) { return COLORS[name] || fallback; }
function solid(intent = {}) { return Object.assign({ transparent:false, opacity:1, depthWrite:true, depthTest:true, alphaTest:0, opacitySeal:true }, intent); }
export function animalMaterialIntent(species, profile = {}) { const s = spec(species), rep = s.repeat; return solid({ name:`${species}_opaque_high_detail_body_fur_material`, kind:"standard", color:s.tint, roughness:s.roughness, metalness:0, texture:{ kind:"fur", name:profile.fur || s.fur, size:512, repeatX:rep[0], repeatY:rep[1] }, animalBody:true, multiMaterialRoot:true, furDirection:"nose-to-tail", anatomicalNoise:true }); }
export function attachmentMaterialIntent(kind, species = "rabbit") {
  if (kind === "eye") return solid({ kind:"basic", color:color("eye"), name:`${species}_wet_black_eye_material` });
  if (kind === "muzzle") return solid({ kind:"lambert", color:color("muzzle"), name:`${species}_soft_muzzle_material` });
  if (kind === "nose") return solid({ kind:"standard", color:color("nose"), roughness:.72, name:`${species}_dark_nose_material` });
  if (kind === "belly") return solid({ kind:"lambert", color:species === "frog" ? color("frogBelly") : color("belly"), name:`${species}_belly_patch_material` });
  if (kind === "chest") return solid({ kind:"lambert", color:color("chest"), name:`${species}_chest_patch_material` });
  if (kind === "sock") return solid({ kind:"lambert", color:color("sock"), name:`${species}_dark_sock_material` });
  if (kind === "tailTip") return solid({ kind:"lambert", color:color("tailTip"), name:`${species}_tail_tip_material` });
  if (kind === "earInner") return solid({ kind:"lambert", color:color("earInner"), name:`${species}_ear_inner_material` });
  if (kind === "claw") return solid({ kind:"standard", color:color("claw"), roughness:.7, name:`${species}_claw_material` });
  if (kind === "hoof") return solid({ kind:"standard", color:color("hoof"), roughness:.62, name:`${species}_hoof_material` });
  if (kind === "horn") return solid({ kind:"standard", color:color("horn"), roughness:.78, name:`${species}_horn_material` });
  if (kind === "beak") return solid({ kind:"standard", color:color("beak"), roughness:.58, name:"bird_beak_material" });
  if (kind === "wing") return solid({ kind:"standard", color:color("wing"), roughness:.9, name:"bird_wing_feather_material", texture:{ kind:"fur", name:"birdfeather", size:384, repeatX:2.2, repeatY:1.1 } });
  if (kind === "featherBand") return solid({ kind:"lambert", color:color("featherBand"), name:"bird_feather_band_material" });
  if (kind === "frogSpot") return solid({ kind:"lambert", color:color("frogSpot"), name:"frog_raised_spot_material" });
  if (kind === "beard") return solid({ kind:"standard", color:color("beard"), roughness:.98, name:"goat_beard_material", texture:{ kind:"fur", name:"goatfur", size:384, repeatX:1.2, repeatY:2.4 } });
  return solid({ kind:"lambert", color:0xffffff, name:`${species}_${kind}_material` });
}
export function healthMaterialIntent(hostile) { return { bg:solid({ kind:"basic", color:0x120000, name:"animal_health_bg" }), fg:solid({ kind:"basic", color:hostile ? 0xff2020 : 0x39d353, name:"animal_health_fg" }) }; }
export function animalCombatStats(species = "rabbit", data = {}) { const s = spec(species); const hp = Number.isFinite(Number(data.hp)) ? Number(data.hp) : s.hp; return { maxHealth:hp, armor:s.armor, evasion:s.evasion, flightEvasion:s.flightEvasion, minHitsToKill:species === "bird" ? 5 : species === "fox" ? 6 : species === "cow" ? 9 : 4, rewardScalar:species === "cow" ? 2.4 : species === "bird" ? 1.35 : 1 }; }
export default animalMaterialIntent;
