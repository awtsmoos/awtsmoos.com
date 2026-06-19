
// B"H
export class HUDMessageText {
  static render(message) {
    return `
      <div class="hud-message" style="background: rgba(10,10,15,0.85); padding: 1rem 2rem; border: 1px solid var(--accent-primary); color: var(--accent-primary); font-family: var(--font-mono); font-size: 0.8rem; border-radius: 8px; box-shadow: 0 0 20px var(--accent-glow);">
        ${message.toUpperCase()}
      </div>
    `;
  }
}
