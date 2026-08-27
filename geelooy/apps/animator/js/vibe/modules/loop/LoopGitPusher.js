// B"H
/** Git bridge for legacy Vibe; emits intent without forcing destructive commands. */
export const LoopGitPusher = {
  async autoCommit(workspace, changes = []) {
    const detail = { workspace, changes };
    if (globalThis.document && globalThis.CustomEvent) {
      document.dispatchEvent(new CustomEvent('awtsmoos:vibe:auto-commit', { detail }));
    }
    return { workspace, changeCount: changes.length };
  }
};
