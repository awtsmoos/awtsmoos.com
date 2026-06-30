// B"H
export function createCommandHistory() {
  const lines = ['Awtsmoos Command online. Type help.'];
  return { push:text => lines.push(String(text ?? '')), clear:() => lines.splice(0, lines.length), lines:() => [...lines] };
}
/** B"H: Every command becomes a remembered footprint in the terminal snow. */
