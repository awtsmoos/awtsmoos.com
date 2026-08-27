// B"H
// The controller is now only the doorway; action, binding, and runtime each have their own vessel.
import { rituals } from "../concepts.js";
import { loadPersistedEntries } from "../db.js";
import { normalizeAll } from "../state.js";
import { bootControls } from "../render.js";
import { createWorld } from "../world.js";
import { createFeedback } from "./feedback.js";
import { dom } from "./dom.js";
import { bindGarden } from "./bindings.js";
import { exposeRuntime } from "./runtime.js";
import { refresh, setFilter, setRitual } from "./actions.js";

export function startGarden() {
  const world = createWorld(dom("world"));
  const feedback = createFeedback(world);
  const model = { entries: [], filter: "all", ritual: rituals[0].id, selected: null };
  boot(model, world, feedback);
}

async function boot(model, world, feedback) {
  model.ritual = bootControls(id => setRitual(model, id), filter => setFilter(model, world, filter));
  model.entries = normalizeAll(await loadPersistedEntries());
  bindGarden(model, world, feedback);
  feedback.bind();
  refresh(model, world);
  exposeRuntime(model, world, feedback);
}
