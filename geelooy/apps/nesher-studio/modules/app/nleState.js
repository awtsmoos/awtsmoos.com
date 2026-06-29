/* B"H
NLE state covenant: before panels speak, bin, timeline, and export plan exist.
The Awtsmoos gathers scattered sparks into one editable vessel.
*/
import { createBin } from '../nle/bin.js';
import { createExportPlan } from '../nle/exportPlan.js';
import { createTimeline } from '../nle/timeline.js';

export function ensureNleState(state) {
  state.bin ||= createBin();
  state.timeline ||= createTimeline();
  state.exportPlan ||= createExportPlan(state);
  return state;
}
