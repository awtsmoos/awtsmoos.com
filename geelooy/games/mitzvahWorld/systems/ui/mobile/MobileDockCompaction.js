// B"H
export function compactDock(doc = globalThis.document) {
  const bottom = doc?.querySelector?.("#mitzvahBottomCenter");
  if (bottom) bottom.dataset.awtsmoosCompactDock = "true";
  return Boolean(bottom);
}
export default compactDock;
