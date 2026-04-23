
/* B”H */

/**
 * @class HTMLGenerator
 * @description
 * The 'Ma'amar' (Utterance) Engine. 
 * Just as the world was created with ten utterances, this class takes 
 * abstract JSON data and speaks it into physical DOM reality. It is the 
 * conduit through which the 'Will' of the code becomes the 'Action' 
 * of the interface.
 */
export class HTMLGenerator {
  /**
   * Transforms a JSON schema into a manifest DOM tree.
   * 
   * @param {Object|string} schema - The blueprint of the vessel.
   * @returns {Node} The physical element.
   */
  static generate(schema) {
    if (typeof schema === 'string') {
      return document.createTextNode(schema);
    }

    if (!schema || !schema.tag) {
      const div = document.createElement('div');
      div.dataset.error = "Invalid Schema";
      return div;
    }

    const el = document.createElement(schema.tag);

    if (schema.attr) {
      Object.entries(schema.attr).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'style' && typeof value === 'object') {
          Object.assign(el.style, value);
        } else {
          el.setAttribute(key, value);
        }
      });
    }

    if (schema.events) {
      Object.entries(schema.events).forEach(([type, fn]) => {
        el.addEventListener(type, fn);
      });
    }

    if (schema.children) {
      const children = Array.isArray(schema.children) ? schema.children : [schema.children];
      children.forEach(child => {
        if (child) el.appendChild(this.generate(child));
      });
    }

    return el;
  }
}
