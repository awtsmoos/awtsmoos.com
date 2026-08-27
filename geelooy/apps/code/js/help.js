// B"H
// FILE: js/help.js

import { UI } from './ui.js';

export const Help = {
    show() {
        const html = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4 style="color:var(--neon-cyan); margin-top:0;">Editor Shortcuts</h4>
                    <ul style="list-style:none; padding:0; line-height: 1.8; font-size: 0.9em;">
                        <li><strong>Ctrl + S</strong> Save File</li>
                        <li><strong>Ctrl + P</strong> Command Palette</li>
                        <li><strong>Ctrl + /</strong> Toggle Comment</li>
                        <li><strong>Ctrl + D</strong> Duplicate Line</li>
                        <li><strong>Ctrl + Enter</strong> Insert Line After</li>
                        <li><strong>Ctrl + Shift + Enter</strong> Insert Line Before</li>
                        <li><strong>Ctrl + Shift + K</strong> Delete Line</li>
                        <li><strong>Alt + Up/Down</strong> Move Line</li>
                        <li><strong>Ctrl + F</strong> Find / Replace</li>
                    </ul>
                </div>
                <div>
                    <h4 style="color:var(--neon-cyan); margin-top:0;">General</h4>
                    <ul style="list-style:none; padding:0; line-height: 1.8; font-size: 0.9em;">
                        <li><strong>Ctrl + Shift + P</strong> Command Palette</li>
                        <li><strong>Ctrl + Shift + T</strong> Reopen Closed Tab</li>
                        <li><strong>Esc</strong> Close Panels / Dialogs</li>
                    </ul>
                    
                    <h4 style="color:var(--neon-cyan);">Features</h4>
                    <ul style="list-style:none; padding:0; line-height: 1.8; font-size: 0.9em;">
                        <li><strong>Vibe Coding</strong> AI-Assisted Editing</li>
                        <li><strong>Git</strong> Integration & Clone</li>
                        <li><strong>HTML Preview</strong> Real-time rendering</li>
                        <li><strong>Merkava Tools</strong> AST Parser & Executor</li>
                    </ul>
                </div>
            </div>
            <p style="margin-top:20px; font-size:0.8em; color:var(--color-text-tertiary); text-align:center;">
                Awtsmoos Editor v2.5 - Profound Edition
            </p>
        `;
        
        UI.showDialog({
            title: "Help & Documentation",
            contentHTML: html,
            okText: "Close",
            cancelText: ""
        });
    }
};