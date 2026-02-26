
// B"H
/**
 * @file html-generator.js
 * @brief The Universal Forge of Physical Elements.
 */

/**
 * Transforms an abstract data vessel into a breathing HTMLElement.
 * @param {object|string|number} config - The spiritual intent. Default tag is 'div'.
 * @returns {HTMLElement|Text} The physical manifestation.
 */
export const HTML = (config) => {
    if (config === null || config === undefined) {
        return document.createTextNode('');
    }
    
    if (typeof config === 'string' || typeof config === 'number') {
        return document.createTextNode(String(config));
    }

    if (config instanceof Node) {
        return config;
    }

    const element = document.createElement(config.tag || 'div');

    for (const [key, val] of Object.entries(config)) {
        if (key === 'tag' || key === 'children' || key === 'ref') continue;

        if (key.startsWith('on') && typeof val === 'function') {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, val);
        } else if (key === 'style' && typeof val === 'object') {
            Object.assign(element.style, val);
        } else if (key === 'dataset' && typeof val === 'object') {
            Object.assign(element.dataset, val);
        } else if (key === 'className' || key === 'class') {
            element.className = val;
        } else if (key === 'attributes' && typeof val === 'object') {
            for (const [attr, attrVal] of Object.entries(val)) {
                element.setAttribute(attr, attrVal);
            }
        } else if (key === 'html') {
            element.innerHTML = val;
        } else if (key === 'text') {
            element.textContent = val;
        } else {
            element[key] = val;
        }
    }

    if (Array.isArray(config.children)) {
        config.children.forEach(childIntent => {
            if (childIntent) {
                const childElement = HTML(childIntent);
                if (childElement) element.appendChild(childElement);
            }
        });
    }

    if (typeof config.ref === 'function') {
        config.ref(element);
    }

    return element;
};
