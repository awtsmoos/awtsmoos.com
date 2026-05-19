//B"H
/**
 * Builds the visible kill-switch and knobs for the automation pipeline.
 */
export class AutomationPanel {
  constructor({ root, store, onChange }) {
    this.root = root;
    this.store = store;
    this.onChange = onChange;
    this.settings = store.load();
    this.render();
  }

  render() {
    this.root.innerHTML = `
      <h2>Automation Pipeline</h2>
      ${field("enabled", "Enable auto-continue", "checkbox", this.settings.enabled)}
      ${field("maxTurns", "Max turns", "number", this.settings.maxTurns)}
      ${field("delayMs", "Delay ms", "number", this.settings.delayMs)}
      <label class="automation-field">Prompt
        <input data-auto="prompt" value="${attr(this.settings.prompt)}">
      </label>
      <div class="automation-status" id="automation-status">automation off</div>`;
    this.root.querySelectorAll("[data-auto]").forEach(input => {
      input.addEventListener("change", () => this.capture());
      input.addEventListener("input", () => input.dataset.auto === "prompt" && this.capture());
    });
  }

  capture() {
    const next = {};
    this.root.querySelectorAll("[data-auto]").forEach(input => {
      next[input.dataset.auto] = input.type === "checkbox" ? input.checked : cast(input.value);
    });
    this.settings = this.store.save(next);
    this.onChange?.(this.settings);
  }

  getSettings() { return this.settings; }

  report(text) {
    const status = this.root.querySelector("#automation-status");
    if (status) status.textContent = text;
  }
}

function field(name, label, type, value) {
  const checked = type === "checkbox" && value ? "checked" : "";
  const val = type === "checkbox" ? "" : `value="${attr(value)}"`;
  return `<label class="automation-field">${label}<input data-auto="${name}" type="${type}" ${val} ${checked}></label>`;
}
function cast(value) { return /^\d+$/.test(String(value)) ? Number(value) : value; }
function attr(value) { return String(value ?? "").replaceAll('"', "&quot;"); }
