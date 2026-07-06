// B"H
/** @file IconCatalog.js @description Icons speak first; text is only a whisper after the vessel is seen. */
export const ICONS=Object.freeze({ wallet:"🟡", buy:"➕", sell:"➖", repair:"🛠️", upgrade:"⬆️", locked:"🔒", owned:"✅", level:"✦", sword:"🗡️", staff:"杖", bow:"🏹", arrow:"➵", health:"❤", stamina:"◆", attack:"⚔", defense:"⛨", speed:"↗", focus:"✺", trade:"¤", rarity:"✧", condition:"◐", damage:"⚡", range:"⌁", weight:"▰", crit:"✸", block:"⬟", sound:"🔊", mute:"🔇" });
export function icon(key="level"){ return ICONS[key]||"•"; }
export function iconNode(key,value=null,state="neutral"){ return { icon:icon(key), key, value, state, text:value==null?"":String(value) }; }
export default ICONS;
