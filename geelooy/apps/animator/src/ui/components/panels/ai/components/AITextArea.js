// B"H
export class AITextArea {
  static render() {
    return `<textarea id="ai-prompt-input" class="ai-textarea" style="flex: 1; resize: none; border-radius: 4px; padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); color: var(--text-main); font-family: var(--font-mono); font-size: 0.8rem;" placeholder="Ask the AI Assistant..."></textarea>`;
  }
}