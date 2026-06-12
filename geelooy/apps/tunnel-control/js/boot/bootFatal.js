// B"H

/**
 * B"H
 * Chapter 416: Fatal Boot Errors Became Text, Not HTML.
 */
export function showFatalBootError(e) {
  const pre = document.createElement("pre");
  pre.textContent = `B\"H\nControl panel boot failed:\n${e.stack || e.message || String(e)}`;
  document.body.replaceChildren(pre);
}
