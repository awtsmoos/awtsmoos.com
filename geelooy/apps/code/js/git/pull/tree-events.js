// B"H
/**
 * @file tree-events.js
 * Chapter 6: the hand touches a directory, and every child spark answers.
 * Selection flows downward like Speech into matter, exact and reversible.
 */

/**
 * B"H - Binds checkbox behavior for the selective pull tree.
 * @param {HTMLElement} rootElement Dialog/root containing pull tree controls.
 */
export function bindPullTreeEvents(rootElement) {
    const tree = rootElement.querySelector('#git-pull-tree');
    if (!tree) return;

    tree.querySelectorAll('input[data-pull-dir-check]').forEach(input => {
        input.addEventListener('change', () => toggleDirectory(tree, input));
    });

    rootElement.querySelector('#git-pull-select-all')?.addEventListener('click', () => setAll(tree, true));
    rootElement.querySelector('#git-pull-select-none')?.addEventListener('click', () => setAll(tree, false));
}

function toggleDirectory(tree, input) {
    const dir = input.dataset.pullDirCheck;
    const holder = tree.querySelector(`[data-pull-dir="${cssEscape(dir)}"]`);
    if (!holder) return;
    holder.querySelectorAll('input[type="checkbox"]').forEach(child => {
        child.checked = input.checked;
    });
}

function setAll(tree, checked) {
    tree.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = checked;
    });
}

function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, '\\$&');
}
