
// B"H
/**
 * @file input-handler.js
 * @brief The Scribe of the User's Will.
 * This class captures every keystroke, interpreting history navigation,
 * command execution, and the sacred ritual of tab-completion.
 */
import { TerminalCompleter } from './completer.js';

export class TerminalInputHandler {
    constructor(inputEl, shell) {
        this.inputEl = inputEl;
        this.shell = shell;
        
        this.historyIndex = shell.cmdHistory.length;
        this.lastMatches = [];
        this.matchIndex = -1;
        this.originalInputBeforeTab = "";
    }

    bindEvents() {
        if (this.shell.container) {
            this.shell.container.onclick = () => {
                if (this.inputEl) {
                    this.inputEl.focus();
                }
            };
        }
        
        if (!this.inputEl) {
            console.error("B\"H - Terminal Input Handler cannot bind events: Input element not found.");
            return;
        }

        this.inputEl.onkeydown = async (e) => {
            // B"H - IMPROVEMENT 1: The Cleansed Mind Ritual (Ctrl+L)
            if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.shell.clearScreen();
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = this.inputEl.value.trim();
                this.inputEl.value = '';
                this.matchIndex = -1;
                if (cmd) {
                    this.shell.cmdHistory.push(cmd);
                    this.historyIndex = this.shell.cmdHistory.length;
                    await this.shell.execute(cmd);
                } else {
                    this.shell.printPromptLine("");
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                await this.handleTab();
            } else if (e.key === 'ArrowUp') {
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                this.navigateHistory(1);
            } else {
                this.matchIndex = -1; // Reset completion on any other key
            }
        };
    }

    navigateHistory(direction) {
        const newIndex = this.historyIndex + direction;
        if (newIndex >= 0 && newIndex <= this.shell.cmdHistory.length) {
            this.historyIndex = newIndex;
            this.inputEl.value = this.shell.cmdHistory[this.historyIndex] || "";
        }
    }

    async handleTab() {
        const currentVal = this.inputEl.value;
        if (!currentVal && this.matchIndex === -1) return;

        // Cycle through existing matches
        if (this.matchIndex !== -1 && this.lastMatches.length > 0) {
            this.matchIndex = (this.matchIndex + 1) % this.lastMatches.length;
            this.applyCompletion(this.lastMatches[this.matchIndex]);
            return;
        }

        // Fetch new matches
        this.originalInputBeforeTab = currentVal;
        const matches = await TerminalCompleter.getMatches(this.shell, currentVal);
        if (matches && matches.length > 0) {
            this.lastMatches = matches;
            this.matchIndex = 0;
            this.applyCompletion(matches[0]);
        }
    }

    applyCompletion(match) {
        const parts = this.originalInputBeforeTab.split(' ');
        parts[parts.length - 1] = match;
        this.inputEl.value = parts.join(' ');
    }
}
