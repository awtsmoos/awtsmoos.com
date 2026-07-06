// B"H
/** @file SoundEffectCatalog.js @description No music here: only short Web Audio effects for action feedback. */
const S=(type,freq,duration,gain=.08,curve="sine")=>Object.freeze({type,freq,duration,gain,curve});
export const SOUND_EFFECTS=Object.freeze({ buy:S("coin",880,.08,.06,"triangle"), sell:S("coin",660,.08,.05,"triangle"), denied:S("lock",110,.12,.07,"sawtooth"), equip:S("cloth",330,.09,.04,"sine"), slash:S("sword",520,.07,.07,"sawtooth"), staffCast:S("staff",392,.16,.05,"sine"), arrowRelease:S("arrow",740,.05,.05,"triangle"), letterImpact:S("spark",1046,.12,.06,"sine"), levelUp:S("level",784,.18,.07,"triangle"), repair:S("hammer",220,.08,.08,"square"), purify:S("purify",988,.2,.06,"sine") });
export function soundEffect(id="equip"){ return SOUND_EFFECTS[id]||SOUND_EFFECTS.equip; }
export default SOUND_EFFECTS;
