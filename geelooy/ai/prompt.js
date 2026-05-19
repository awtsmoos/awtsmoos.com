//B"H

/**
 * B"H — A small in-page modal vessel for Awtsmoos cockpit prompts.
 *
 * Never uses native `alert()` or `prompt()`. If the shared public-site prompt
 * exists, it delegates there. Otherwise it renders a local glass panel with
 * instructions, links, and a close/confirm action so the user is not trapped in
 * browser chrome while the app is reconnecting.
 */
export class AwtsmoosPrompt {
  /**
   * Opens the best available prompt vessel.
   *
   * @param {Object} options Prompt configuration.
   * @param {boolean} [options.isAlert=false] When true, show alert-style UI.
   * @param {string} [options.headerTxt=""] Message or HTML prompt text.
   * @param {string} [options.defaultValue=""] Default input value.
   * @param {string} [options.placeholderTxt=""] Placeholder/fallback input text.
   * @returns {Promise<string|boolean|null>} User answer, true for alert, or null.
   */
  static async go(options = {}) {
    const shared = globalThis?.AwtsmoosPrompt;
    if (shared?.go && shared !== AwtsmoosPrompt) return await shared.go(options);
    return renderLocalPrompt(options);
  }
}

function renderLocalPrompt(options = {}) {
  return new Promise(resolve => {
    const isAlert = Boolean(options.isAlert);
    const overlay = document.createElement("div");
    overlay.className = "awtsmoos-local-prompt-overlay";
    overlay.innerHTML = `
      <style>
        .awtsmoos-local-prompt-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(2, 8, 18, .72);
          backdrop-filter: blur(8px);
          color: #e8f4ff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .awtsmoos-local-prompt-card {
          width: min(620px, 100%);
          border: 1px solid rgba(99, 179, 237, .28);
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(4, 17, 31, .97), rgba(3, 30, 45, .94));
          box-shadow: 0 24px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08);
          padding: 24px;
        }
        .awtsmoos-local-prompt-card h2 {
          margin: 0 0 12px;
          font-size: 22px;
          letter-spacing: .02em;
        }
        .awtsmoos-local-prompt-body {
          color: rgba(232, 244, 255, .86);
          line-height: 1.55;
          font-size: 15px;
        }
        .awtsmoos-local-prompt-body a { color: #7dd3fc; }
        .awtsmoos-local-prompt-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }
        .awtsmoos-local-prompt-actions button,
        .awtsmoos-local-prompt-actions a {
          appearance: none;
          border: 1px solid rgba(125, 211, 252, .28);
          border-radius: 14px;
          padding: 10px 14px;
          background: rgba(14, 116, 144, .28);
          color: #e0f2fe;
          text-decoration: none;
          font-weight: 700;
          cursor: pointer;
        }
        .awtsmoos-local-prompt-actions .secondary {
          background: rgba(15, 23, 42, .65);
        }
        .awtsmoos-local-prompt-input {
          width: 100%;
          margin-top: 16px;
          box-sizing: border-box;
          border-radius: 14px;
          border: 1px solid rgba(125, 211, 252, .24);
          background: rgba(2, 6, 23, .72);
          color: #e8f4ff;
          padding: 12px 14px;
          font: inherit;
        }
      </style>
      <section class="awtsmoos-local-prompt-card" role="dialog" aria-modal="true" aria-labelledby="awtsmoos-local-prompt-title">
        <h2 id="awtsmoos-local-prompt-title">B"H — Awtsmoos Server Extension Needed</h2>
        <div class="awtsmoos-local-prompt-body">${options.headerTxt || defaultExtensionHelp()}</div>
        ${isAlert ? "" : `<input class="awtsmoos-local-prompt-input" placeholder="${escapeAttr(options.placeholderTxt || "")}" value="${escapeAttr(options.defaultValue || "")}" />`}
        <div class="awtsmoos-local-prompt-actions">
          <a href="/scripts/tricks/extensions/server/" target="_blank" rel="noreferrer">Open extension folder</a>
          <a href="https://github.com/awtsmoos/awtsmoos.com/tree/main/geelooy/scripts/tricks/extensions/server" target="_blank" rel="noreferrer">View source</a>
          <button type="button" data-awts-action="ok">${isAlert ? "Got it" : "OK"}</button>
          <button class="secondary" type="button" data-awts-action="cancel">Close</button>
        </div>
      </section>
    `;

    document.body.appendChild(overlay);
    const input = overlay.querySelector("input");
    input?.focus();

    const finish = value => {
      overlay.remove();
      resolve(value);
    };

    overlay.addEventListener("click", event => {
      const action = event.target?.dataset?.awtsAction;
      if (action === "ok") finish(isAlert ? true : input?.value ?? null);
      if (action === "cancel") finish(null);
    });
    overlay.addEventListener("keydown", event => {
      if (event.key === "Escape") finish(null);
      if (event.key === "Enter" && !isAlert) finish(input?.value ?? null);
    });
  });
}

function defaultExtensionHelp() {
  return `
    <p>The Awtsmoos AI cockpit needs the local <strong>Awtsmoos Server Extension</strong> bridge before ChatGPT requests can flow.</p>
    <p>Load the unpacked extension from <code>geelooy/scripts/tricks/extensions/server</code>, then refresh this page.</p>
  `;
}

function escapeAttr(text) {
  return String(text || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
