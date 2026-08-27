// B"H
// Runtime exposure proves the garden without making the user inspect internals.
import { tend } from "../state.js";
import { exposeGarden } from "./expose.js";
import { dom } from "./dom.js";
import { mutate, plant, seed } from "./actions.js";

export function exposeRuntime(model, world, feedback) {
  exposeGarden({
    version: "8.3.1-finer-split-cosmic",
    getEntries: () => model.entries,
    seedGameWorld: () => seed(model, world),
    plantTestSpark: title => plant(model, world, title || "Verified garden spark"),
    tendFirstSpark: () => tendFirst(model, world),
    visualFeedbackTest: () => { feedback.pulse(dom("plantButton")); return feedback.count(); }
  });
}
function tendFirst(model, world) {
  const e = model.entries.find(x => !x.removed);
  if (e) { model.selected = e; mutate(model, world, tend); }
}
