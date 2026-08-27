// B"H
/**
 * @file HTMLGenerator.js
 * @description
 * THE BUILDER OF VESSELS (Boneh HaKelim).
 * B"H - Transforms a JSON VNode schema into actual DOM elements.
 * This is the bridge between the pure data world and the physical HTML realm.
 * Every tag is a letter; every attribute, a vowel; every child, a world.
 *
 * Schema format:
 * {
 *   tag: 'div',
 *   attr: { className: 'foo', style: { color: 'red' } },
 *   events: { click: () => {} },
 *   children: 'text' | schema | schema[]
 * }
 */
export class HTMLGenerator {
  static generate(schema) {
    if (!schema) return document.createTextNode('');
    if (typeof schema === 'string' || typeof schema === 'number') {
      return document.createTextNode(String(schema));
    }

    const el = document.createElement(schema.tag || 'div');

    if (schema.attr) {
      for (const [key, value] of Object.entries(schema.attr)) {
        if (key === 'className') {
          el.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(el.style, value);
        } else if (key === 'dataset' && typeof value === 'object') {
          for (const [dk, dv] of Object.entries(value)) el.dataset[dk] = dv;
        } else if (key === 'checked') {
          el.checked = value;
        } else if (key === 'value' && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')) {
          el.value = value;
        } else {
          try { el.setAttribute(key, value); } catch (e) {}
        }
      }
    }

    if (schema.style && typeof schema.style === 'object') {
      Object.assign(el.style, schema.style);
    }

    if (schema.events) {
      for (const [evt, handler] of Object.entries(schema.events)) {
        el.addEventListener(evt, handler);
      }
    }

    if (schema.children !== undefined && schema.children !== null) {
      const kids = Array.isArray(schema.children) ? schema.children : [schema.children];
      for (const kid of kids) {
        if (kid === null || kid === undefined) continue;
        el.appendChild(this.generate(kid));
      }
    }

    return el;
  }
}