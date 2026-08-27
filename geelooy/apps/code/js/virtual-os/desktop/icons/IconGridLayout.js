
// B"H
/**
 * @file IconGridLayout.js
 * @description
 * Default desktop icon layout.
 */

/**
 * @function defaultIconPosition
 * @param {number} index Icon index.
 * @returns {{x:number,y:number}} Position.
 */
export function defaultIconPosition(index) {
    const col = index % 6;
    const row = Math.floor(index / 6);
    return {
        x: 18 + col * 102,
        y: 18 + row * 104
    };
}

/**
 * @function ensureIconPositions
 * @param {object} state Desktop state.
 * @param {object[]} apps Apps.
 * @returns {void}
 */
export function ensureIconPositions(state, apps) {
    state.icons = state.icons && typeof state.icons === 'object' ? state.icons : {};

    apps.forEach((app, index) => {
        if (!state.icons[app.id]) {
            state.icons[app.id] = defaultIconPosition(index);
        }
    });
}
