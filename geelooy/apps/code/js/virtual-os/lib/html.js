
// B"H
/**
 * @file html.js
 * @description
 * HTML is fire. This file turns the fire into safe readable light.
 */

export function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function htmlToPlainText(value) {
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
