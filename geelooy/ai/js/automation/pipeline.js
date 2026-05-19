//B"H
/**
 * Guarded automation loop: assistant completion may become the next user turn,
 * but only through limits, delays, loop guards, and a visible switch.
 */
export class AutomationPipeline {
  constructor({ settingsStore, getSettings, sendPrompt, report }) {
    this.settingsStore = settingsStore;
    this.getSettings = getSettings;
    this.sendPrompt = sendPrompt;
    this.report = report || (() => {});
    this.turns = 0;
    this.busy = false;
    this.lastReply = "";
  }

  reset() {
    this.turns = 0;
    this.busy = false;
    this.lastReply = "";
    this.report("automation reset");
  }

  async afterAssistantReply(replyText = "") {
    const settings = this.getSettings();
    if (!settings.enabled) return this.report("automation off");
    if (this.busy) return this.report("automation busy guard held");
    if (this.turns >= Number(settings.maxTurns || 0)) return this.report("max turns reached");
    if (this.isRepeating(replyText)) return this.report("loop guard stopped repeated reply");
    this.busy = true;
    this.turns += 1;
    this.lastReply = replyText;
    this.report(`automation turn ${this.turns}/${settings.maxTurns}`);
    await sleep(Number(settings.delayMs || 0));
    try { await this.sendPrompt(settings.prompt || "continue"); }
    catch (error) {
      this.report(`automation error: ${error.message}`);
      if (settings.stopOnError) this.settingsStore.save({ enabled: false });
    } finally { this.busy = false; }
  }

  isRepeating(text) {
    const a = String(text || "").trim().slice(-500);
    const b = String(this.lastReply || "").trim().slice(-500);
    return Boolean(a && b && a === b);
  }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
