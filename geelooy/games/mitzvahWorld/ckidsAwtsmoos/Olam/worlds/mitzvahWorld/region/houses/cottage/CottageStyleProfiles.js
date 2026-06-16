// B"H
/** @file CottageStyleProfiles.js @description Profession-specific cottage style profiles. */
const PROFILES = Object.freeze({
  blacksmith:{ roof:0x5b2b24, smoke:"dark", yard:["anvil","coal_bin","wheel"], windows:2, wealth:.62 },
  baker:{ roof:0xa54b35, smoke:"warm", yard:["flour_sack","barrel","bench"], windows:3, wealth:.55 },
  scribe:{ roof:0x76432b, smoke:"thin", yard:["scroll_crate","bench","lamp_post"], windows:3, wealth:.7 },
  tailor:{ roof:0x87553d, smoke:"thin", yard:["cloth_line","crate","flower_box"], windows:3, wealth:.58 },
  healer:{ roof:0x6d6942, smoke:"herbal", yard:["herb_pot","water_jug","flower_box"], windows:4, wealth:.66 },
  farmer:{ roof:0x8b3e2e, smoke:"soft", yard:["woodpile","bucket","hoe"], windows:2, wealth:.45 },
  home:{ roof:0x7a2f25, smoke:"soft", yard:["woodpile","bucket"], windows:2, wealth:.45 }
});
export function cottageStyleProfile(house = {}) { return PROFILES[house.profession] || PROFILES.home; }
export default cottageStyleProfile;
