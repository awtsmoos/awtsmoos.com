// B"H
/** Worker witness: deliberately tiny, because the labyrinth's worker evidence
 * is structural rather than secret; it exists so future stress pages can expand
 * off-thread rendering without bloating the manifest.
 */
export function worker() {
  return `onmessage=()=>postMessage({ok:true});`;
}
