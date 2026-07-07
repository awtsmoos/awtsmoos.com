// B"H
import JourneyRegion from "./JourneyRegion.js";
export const MASAI_REGIONS = Object.freeze([
  new JourneyRegion({ id:"gate", name:"Broken Gate", start:0, end:.14, mood:"quiet departure", symbol:"leaving first Mitzrayim" }),
  new JourneyRegion({ id:"forest", name:"Beautiful Forest", start:.14, end:.34, mood:"first freedom", symbol:"merchav that becomes narrow" }),
  new JourneyRegion({ id:"valley", name:"Wide Valley", start:.34, end:.55, mood:"sudden breadth", symbol:"new ascent" }),
  new JourneyRegion({ id:"cliffs", name:"Cliff Trail", start:.55, end:.76, mood:"effort", symbol:"avodah as climbing" }),
  new JourneyRegion({ id:"summit", name:"Summit Horizon", start:.76, end:1, mood:"joyful not finished", symbol:"מהלך ולא עומד" })
]);
export function regionAt(t) { return MASAI_REGIONS.find(r => r.contains(t)) || MASAI_REGIONS.at(-1); }
