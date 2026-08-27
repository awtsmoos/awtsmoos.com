// B"H
// Bindings connect human motion to the garden's hidden engine.
import { fulfill, tend } from "../state.js";
import { dom } from "./dom.js";
import { mutate, plant, relightSelected, seed } from "./actions.js";

export function bindGarden(model, world, feedback) {
  dom("sparkForm").addEventListener("submit", e => {
    e.preventDefault(); feedback.pulse(e.submitter || dom("sparkForm")); plant(model, world);
  });
  dom("plantButton").onclick = e => { feedback.pulse(e.currentTarget); plant(model, world); };
  dom("seedDemo").onclick = e => { feedback.pulse(e.currentTarget); seed(model, world); };
  dom("close").onclick = e => { feedback.pulse(e.currentTarget); dom("detail").close(); };
  dom("tend").onclick = e => { feedback.pulse(e.currentTarget); mutate(model, world, tend); };
  dom("fulfill").onclick = e => { feedback.pulse(e.currentTarget); mutate(model, world, fulfill); };
  dom("relight").onclick = e => { feedback.pulse(e.currentTarget); relightSelected(model, world); };
  dom("remove").onclick = e => { feedback.pulse(e.currentTarget); mutate(model, world, x => ({ ...x, removed: true, updatedAt: Date.now() })); };
  addEventListener("keydown", e => { if (e.key === "Escape") dom("detail").close(); });
}
