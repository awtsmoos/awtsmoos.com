// B"H
import { HTMLGenerator } from './HTMLGenerator.js';

/**
 * @class Component
 * @description
 * THE BASE VESSEL (Kli HaYesod).
 * B"H - The abstract parent of all UI components. It provides:
 * - mount(el): render into DOM, then call onMount()
 * - update(el): re-render in place
 * - render(): override this in subclasses to return a VNode schema
 * - onMount(): override for post-mount side effects
 */
export class Component {
  constructor(state, props = {}) {
    this.state = state;
    this.props = props;
    this.element = null;
  }

  render() {
    return { tag: 'div', children: 'Empty Component' };
  }

  onMount() {}

  mount(container) {
    if (!container) return;
    const schema = this.render();
    this.element = HTMLGenerator.generate(schema);
    container.appendChild(this.element);
    this.onMount();
    return this.element;
  }

  update(container) {
    if (!container) return;
    const schema = this.render();
    const newEl = HTMLGenerator.generate(schema);
    container.innerHTML = '';
    container.appendChild(newEl);
    this.element = newEl;
    this.onMount();
  }
}