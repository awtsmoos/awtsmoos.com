
// B"H
import { HTMLGenerator } from '../../ui/HTMLGenerator.js';

export class AutosavePinger {
  static container = null;
  static timeout = null;

  static ping() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'autosave-pinger-mount';
      document.body.appendChild(this.container);
    }

    const schema = {
      tag: 'div',
      attr: { className: 'autosave-indicator anim-pulse' },
      children: [
        { tag: 'span', children: '💾' },
        { tag: 'span', attr: { className: 'text-mono text-8 text-bold' }, children: 'RESHIMU SEALED' }
      ]
    };

    this.container.innerHTML = '';
    this.container.appendChild(HTMLGenerator.generate(schema));

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.container.innerHTML = '';
    }, 2000);
  }
}
