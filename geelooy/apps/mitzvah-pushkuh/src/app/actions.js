// B"H
// Actions are the hands of the garden: plant, tend, remember, relight.
import { rituals } from "../concepts.js";
import { savePersistedEntries } from "../db.js";
import { createEntry, normalizeAll, relight, seedEntries, tend } from "../state.js";
import { clearForm, formValues, render, renderDetail } from "../render.js";
import { dom } from "./dom.js";

export function setRitual(model, id) {
  model.ritual = id;
  const r = rituals.find(x => x.id === id);
  dom("ritualPrompt").textContent = `${r?.name || "Ritual"}: ${r?.story || "Plant when ready."}`;
}
export function setFilter(model, world, filter) { model.filter = filter; refresh(model, world); }
export function refresh(model, world) { render(model.entries, model.filter, id => open(model, world, id)); world.setEntries(model.entries); }
export async function persist(model, world) { model.entries = normalizeAll(model.entries); await savePersistedEntries(model.entries); refresh(model, world); }
export function plant(model, world, title) { if (title) dom("title").value = title; const entry = createEntry(formValues(), model.ritual); model.entries = [entry, ...model.entries]; world.plant(entry); dom("plantButton").classList.add("mega-pop"); clearForm(); persist(model, world); return entry; }
export async function seed(model, world) { model.entries = normalizeAll([...seedEntries(), ...model.entries.filter(e => !e.demo)]); model.entries.slice(0, 4).forEach(e => world.plant(e)); await persist(model, world); }
export function open(model, world, id) { model.selected = model.entries.find(e => e.id === id); if (!model.selected) return; model.selected = tend(model.selected); model.entries = model.entries.map(e => e.id === model.selected.id ? model.selected : e); renderDetail(model.selected); dom("detail").showModal(); persist(model, world); }
export function mutate(model, world, fn) { if (!model.selected) return; model.entries = model.entries.map(e => e.id === model.selected.id ? fn(e) : e); model.selected = model.entries.find(e => e.id === model.selected.id); if (model.selected && !model.selected.removed) { renderDetail(model.selected); world.plant(model.selected); } else dom("detail").close(); persist(model, world); }
export function relightSelected(model, world) { if (!model.selected) return; const next = relight(model.selected); model.entries = [next, ...model.entries]; world.plant(next); dom("detail").close(); persist(model, world); }
