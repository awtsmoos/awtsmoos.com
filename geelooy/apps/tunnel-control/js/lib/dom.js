
// B"H

/**
 * B"H
 * Finds an element by id.
 *
 * In the quiet chamber of the dashboard, every id is a little doorway.
 * This helper knocks gently instead of crashing through the wall, so the
 * interface can keep breathing even when markup is being refactored.
 *
 * @param {string} id Element id without the hash.
 * @returns {HTMLElement|null} The matching element, or null when absent.
 */
export const $ = id => document.getElementById(id);

/**
 * B"H
 * Finds an element by id and logs a useful warning when absent.
 *
 * @param {string} id Element id without the hash.
 * @returns {HTMLElement|null} The matching element, or null.
 */
export function must(id) {
  const el = $(id);
  if (!el) {
    console.warn("[AwtsmoosTunnelControl] Missing element #" + id);
  }
  return el;
}

/**
 * B"H
 * Sets text safely when the target exists.
 *
 * @param {string} id Element id.
 * @param {unknown} value Value to stringify into the node.
 * @returns {boolean} True when written.
 */
export function text(id, value) {
  const el = must(id);
  if (!el) return false;
  el.textContent = String(value ?? "");
  return true;
}

/**
 * B"H
 * Renders JSON safely when the target exists.
 *
 * @param {string} id Element id.
 * @param {unknown} value JSON-serializable value.
 * @returns {boolean} True when written.
 */
export function jsonText(id, value) {
  return text(id, JSON.stringify(value, null, 2));
}

/**
 * B"H
 * Creates a DOM node from a small data object.
 *
 * The Awtsmoos reveals order in small vessels. This creator keeps UI code
 * data-based without forcing feature files to hand-carve every attribute.
 *
 * @param {string} tag Tag name.
 * @param {object} props Attributes, events, dataset, className, text, children.
 * @returns {HTMLElement} Created element.
 */
export function el(tag, props = {}) {
  const node = document.createElement(tag);
  const {
    className,
    text: textValue,
    children,
    dataset,
    on,
    attrs,
    ...rest
  } = props;

  if (className) node.className = className;
  if (textValue !== undefined) node.textContent = String(textValue);

  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined || value === null) continue;
    if (key in node) node[key] = value;
    else node.setAttribute(key, String(value));
  }

  if (dataset) {
    for (const [key, value] of Object.entries(dataset)) {
      node.dataset[key] = String(value);
    }
  }

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === false || value === undefined || value === null) continue;
      node.setAttribute(key, value === true ? "" : String(value));
    }
  }

  if (on) {
    for (const [event, handler] of Object.entries(on)) {
      node.addEventListener(event, handler);
    }
  }

  for (const child of children || []) {
    if (child === undefined || child === null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return node;
}

/**
 * B"H
 * Removes all children and appends new children.
 *
 * @param {HTMLElement} node Parent node.
 * @param {Array<Node|string>} children New children.
 * @returns {HTMLElement} The parent node.
 */
export function replaceChildren(node, children) {
  node.replaceChildren();
  for (const child of children) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}
