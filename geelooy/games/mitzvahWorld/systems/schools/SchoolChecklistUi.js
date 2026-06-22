// B"H
/**
 * @file SchoolChecklistUi.js
 * @description Chapter 443: the scroll becomes a chip, the chip becomes a
 * doorway, and the player gets the world back before the Awtsmoos.
 */
import { getSchoolProgress, setSchoolDone, schoolSummary } from "./PlayerSchoolProgress.js";
import { injectMobileUiTikkunStyle } from "../mobile/MobileUiTikkunStyle.js?v=compact-school-chip-20260621-bh2";
import { ensureMobilePerformanceOverlay } from "../performance/MobilePerformanceOverlay.js?v=fps-guardian-chip-20260622-bh1";
const ID = "awtsmoosSchoolChecklist";
function isMobile(win = globalThis.window) { return Boolean(win?.matchMedia?.("(max-width: 760px), (pointer: coarse)")?.matches); }
function row(item) { return `<label><input type="checkbox" data-school="${item.id}" ${item.done ? "checked" : ""}/><span><b>${item.title}</b><small>${item.goal}</small></span></label>`; }
function setOpen(panel, open) { panel.classList.toggle("open", Boolean(open)); panel.querySelector(".schoolToggle")?.setAttribute("aria-expanded", String(Boolean(open))); }
function markCleanWorld(doc, mobile) { doc?.body?.classList?.toggle("awtsmoos-world-clean", Boolean(mobile)); }
export function renderSchoolChecklist(doc = globalThis.document, win = globalThis.window) {
  if (!doc) return null;
  injectMobileUiTikkunStyle(doc, ID); ensureMobilePerformanceOverlay(win, doc);
  let panel = doc.getElementById(ID); if (!panel) { panel = doc.createElement("div"); panel.id = ID; doc.body.appendChild(panel); }
  const progress = getSchoolProgress(win), summary = schoolSummary(win), mobile = isMobile(win), wasOpen = panel.classList.contains("open");
  panel.className = mobile ? "schoolChip" : "mitzvahPanel schoolChip"; markCleanWorld(doc, mobile);
  if (!mobile) panel.style.cssText = "position:fixed;right:12px;bottom:86px;z-index:9050;width:auto;max-width:260px;pointer-events:auto;background:transparent;border:0;box-shadow:none;padding:0"; else panel.removeAttribute("style");
  panel.innerHTML = `<button class="schoolToggle" type="button" aria-expanded="false">Schools ${summary.done}/${summary.total}</button><div class="schoolBody"><strong>Starter Schools ${summary.done}/${summary.total}</strong>${progress.map(row).join("")}</div>`;
  setOpen(panel, wasOpen); panel.querySelector(".schoolToggle")?.addEventListener("click", () => setOpen(panel, !panel.classList.contains("open")));
  panel.querySelectorAll("input[data-school]").forEach(input => input.addEventListener("change", () => { setSchoolDone(input.dataset.school, input.checked, win); renderSchoolChecklist(doc, win); }));
  win.__AWTSMOOS_SCHOOL_CHECKLIST__ = progress; win.__AWTSMOOS_SCHOOL_SUMMARY__ = () => schoolSummary(win); return progress;
}
renderSchoolChecklist();
globalThis.window?.addEventListener?.("awtsmoos-worker-world-report", () => renderSchoolChecklist(), { passive:true });
export default renderSchoolChecklist;
