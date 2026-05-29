// B"H
/**
 * @file index.js
 * @brief Shared streaming exports — single source of truth for SSE parsing.
 *
 * Chapter 264: The Block Parser Was Exposed For Torture Tests.
 */

export { extractReasoningDelta, parseSSEBlock, parseSSEDataLine, readSSEStream } from './stream-client.js';
