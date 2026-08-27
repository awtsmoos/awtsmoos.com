//B"H
/** Gates page fallback automation so only final replies schedule one continuation. */
export class AutomationContinuationGate {
  constructor() { this.sent = new Map(); }

  canSchedule({ conversationId, replyText, settings, context = {}, turns = 0 }) {
    if (!conversationId || context.partial || context.tool || context.thought) return false;
    const maxTurns = Math.max(0, Number(settings?.maxTurns || 0));
    if (turns >= maxTurns) return false;
    const text = String(replyText || "").trim();
    if (!text && !context.manualKick && !context.allowEmpty) return false;
    const delayMs = Math.max(0, Number(settings?.delayMs || 0));
    const key = `${conversationId}:${turns}:${text.slice(-240) || "EMPTY_OK"}`;
    const last = this.sent.get(conversationId);
    const now = Date.now();
    if (last?.key === key && now - last.at < Math.max(1000, delayMs)) return false;
    this.sent.set(conversationId, { key, at: now });
    return true;
  }
}

export const automationContinuationGate = new AutomationContinuationGate();
