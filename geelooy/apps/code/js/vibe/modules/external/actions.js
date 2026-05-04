
// B"H
/**
 * @file actions.js
 * @brief The Threads of Action for the External Manifest.
 * 
 * CHAPTER LVII: THE LAWS OF THE AI CHARIOT (RECTIFIED)
 */

import { UI } from '../../../ui.js';
import { State } from '../../../state.js';
import { FileOperations } from '../../../file-operations.js';
import { ManifestTree } from '../ManifestTree.js';
import { FileSystemProvider } from '../../../fs-provider.js';
import { PromptAssembler } from '../prompts/directives/PromptAssembler.js';

export const ExternalActions = {
    bind(container, rootItem) {
        const dlBtn = container.querySelector('#em-dl-btn');
        const dlTreeBtn = container.querySelector('#em-dl-tree-btn');
        const infoBtn = container.querySelector('#em-info-btn');
        const cpBtn = container.querySelector('#em-copy-btn');
        const promptArea = container.querySelector('#em-prompt-area');

        // B"H - 1. Download Full Context
        if (dlBtn) dlBtn.onclick = () => FileOperations.downloadAllContents([rootItem]);
        
        // B"H - 2. Download ONLY the Tree Structure with Intense Divine Instructions
        if (dlTreeBtn) {
            dlTreeBtn.onclick = async () => {
                UI.showLoading("Mapping the Tree of Life...");
                try {
                    const files = await FileSystemProvider.listAllFiles(rootItem);
                    
                    let treeMd = `# B"H\n# Tree of Reality for: ${rootItem.name}\n\n`;
                    
                    // --- THE ASSEMBLY OF DIVINE INSTRUCTIONS ---
                    treeMd += PromptAssembler.assemble(rootItem);
                    
                    treeMd += `## MAP OF MANIFESTED VESSELS (FILES):\n\n`;

                    files.sort((a,b) => a.path.localeCompare(b.path));
                    
                    files.forEach(f => {
                        let relPath = f.path;
                        const rootPrefix = rootItem.path === '/' ? '' : rootItem.path;
                        if (relPath.startsWith(rootPrefix)) {
                            relPath = relPath.substring(rootPrefix.length);
                        }
                        if (relPath.startsWith('/')) relPath = relPath.substring(1);
                        treeMd += `- \`/${relPath}\`\n`;
                    });
                    
                    const blob = new Blob([treeMd], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `tree_export_${Date.now()}.md.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    UI.showToast("B\"H - Annotated Tree map secured.", "success");
                } catch(e) {
                    UI.showToast(`B"H - Tree mapping failed: ${e.message}`, "error");
                } finally {
                    UI.hideLoading();
                }
            };
        }

        // B"H - 3. Reveal the Divine Bridge Extension Instructions
        if (infoBtn) {
            infoBtn.onclick = () => {
                UI.showDialog({
                    title: 'B"H - The Awtsmoos Editor Bridge',
                    contentHTML: `
                        <div style="font-size: 14px; line-height: 1.6; color: var(--color-text-secondary); text-align: left;">
                            <p style="margin-top:0;">To ascend beyond manual copying and pasting, install the <strong>Awtsmoos Vibe Editor Bridge</strong> browser extension.</p>
                            
                            <h4 style="color: var(--neon-cyan); margin-bottom: 5px; margin-top: 15px; border-bottom: 1px dashed var(--color-border); padding-bottom: 5px;">How to transcend the manual flow:</h4>
                            <ol style="margin-top: 8px; padding-left: 20px;">
                                <li style="margin-bottom: 5px;">Install the Awtsmoos Bridge extension in your browser.</li>
                                <li style="margin-bottom: 5px;">In the extension sidebar, click <strong style="color: var(--neon-lime);">"Copy Gemini Function Schemas"</strong>.</li>
                                <li style="margin-bottom: 5px;">Paste these exact JSON schemas into the <em>Function declarations</em> (Tools) section in Google AI Studio.</li>
                            </ol>
                            
                            <p style="margin-top: 15px; padding: 10px; background: rgba(0,246,255,0.05); border: 1px solid var(--color-border); border-radius: 6px;">
                                The AI will now have direct, divine access to your local or remote workspace through the Relay Server and internal API points. It can independently invoke <code>read_file</code>, <code>write_file</code>, <code>get_tree</code>, and apply changes directly to the physical disk without you lifting a finger!
                            </p>
                        </div>
                    `,
                    okText: "I Understand",
                    cancelText: "" // Hidden cancel
                });
            };
        }
        
        // B"H - 4. Copy Prompt Ritual
        if (cpBtn) {
            cpBtn.onclick = () => {
                navigator.clipboard.writeText(promptArea.value);
                UI.showToast("B\"H - Ritual Copied to Clipboard.", "success");
            };
        }
    },

    renderPreview(container, changes) {
        const preArea = container.querySelector('#em-preview-area');
        const goBtn = container.querySelector('#em-manifest-btn');
        
        if (changes.length > 0) {
            const count = changes.filter(c => c.isEnabled !== false).length;
            preArea.innerHTML = `
                <div style="color:var(--neon-lime); font-weight:bold; padding:10px; background:rgba(168,255,0,0.1); border-radius:4px; border:1px solid var(--neon-lime); margin-bottom:10px; font-size:0.85em;">
                    ${count} of ${changes.length} Vessels Selected for Inscription.
                </div>
                <div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px;">
                    ${ManifestTree.buildHTML(changes)}
                </div>
            `;
            preArea.classList.remove('hidden');
            goBtn.classList.remove('hidden');
        } else {
            preArea.classList.add('hidden');
            goBtn.classList.add('hidden');
        }
    }
};
