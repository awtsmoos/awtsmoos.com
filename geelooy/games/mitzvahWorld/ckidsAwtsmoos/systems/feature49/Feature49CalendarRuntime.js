// B"H
/**
 * Feature49CalendarRuntime
 * Shabbos, holidays, festivals, children growing, and time-of-day changes are
 * calculated as cheap state snapshots. No perpetual DOM animation, no waste.
 */
import { mutateFeature49State } from './Feature49State.js';
export function shabbosPrepState(minutesToSunset = 120) {
  return { phase: minutesToSunset < 20 ? 'candles-soon' : minutesToSunset < 90 ? 'final-prep' : 'ordinary-prep', shopMode: minutesToSunset < 45 ? 'closing' : 'open', at: Date.now() };
}
export function holidayTransformation(holiday = 'sukkos') {
  const styles = { sukkos:['sukkah','lulav-market','outdoor-meals'], chanukah:['menorahs','oil','night-songs'], purim:['costumes','gifts','megillah'], pesach:['cleaning','matzah','questions'] };
  return { holiday, decorations: styles[holiday] || ['lanterns','songs'], at: Date.now() };
}
export function triggerFestival(id = 'village_kindness_day', achievement = 'community_project') {
  return mutateFeature49State(s => { s.festivals ||= []; s.festivals.unshift({ id, achievement, startedAt: Date.now() }); s.festivals = s.festivals.slice(0, 16); return s; });
}
export function ageChildren(years = 1) {
  return mutateFeature49State(s => { s.children ||= {}; for (const id of Object.keys(s.children)) s.children[id].age = (s.children[id].age || 0) + years; return s; });
}
export function registerChild(id = 'child_1', age = 8) {
  return mutateFeature49State(s => { s.children ||= {}; s.children[id] = { id, age, registeredAt: Date.now() }; return s; });
}
export default { shabbosPrepState, holidayTransformation, triggerFestival, ageChildren, registerChild };
