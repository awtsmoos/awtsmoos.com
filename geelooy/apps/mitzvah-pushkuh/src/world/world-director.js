// B"H
// The director chooses atmosphere and interest without shouting.
import { pulse } from "./wave.js";
export function createWorldDirector() {
  let weather = "dust", beat = 0, interest = { x: .5, y: .5 };
  function update(t, entries = []) {
    beat = pulse(t * .05, entries.length, .5, .5); weather = beat > .72 ? "rain" : "dust";
    if (entries.length) interest = { x: .25 + (entries.length % 7) * .08, y: .38 + (entries.length % 5) * .06 };
    return { weather, beat, interest };
  }
  function eventName() { return beat > .9 ? "festival" : beat < .12 ? "quiet" : "garden"; }
  return { update, eventName };
}
