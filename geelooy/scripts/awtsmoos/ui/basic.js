//B"H

/**
 * createElement
 * A utility function to create and configure a DOM element with attributes, content, and event listeners.
 *
 * @param {Object} ob - Configuration object to define the element's properties.
 * 
 * @property {string} tag - The HTML tag to create (e.g., "div", "span"). Required.
 * @property {string} [html] - The inner HTML content of the element.
 * @property {Object} [attributes] - Key-value pairs of attributes to set on the element (e.g., { id: "myId", class: "myClass" }).
 * @property {Object} [attr] - Alias for `attributes`.
 * @property {Array} [children] - An array of child elements or strings to append to the created element:
 *   - If an object, it will recursively create a child element using createElement.
 *   - If a string, it will be added as a text node.
 * @property {Object} [on] - Event listeners to attach to the element. Each key is an event type (e.g., "click"), and the value is the handler function.
 * @property {Object} [events] - Alias for `on`.
 *
 * @returns {HTMLElement} - The dynamically created and configured DOM element.
 *
 * @example
 * // Create a button with attributes and an event listener
 * const button = createElement({
 *     tag: "button",
 *     html: "Click Me",
 *     attributes: { id: "myButton", class: "btn" },
 *     on: { click: () => alert("Button clicked!") }
 * });
 * document.body.appendChild(button);
 *
 * @example
 * // Create a container with child elements
 * const container = createElement({
 *     tag: "div",
 *     attributes: { class: "container" },
 *     children: [
 *         { tag: "h1", html: "Hello, World!" },
 *         { 
 *             tag: "button", 
 *             html: "Click Me", 
 *             on: { click: () => alert("Child Button clicked!") }
 *         }
 *     ]
 * });
 * document.body.appendChild(container);
 */
function createElement(ob={}) {
    var {
        tag,
         html,
         attributes,
         attr,
         children,
         on,
         events
        
    } = ob;
    attributes = attr || attributes;
    const element = document.createElement(tag);
    if (html) element.innerHTML = html;
    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            
            element.setAttribute(key, value);
            
        });
    }
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === "object" && child !== null) {
                element.appendChild(createElement(child));
            } else if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            }
        });
    }
    var ev = (on || events);
    if(ev) {
        Object.entries(ev).forEach(([key, value]) => {
            element.addEventListener(key, value);
        });
    }
    Object.entries(ob).forEach(([key,value]) => {
        try {
        element[key] = value;
        } catch(e){}
    })
    return element;
}

function appendElements(parent, elements) {
    elements.forEach(element => parent.appendChild(element));
}

export {
    appendElements,
    createElement
}
