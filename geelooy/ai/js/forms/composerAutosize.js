//B"H

/**
 * Chapter 8: The Composer Grew Like a Lung of Light.
 *
 * The prompt box expands while words gather, then can become a full writing
 * chamber. Its buttons stay in a top toolbar, so attachments no longer crouch
 * under the text like broken glass beneath the throne.
 */
export class ComposerAutosize {
  constructor(textarea, { inputArea = textarea?.closest?.(".input-area") } = {}) {
    this.textarea = textarea;
    this.inputArea = inputArea;
    this.maxHeight = 260;
  }

  mount() {
    if (!this.textarea) return;
    this.ensureChrome();
    this.textarea.addEventListener("input", () => this.resize());
    this.textarea.addEventListener("focus", () => this.inputArea?.classList.add("is-writing"));
    this.textarea.addEventListener("blur", () => !this.textarea.value && this.inputArea?.classList.remove("is-writing"));
    this.resize();
  }

  resize() {
    const el = this.textarea;
    el.style.height = "auto";
    const max = this.inputArea?.classList.contains("is-fullscreen") ? window.innerHeight - 150 : this.maxHeight;
    el.style.height = `${Math.min(max, Math.max(54, el.scrollHeight))}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }

  ensureChrome() {
    if (!this.inputArea || this.inputArea.querySelector(".composer-chrome")) return;
    const bar = document.createElement("div");
    bar.className = "composer-chrome";
    bar.innerHTML = `<span>Composer</span><button type="button" data-compose="min">−</button><button type="button" data-compose="full">⛶</button>`;
    this.inputArea.prepend(bar);
    bar.addEventListener("click", event => this.handleChrome(event));
  }

  handleChrome(event) {
    const action = event.target?.dataset?.compose;
    if (!action) return;
    if (action === "full") this.inputArea.classList.toggle("is-fullscreen");
    if (action === "min") this.inputArea.classList.remove("is-fullscreen", "is-writing");
    this.resize();
  }
}
