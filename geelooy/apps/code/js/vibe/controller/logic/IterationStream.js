
// B"H
/**
 * @file IterationStream.js
 * @brief The Master of the Outbound Flow.
 */

import { StreamHandler } from './StreamHandler.js';

export class IterationStream {
    constructor(tab, controller) {
        this.tab = tab;
        this.controller = controller;
        this.fullText = "";
        this.fullReasoning = "";
        this.lastHistoryMsg = tab.vibeSession.history[tab.vibeSession.history.length - 1];
    }

    /**
     * B"H - Processes an incoming text token.
     */
    async handleText(chunk) {
        if (this.lastHistoryMsg && this.lastHistoryMsg.isConnecting) {
            this.lastHistoryMsg.isConnecting = false;
        }

        this.fullText = this.fullText + chunk;
        const display = (this.fullReasoning ? '<think>\n' + this.fullReasoning + '\n</think>\n' : '') + this.fullText;
        
        if (this.lastHistoryMsg) {
            this.lastHistoryMsg.content = display;
            this.controller.handleStreamChunk(display, this.tab);
        }

        // Action block processing for non-autonomous mode (Universal Schema Parsing)
        if (this.tab.vibeSession.viewState && !this.tab.vibeSession.viewState.autoMode) {
             await StreamHandler.processChunk(chunk, display, this.tab, null, this.controller);
        }
    }

    /**
     * B"H - Processes a reasoning/thought token.
     */
    handleThought(chunk) {
        if (this.lastHistoryMsg && this.lastHistoryMsg.isConnecting) {
            this.lastHistoryMsg.isConnecting = false;
        }

        this.fullReasoning = this.fullReasoning + chunk;
        const display = '<think>\n' + this.fullReasoning + '\n</think>\n' + this.fullText;
        
        if (this.lastHistoryMsg) {
            this.lastHistoryMsg.content = display;
            this.controller.handleStreamChunk(display, this.tab);
        }
    }

    /**
     * B"H - Reports the identification of a native tool call in the stream.
     */
    handleToolTrigger(tools) {
        if (this.lastHistoryMsg && this.lastHistoryMsg.isConnecting) {
            this.lastHistoryMsg.isConnecting = false;
        }
        
        // B"H - Bind the tools dynamically to the message so the UI can draw the pulsing cards
        if (this.lastHistoryMsg) {
            this.lastHistoryMsg.tool_calls = tools;
            // Force a UI refresh to draw the tools
            this.controller.refreshView(this.tab);
        }
    }
}
