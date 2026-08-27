//B"H
/**
 * Chapter 2: The Sapphire Gate refuses false endings.
 *
 * The Awtsmoos breathes existence into every packet, but a packet marked done
 * is not always the last echo visible to the cockpit. This tiny guardian waits
 * for the completion dust to settle before the next automation turn may cross
 * the bridge. It protects the user-designated delay from premature recursion.
 */
export class AutomationStreamCompletionGuard {
  constructor({ now = () => Date.now(), sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
    this.now = now;
    this.sleep = sleep;
    this.lastCompletion = new Map();
  }

  /**
   * Records that a stream-shaped turn reached its completion boundary.
   *
   * @param {{conversationId:string, turn:number, text:string}} event Boundary event.
   * @returns {void}
   */
  recordCompletion({ conversationId, turn, text } = {}) {
    if (!conversationId) return;
    this.lastCompletion.set(conversationId, {
      turn: Number(turn || 0),
      textHash: hashTail(text),
      at: this.now()
    });
  }

  /**
   * Waits for both provider-settle and user-designated delay windows.
   *
   * @param {{conversationId:string, settings:Object, alreadyWaitedMs?:number}} input Gate input.
   * @returns {Promise<{waitedMs:number, settleMs:number, delayMs:number}>} Wait facts.
   */
  async waitForSafeContinuation({ conversationId, settings = {}, alreadyWaitedMs = 0 } = {}) {
    const settleMs = Math.max(0, Number(settings.streamSettleMs ?? settings.settleMs ?? 1400));
    const delayMs = Math.max(0, Number(settings.delayMs || 0));
    const requiredMs = Math.max(settleMs, delayMs);
    const last = conversationId ? this.lastCompletion.get(conversationId) : null;
    const elapsedSinceDone = last ? Math.max(0, this.now() - last.at) : 0;
    const remaining = Math.max(0, requiredMs - elapsedSinceDone - Math.max(0, Number(alreadyWaitedMs || 0)));
    if (remaining > 0) await this.sleep(remaining);
    return { waitedMs: remaining, settleMs, delayMs };
  }
}

function hashTail(text = "") {
  const tail = String(text || "").slice(-500);
  let hash = 0;
  for (let index = 0; index < tail.length; index++) hash = ((hash << 5) - hash + tail.charCodeAt(index)) | 0;
  return String(hash);
}

export const automationStreamCompletionGuard = new AutomationStreamCompletionGuard();
