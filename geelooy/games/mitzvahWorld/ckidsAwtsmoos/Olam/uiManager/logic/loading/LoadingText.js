// B"H
/** Text and width writes are centralized to prevent layout storms. */
import { byId, clamp } from "./LoadingDom.js";
export function text(id, value) {
  const node = byId(id), next = value == null ? "" : String(value);
  if (node && node.textContent !== next) node.textContent = next;
}
export function width(id, value) {
  const node = byId(id);
  if (node) node.style.width = `${Math.round(clamp(value))}%`;
}
