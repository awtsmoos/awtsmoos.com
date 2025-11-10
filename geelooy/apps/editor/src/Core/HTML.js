// B"H
/**
 * HTML Generation Utility
 * Creates DOM elements from JavaScript object descriptions.
 */
export const HTML = {
    /**
     * Creates an HTML element based on a configuration object.
     * @param {object} config - The configuration object.
     * @param {string} config.tag - The HTML tag name (e.g., 'div', 'button').
     * @param {string} [config.id] - The element's ID.
     * @param {(string|string[])} [config.class] - CSS class name(s).
     * @param {string} [config.text] - Text content for the element.
     * @param {object} [config.style] - Inline CSS styles { key: value }.
     * @param {object} [config.attrs] - HTML attributes { key: value }.
     * @param {object} [config.on] - Event listeners { eventName: handlerFunction }.
     * @param {(object|object[])} [config.children] - Child element configurations.
     * @returns {HTMLElement} The created HTML element.
     */
    create(config) {
        let el;

        if (config instanceof Node) {
            return config;
        }
        if (typeof config === 'string') {
            return document.createTextNode(config);
        }
        if (!config || !config.tag) {
            console.warn('HTML.create: Invalid config', config);
            return document.createDocumentFragment();
        }

        el = document.createElement(config.tag);

        if (config.id) el.id = config.id;
        
        // ** FIX: Correctly handle space-separated class strings **
        if (config.class) {
            let classes = [];
            if (Array.isArray(config.class)) {
                classes = config.class;
            } else if (typeof config.class === 'string') {
                classes = config.class.split(' '); // Split the string by spaces
            }
            el.classList.add(...classes.filter(Boolean)); // Filter out any empty strings from multiple spaces
        }

        if (config.text !== undefined && config.text !== null) {
            el.textContent = config.text;
        }
        if (config.style) {
            Object.assign(el.style, config.style);
        }
        if (config.attrs) {
            for (const [key, value] of Object.entries(config.attrs)) {
                el.setAttribute(key, value);
            }
        }
        if (config.on) {
            for (const [event, handler] of Object.entries(config.on)) {
                if (typeof handler === 'function') {
                    el.addEventListener(event, handler);
                }
            }
        }
        
        if (config.children) {
            const children = Array.isArray(config.children) ? config.children : [config.children];
            children.forEach(childConfig => {
                if (childConfig) {
                    const childEl = this.create(childConfig);
                    el.appendChild(childEl);
                }
            });
        }

        return el;
    },


    /**
     * Clears all child nodes from an element.
     * @param {HTMLElement} element - The element to clear.
     */
    clear(element) {
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    },

    /**
     * Adds one or more elements to a parent.
     * @param {HTMLElement} parent - The parent element.
     * @param {(HTMLElement|HTMLElement[])} elements - The element(s) to add.
     */
    add(parent, elements) {
        if (!parent) return;
        const elsToAdd = Array.isArray(elements) ? elements : [elements];
        elsToAdd.forEach(el => {
            if (el) parent.appendChild(el);
        });
    },

    /**
     * Finds an element by ID. Simple wrapper.
     * @param {string} id
     * @returns {HTMLElement | null}
     */
    id(id) {
        return document.getElementById(id);
    }
};

// Example Usage:
/*
const myButton = HTML.create({
    tag: 'button',
    id: 'my-btn',
    class: ['btn', 'btn-primary'],
    text: 'Click Me',
    style: { backgroundColor: 'blue', color: 'white' },
    attrs: { 'data-value': '123' },
    on: {
        click: () => console.log('Button clicked!')
    },
    children: [
        { tag: 'i', class: 'icon-save' } // Example child
    ]
});
document.body.appendChild(myButton);
*/