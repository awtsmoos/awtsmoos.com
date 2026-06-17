// B"H
import { getSchoolProgress, setSchoolDone, schoolSummary } from "./PlayerSchoolProgress.js";
function row(item) { return `<label style="display:block;margin:4px 0"><input type="checkbox" data-school="${item.id}" ${item.done ? "checked" : ""}/> <b>${item.title}</b><br/><small>${item.goal}</small></label>`; }
export function renderSchoolChecklist(doc = globalThis.document, win = globalThis.window) {
  if (!doc) return null;
  let panel = doc.getElementById("awtsmoosSchoolChecklist");
  if (!panel) { panel = doc.createElement("div"); panel.id = "awtsmoosSchoolChecklist"; panel.className = "mitzvahPanel"; panel.style.cssText = "position:fixed;right:12px;bottom:86px;z-index:9050;max-width:330px;max-height:42vh;overflow:auto;pointer-events:auto"; doc.body.appendChild(panel); }
  const progress = getSchoolProgress(win), summary = schoolSummary(win);
  panel.innerHTML = `<strong>Starter Schools ${summary.done}/${summary.total}</strong>${progress.map(row).join("")}`;
  panel.querySelectorAll("input[data-school]").forEach(input => input.addEventListener("change", () => { setSchoolDone(input.dataset.school, input.checked, win); renderSchoolChecklist(doc, win); }));
  win.__AWTSMOOS_SCHOOL_CHECKLIST__ = progress;
  win.__AWTSMOOS_SCHOOL_SUMMARY__ = () => schoolSummary(win);
  return progress;
}
renderSchoolChecklist();
globalThis.window?.addEventListener?.("awtsmoos-worker-world-report", () => renderSchoolChecklist(), { passive:true });
export default renderSchoolChecklist;
