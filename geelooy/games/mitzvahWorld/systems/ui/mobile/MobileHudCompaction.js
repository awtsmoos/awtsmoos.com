// B"H
export function compactHud(doc = globalThis.document) {
  doc?.documentElement?.classList?.add("awtsmoos-ui-compact-ready");
  const topLeft = doc?.querySelector?.("#mitzvahTopLeft");
  if (topLeft) topLeft.dataset.awtsmoosCompact = "true";
  return Boolean(topLeft);
}
export default compactHud;
