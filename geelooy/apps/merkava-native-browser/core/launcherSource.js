// B"H

/**
 * B"H
 * Tiny C subset launcher for the current Awtsmoos PE compiler.
 *
 * The deeper C runtime is emitted beside it as source. This launcher proves the
 * Windows x64 PE path now produces a double-clickable artifact while the native
 * browser runtime grows into the full OpenGL/WebGL body.
 */
export function buildLauncherC() {
  return `import "kernel32.dll" ExitProcess;\nint main() { return 0; }\n`;
}
