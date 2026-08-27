// B"H
// New sparks are born here, then handed to the garden.
import { paths, templates } from "../concepts.js";
import { clean, deadline } from "./helpers.js";
import { normalize } from "./normalize.js";

export function createEntry(form, ritualId) {
  const now = Date.now();
  return normalize({ id: crypto.randomUUID(), title: clean(form.title) || "Hidden spark", note: clean(form.note), type: form.type,
    visibility: form.visibility, status: "Accepted", ritual: ritualId, intensity: Number(form.intensity || 3), createdAt: now,
    updatedAt: now, deadline: deadline(form.time, now), visits: 0, demo: false, tendedAt: null, history: [] });
}
export function seedEntries() {
  const ids = ["seed", "lantern", "star", "flame", "well"];
  return templates.map((title, i) => createEntry({ title, note: i % 2 ? "A starter spark for testing the garden." : "",
    type: paths[i % paths.length], visibility: i % 3 ? "Private" : "Invitation", time: i % 2 ? "7d" : "none", intensity: 2 + (i % 4)
  }, ids[i % ids.length])).map(e => ({ ...e, demo: true, status: e.type === "Tzedakah" ? "Fulfilled" : e.status }));
}
