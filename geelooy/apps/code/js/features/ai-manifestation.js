// B"H
// FILE: js/features/ai-manifestation.js

import { UI } from '../ui.js';
import { State } from '../state.js';
import { FileSystemProvider } from '../fs-provider.js';
import { Workspaces } from '../workspaces.js';
import { ResponseParser } from '../vibe/modules/ResponseParser.js';
import { Tabs } from '../tabs/index.js';
import { FileOperations } from '../file-operations.js';

export const AIManifestation = {
    async showDialog(folderItem) {
        const systemPrompt = `B"H
You are an expert developer. A humbe manifestation of the Awtsmoos (
    Atzmus, the essence of the Creator (from Kabbalah)
 ). Nullify yourself to His Will entirey. 
 
You are an expert developer. I will provide you with the codebase context.
When you output code changes, you MUST use the following strict XML format. Do not wrap the XML in markdown code blocks. Output the raw XML directly. Use CDATA for the content to handle special characters.

TO CREATE OR UPDATE A FILE:
<change>
  <file>path/to/file.js</file>
  <operation>write</operation>
  <description>Brief description of the change</description>
  <content><![CDATA[]]></content>
</change>

TO DELETE A FILE:
<change>
  <file>path/to/delete.js</file>
  <operation>delete</operation>
  <description>Reason for removal</description>
</change>`;

        const workspace = State.workspaces.find(ws => ws.id === (folderItem.workspaceId || folderItem.id));
        const fullDisplayPath = `${workspace ? workspace.name : 'Unknown'} :: ${folderItem.path}`;

        const contentHTML = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <!-- Step 1: Get Context -->
                <div>
                    <label style="font-weight: bold; color: var(--neon-cyan);">1. Get Your Code Context</label>
                    <div style="margin-top: 5px; display:flex; flex-direction:column; gap:8px;">
                        <button id="download-context-btn" class="secondary-btn" style="width:100%;">
                            <svg class="svg-icon" style="margin-right:8px;"><use href="#icon-download"></use></svg>
                            Download .md Context for Current Folder
                        </button>
                        <p style="font-size: 0.8em; color: var(--color-text-tertiary); margin: 0;">(Or right-click any folder in the sidebar and choose 'Download All Contents (MD)').</p>
                    </div>
                </div>

                <hr style="border: 0; border-top: 1px solid var(--color-border);">

                <!-- Step 2: Provide Prompt -->
                <div>
                    <label style="font-weight: bold; color: var(--neon-cyan);">2. Provide Instructions to External AI</label>
                    <div style="position: relative; margin-top: 5px;">
                        <textarea id="ai-system-prompt" readonly style="width: 100%; height: 100px; font-size: 0.85em; background: rgba(0,0,0,0.3); color: var(--color-text-secondary); resize: vertical; padding: 8px;">${systemPrompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                        <button id="copy-prompt-btn" class="secondary-btn" style="position: absolute; top: 5px; right: 5px; padding: 2px 8px; font-size: 0.8em;">Copy Prompt</button>
                    </div>
                    <p style="font-size: 0.8em; color: var(--color-text-tertiary); margin-top: 5px;">(Paste the prompt, then attach the downloaded Markdown file to your AI chat.)</p>
                </div>

                <hr style="border: 0; border-top: 1px solid var(--color-border);">
                
                <!-- Step 3: Apply Response -->
                <div>
                    <label style="font-weight: bold; color: var(--neon-lime);">3. Apply AI's Response</label>
                    <textarea id="ai-xml-response" placeholder="Paste the <change> blocks here..." style="width: 100%; height: 200px; margin-top: 5px; font-family: var(--font-code);"></textarea>
                </div>
            </div>
        `;

        // Wait for dialog to render to attach event listeners
        setTimeout(() => {
            const copyBtn = document.getElementById('copy-prompt-btn');
            const promptArea = document.getElementById('ai-system-prompt');
            const downloadBtn = document.getElementById('download-context-btn');
            
            if (copyBtn && promptArea) {
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(promptArea.value);
                    copyBtn.textContent = "Copied!";
                    setTimeout(() => copyBtn.textContent = "Copy Prompt", 2000);
                };
            }
            if (downloadBtn) {
                downloadBtn.onclick = () => {
                    FileOperations.downloadAllContents([folderItem]);
                };
            }
        }, 100);

        const result = await UI.showDialog({
            title: `Apply External AI Changes to '${fullDisplayPath}'`,
            contentHTML,
            okText: "Apply Changes",
            cancelText: "Cancel"
        });

        if (result) {
            const xmlResponse = document.getElementById('ai-xml-response').value;
            if (xmlResponse.trim()) {
                await this.applyChanges(xmlResponse, folderItem);
            } else {
                UI.showToast("No XML response provided.", "warning");
            }
        }
    },

    async applyChanges(xmlText, folderItem) {
        const taskId = `ai-apply-${Date.now()}`;
        UI.startTask(taskId, "Parsing external AI response...");

        try {
            const changes = ResponseParser.parseChanges(xmlText, folderItem.path);

            if (changes.length === 0) {
                UI.endTask(taskId, 'warning', "No valid <change> tags found in the response.");
                return;
            }

            UI.updateTask(taskId, 30, `Applying ${changes.length} changes...`);

            const workspaceId = folderItem.workspaceId || folderItem.id;
            const workspace = State.workspaces.find(ws => ws.id === workspaceId);
            if (!workspace) throw new Error("Workspace not found.");

            const affectedParents = new Set();

            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                UI.updateTask(taskId, 30 + ((i / changes.length) * 60), `Processing: ${change.path}`);

                const item = { ...workspace, path: change.path, kind: 'file', workspaceId };

                if (change.operation === 'delete') {
                    await FileSystemProvider.delete(item);
                    const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${change.path}`);
                    if (tab) await Tabs.close(tab.id, true);
                } else {
                    await FileSystemProvider.write(item, change.content);
                    const tab = State.tabs.find(t => t.uniquePath === `${workspaceId}::${change.path}`);
                    if (tab) {
                        tab.content = change.content;
                        tab.isDirty = false;
                        if (State.activeTabId === tab.id) {
                            import('../editor.js').then(m => m.Editor.setCurrentContent(change.content));
                        }
                    }
                }

                const lastSlash = change.path.lastIndexOf('/');
                const parentPath = lastSlash === -1 ? '/' : (change.path.substring(0, lastSlash) || '/');
                affectedParents.add(parentPath);
            }

            UI.updateTask(taskId, 95, "Refreshing workspace...");
            for (const parentPath of affectedParents) {
                await Workspaces.refreshNode({ ...workspace, path: parentPath, kind: 'directory', workspaceId });
            }

            UI.endTask(taskId, 'success', `Successfully applied ${changes.length} changes!`);

        } catch (e) {
            console.error(e);
            UI.endTask(taskId, 'error', `Failed to apply changes: ${e.message}`);
        }
    }
};