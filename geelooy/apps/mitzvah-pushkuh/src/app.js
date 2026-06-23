// B"H
// The app breathes: collect a hachlata, save it, reveal its chosen light.
import { createPushkuhCanvas } from "./canvas.js";
import { demoEntries, loadEntries, makeEntry, saveEntries, templates } from "./state.js";
import { render, renderTemplates } from "./render.js";

const form = document.getElementById("depositForm");
const clearButton = document.getElementById("clearButton");
const titleInput = document.getElementById("titleInput");
const pushkuh = createPushkuhCanvas(document.getElementById("pushkuhCanvas"));
let entries = loadEntries();

if (!entries.length) entries = demoEntries();
renderTemplates(templates, title => { titleInput.value = title; titleInput.focus(); });
pushkuh.seed(entries);
render(entries);
exposeTestHooks();

form.addEventListener("submit", event => {
  event.preventDefault();
  const entry = makeEntry(readForm());
  entries = [entry, ...entries.filter(item => !item.demo)];
  saveEntries(entries);
  render(entries);
  pushkuh.drop(entry);
  form.reset();
});

clearButton.addEventListener("click", () => {
  entries = [];
  saveEntries(entries);
  pushkuh.seed(entries);
  render(entries);
});

function readForm() {
  return {
    title: titleInput.value, type: document.getElementById("typeInput").value,
    status: document.getElementById("statusInput").value,
    visibility: document.getElementById("visibilityInput").value,
    intensity: document.getElementById("intensityInput").value,
    note: document.getElementById("noteInput").value
  };
}

function exposeTestHooks() {
  window.mitzvahPushkuh = {
    version: "2.0.0", getEntries: () => entries,
    addDemoPublic() {
      const entry = makeEntry({ title: "Help another Yid with joy", type: "Chesed", status: "Fulfilled", visibility: "Profile", intensity: 5, note: "A test profile spark." });
      entries = [entry, ...entries.filter(item => !item.demo)];
      saveEntries(entries); render(entries); pushkuh.drop(entry); return entry;
    }
  };
}
