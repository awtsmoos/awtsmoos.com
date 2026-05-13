
// B"H
/**
 * @file outputSanitizer.js
 * @description
 * The terminal receives raw sparks. Some arrive as HTML. This makes them plain.
 */

export function terminalOutputToText(value) {
    const text = String(value ?? '');

    if (!/[<][a-zA-Z!/]/.test(text)) return text;

    const vessel = document.createElement('div');
    vessel.innerHTML = text
        .replaceAll('</div>', '</div>\n')
        .replaceAll('<br>', '\n')
        .replaceAll('<br/>', '\n')
        .replaceAll('<br />', '\n');

    return vessel.textContent.replace(/\n{3,}/g, '\n\n').trim();
}

export function escapeTerminalText(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '<')
        .replaceAll('>', '>');
}
