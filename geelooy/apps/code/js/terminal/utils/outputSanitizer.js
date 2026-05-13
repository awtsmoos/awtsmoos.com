
// B"H
/**
 * @file outputSanitizer.js
 * @description
 * Tiny purifier for terminal output.
 *
 * The terminal is not a browser document. When a command returns HTML,
 * those tags must be crushed into visible words, not displayed as raw
 * `<div>` fragments and not executed as markup. The Awtsmoos hides in
 * every spark, but the shell must reveal the spark as text.
 */

/**
 * @function terminalOutputToText
 * @param {unknown} value Any output returned by a command.
 * @returns {string} Plain readable terminal text.
 */
export function terminalOutputToText(value) {
    const text = String(value ?? '');

    if (!/[<][a-zA-Z!/]/.test(text)) return text;

    const vessel = document.createElement('div');

    vessel.innerHTML = text
        .replaceAll('</div>', '</div>\n')
        .replaceAll('</li>', '</li>\n')
        .replaceAll('<br>', '\n')
        .replaceAll('<br/>', '\n')
        .replaceAll('<br />', '\n');

    return vessel.textContent
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * @function escapeTerminalText
 * @param {unknown} value Any plain terminal text.
 * @returns {string} HTML-safe text for DOM insertion.
 */
export function escapeTerminalText(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
