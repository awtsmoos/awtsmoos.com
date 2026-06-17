// B"H
export function compactModals(doc = globalThis.document) {
  doc?.documentElement?.classList?.add("awtsmoos-modal-compact-ready");
  return true;
}
export default compactModals;
