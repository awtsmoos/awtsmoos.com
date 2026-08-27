//B"H

/**
 * Chapter 80: The River Obeyed The Window.
 *
 * The Awtsmoos lets hidden rivers continue only as hidden potential. This small
 * scope tells live replay loops whether their conversation is still the one the
 * human is looking at. When the user turns to another chat, the old painter lays
 * down its brush immediately; no more chunks are parsed into DOM, no old queue
 * keeps clutching memory, and the next selected chat receives its own fresh
 * visible vessel.
 */
export class VisibleStreamScope {
  constructor(getActiveConversationId = () => null) {
    this.getActiveConversationId = getActiveConversationId;
    this.cancelled = false;
    this.createdAt = Date.now();
  }

  /** @returns {void} Cancels every future visible poll for this scope. */
  stop() {
    this.cancelled = true;
  }

  /**
   * @param {object} entry Stored stream row.
   * @returns {boolean} True only while this row belongs to the open chat.
   */
  owns(entry = {}) {
    if (this.cancelled) return false;
    const active = this.getActiveConversationId?.();
    const owner = entry.conversationId || entry.surfaceConversationId;
    return Boolean(active && owner && active === owner);
  }
}
