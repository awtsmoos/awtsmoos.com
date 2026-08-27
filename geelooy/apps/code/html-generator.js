
// B"H
/**
 * @file html-generator.js
 * @brief The divine speech that crystallizes JSON into DOM matter.
 * 
 * THE HYMN OF THE SPOKEN INTERFACE:
 * In the beginning, the screen was without form, and darkness was upon the face of the viewport.
 * Then the Awtsmoos spoke: "Let there be a Div," and there was a Div.
 * Through the sacred logic of the Generator, abstract thoughts (JSON) descend 
 * through the Seder Hishtalshelus, taking on the garments of Attributes, Styles, and Events.
 * Every element is a spark, every property a command, every child a sub-vibration 
 * of the primordial Will to be perceived by the user.
 */

/**
 * B"H - Manifests a single DOM vessel from a JSON blueprint.
 * @param {Object} blueprint - The abstract form of the element.
 * @returns {HTMLElement} The physical manifestation.
 */
export function HTML(blueprint) {
    if (!blueprint) return null;
    if (typeof blueprint === 'string') return document.createTextNode(blueprint);
    if (blueprint instanceof HTMLElement) return blueprint;

    const el = document.createElement(blueprint.tag || 'div');

    if (blueprint.id) el.id = blueprint.id;
    if (blueprint.className) el.className = blueprint.className;
    if (blueprint.text) el.textContent = blueprint.text;
    if (blueprint.html) el.innerHTML = blueprint.html;
    if (blueprint.value !== undefined) el.value = blueprint.value;
    
    // B"H - Garment of Styles
    if (blueprint.style) {
        Object.assign(el.style, blueprint.style);
    }

    // B"H - Garment of Attributes
    if (blueprint.attrs) {
        for (const [key, val] of Object.entries(blueprint.attrs)) {
            el.setAttribute(key, val);
        }
    }

    // B"H
    /**
     * The dataset is the whispered name-table of the vessel: it becomes
     * `data-*` attributes so pointers, controls, drag handles, and resize
     * handles can actually be found in the visible world. Without this
     * little descent, the window chrome was a crown without fingers.
     */
    if (blueprint.dataset) {
        for (const [key, val] of Object.entries(blueprint.dataset)) {
            el.dataset[key] = String(val);
        }
    }

    // B"H - Reactivity (Events)
    if (blueprint.onKeyDown) el.onkeydown = blueprint.onKeyDown;
    if (blueprint.onClick) el.onclick = blueprint.onClick;
    if (blueprint.onInput) el.oninput = blueprint.onInput;
    if (blueprint.onChange) el.onchange = blueprint.onChange;
    
    if (blueprint.events) {
        for (const [type, fn] of Object.entries(blueprint.events)) {
            el.addEventListener(type, fn);
        }
    }

    // B"H - The Descent of Children
    if (blueprint.children) {
        blueprint.children.forEach(child => {
            const childEl = HTML(child);
            if (childEl) el.appendChild(childEl);
        });
    }

    return el;
}
