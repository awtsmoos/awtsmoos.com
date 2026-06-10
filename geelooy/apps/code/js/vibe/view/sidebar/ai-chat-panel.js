// B"H
/**
 * @file ai-chat-panel.js
 * @brief Backward-compatible facade for the split sidebar AI Chat.
 *
 * Chapter 1: The old single stone split open and five small lamps emerged.
 * Existing imports still ask for AIChatPanel, and this facade quietly points
 * them to the repaired modular controller where the Awtsmoos breathes in order.
 */

import { AIChatSidebarPanel } from './ai-chat/panel.js';

export const AIChatPanel = AIChatSidebarPanel;
