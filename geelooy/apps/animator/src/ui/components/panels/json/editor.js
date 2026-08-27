/* B”H */
export class JSONPanel {
  constructor(state) {
    this.state = state;
  }

  render() {
    const charData = JSON.stringify(this.state.get('character'), null, 2);
    return `
      <div class="json-panel">
        <h3>Raw Essence (JSON)</h3>
        <textarea id="json-input" class="json-textarea">${charData}</textarea>
        <button id="json-apply-btn" class="btn">Inject Data</button>
      </div>
    `;
  }

  attach(container) {
    container.querySelector('#json-apply-btn').addEventListener('click', () => {
      const input = container.querySelector('#json-input').value;
      try {
        const data = JSON.parse(input);
        this.state.set('character', data);
      } catch (e) {
        alert('Invalid JSON: The Awtsmoos rejects this offering.');
      }
    });
  }
}
