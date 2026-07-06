// B"H
import { normalizeWorldProject, serializeWorldProject } from "./StudioState.js";

export const DEFAULT_STORAGE_KEY = "mitzvahWorld.worldStudio.project";

export function saveProjectLocal(project, key = DEFAULT_STORAGE_KEY, storage = globalThis.localStorage) {
  const normalized = normalizeWorldProject(project);
  storage?.setItem?.(key, serializeWorldProject(normalized));
  return { ok:true, key, bytes:serializeWorldProject(normalized).length, project:normalized };
}

export function loadProjectLocal(key = DEFAULT_STORAGE_KEY, storage = globalThis.localStorage) {
  const text = storage?.getItem?.(key);
  if (!text) return { ok:false, reason:"missing" };
  return importProjectJson(text);
}

export function importProjectJson(text) {
  try {
    return { ok:true, project:normalizeWorldProject(JSON.parse(String(text))) };
  } catch (error) {
    return { ok:false, reason:error?.message || String(error) };
  }
}

export function downloadProject(project, filename = "mitzvah-world-project.json", documentRef = globalThis.document) {
  const text = serializeWorldProject(normalizeWorldProject(project));
  if (!documentRef?.createElement || typeof Blob === "undefined" || typeof URL === "undefined") {
    return { ok:true, filename, text, simulated:true };
  }
  const blob = new Blob([text], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = documentRef.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok:true, filename, bytes:text.length };
}

export default { DEFAULT_STORAGE_KEY, saveProjectLocal, loadProjectLocal, importProjectJson, downloadProject };
