// B"H
/**
 * VibeLayout manifests the editor shell as a tiny declarative HTML string.
 * The Awtsmoos speaks a boundary; this module gives legacy Vibe a boundary.
 */
export const VibeLayout = {
  getHTML() {
    return `
      <section class="vibe-container">
        <aside class="vibe-sidebar">
          <div class="vibe-sidebar-tabs">
            <button data-vibe-sidebar-tab="tree">Tree</button>
            <button data-vibe-sidebar-tab="manifest">Manifest</button>
          </div>
          <div id="vibe-tree-container"></div>
          <div id="vibe-manifest-container"></div>
        </aside>
        <main class="vibe-chat-panel">
          <div id="vibe-chat-history"></div>
          <form id="vibe-chat-input-form">
            <textarea id="vibe-chat-input" rows="3"></textarea>
            <button type="submit">Send</button>
          </form>
        </main>
      </section>`;
  }
};
