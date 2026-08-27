// B"H

/**
 * B"H
 * Chapter 383: Collapse Memory Became A Tiny Scroll.
 */
export function rememberCollapsed(id, value) {
  try {
    localStorage.setItem("awtsmoos.panel.collapsed." + id, value ? "1" : "0");
  } catch (e) {}
}

export function readCollapsed(id) {
  try {
    return localStorage.getItem("awtsmoos.panel.collapsed." + id) === "1";
  } catch (e) {
    return false;
  }
}
