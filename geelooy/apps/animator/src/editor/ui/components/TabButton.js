/* B”H */
export class TabButton {
  static render(tab, isActive) {
    return `
      <button data-tab="${tab}" class="tab-btn ${isActive ? 'active' : ''}">${tab}</button>
    `;
  }
}
