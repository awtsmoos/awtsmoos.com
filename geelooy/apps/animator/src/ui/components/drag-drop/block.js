/* B”H */
export class DragBlock {
  constructor(type, label, data) {
    this.type = type;
    this.label = label;
    this.data = data;
  }

  render() {
    const el = document.createElement('div');
    el.className = 'block-item';
    el.draggable = true;
    el.dataset.blockData = JSON.stringify(this.data);
    el.innerHTML = `
      <div class="block-icon"></div>
      <span class="block-label">${this.label}</span>
    `;
    return el;
  }
}
