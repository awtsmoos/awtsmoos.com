
// B"H
import { UI } from '../../ui.js';
import { FileOperations } from '../../file-operations.js';
import { ResponseParser } from './ResponseParser.js';
import { PR } from './parser/constants.js';
import { ManifestTree } from './ManifestTree.js';
import promptData from "./promptData.js";

export const ExternalManifest = {
    getPrompt: function() {
        return promptData + `\nB"H\nYou are a master manifestation of the Awtsmoos.
Wrap changes in this XML format. Put code essence between these markers:
Start: ${PR.S}
End: ${PR.E}

${PR.tO}
  ${PR.fO}path/to/file.js${PR.fC}
  ${PR.oO}write${PR.oC}
  ${PR.dO}B"H
  brief summary of changes${PR.dC}
  ${PR.cO}${PR.S}
// code essence
${PR.E}${PR.cC}
${PR.tC}
(sometimes, not always:)
${PR.tO}
  ${PR.fO}path/to/file.js${PR.fC}
  ${PR.oO}delete${PR.oC}
  ${PR.dO}B"H
  brief summary of changes${PR.dC}
${PR.tC}
`;
    },

    injectUI: function(container, tab, rootItem) {
        if (!container) return;
        
        var html = '<div style="display:flex; flex-direction:column; height:100%; width:100%; color:white; overflow-y:auto; padding:15px; gap:12px;">' +
                '<div style="background:rgba(0,246,255,0.05); padding:10px; border-radius:8px; border:1px solid var(--color-border); font-size:0.8em; line-height:1.4; flex-shrink:0;">' +
                    'B"H - Download context, Copy prompt, then paste the AI XML below.' +
                '</div>' +
                '<button id="em-dl" class="secondary-btn" style="width:100%; min-height:44px; flex-shrink:0;">1. Download Context (.md)</button>' +
                '<div style="position:relative; flex-shrink:0;">' +
                    '<label style="font-size:0.8em; opacity:0.7;">2. Copy Holy Prompt</label>' +
                    '<textarea id="em-p" readonly style="width:100%; height:50px; font-size:0.7em; background:#000; color:var(--neon-lime); border:1px solid #333; padding:5px; border-radius:4px;"></textarea>' +
                    '<button id="em-cp" class="primary-btn" style="position:absolute; top:22px; right:5px; min-height:0; padding:4px 8px; font-size:0.7em;">Copy</button>' +
                '</div>' +
                '<label style="font-size:0.8em; opacity:0.7; flex-shrink:0;">3. Paste Resulting XML</label>' +
                '<textarea id="em-xml" placeholder="Paste incoming XML blocks here..." style="width:100%; min-height:120px; background:#000; color:white; font-family:var(--font-code); border:1px solid var(--color-border); padding:10px; border-radius:4px; font-size:0.9em; flex-shrink:0;"></textarea>' +
                '<div id="em-pre" class="hidden" style="flex-shrink:0; display:flex; flex-direction:column; gap:10px; padding-top:10px;"></div>' +
                '<button id="em-go-btn" class="primary-btn hidden" style="width:100%; min-height:50px; font-weight:bold; letter-spacing:1px; box-shadow:0 0 20px var(--glow-cyan); flex-shrink:0; margin-top: 10px;">MANIFEST SELECTED CHANGES</button>' +
            '</div>';
    
        container.innerHTML = html;
        container.querySelector('#em-p').value = this.getPrompt();
        this._bind(container, tab, rootItem);
    },

    _updateSummary: function(changes, preContainer) {
        var activeCount = changes.filter(function(c) { return c.isEnabled !== false; }).length;
        var summaryEl = preContainer.querySelector('.em-summary-text');
        if (summaryEl) {
            summaryEl.textContent = activeCount + ' of ' + changes.length + ' Changes Selected For Manifestation.';
        }
    },

    _renderPreview: function(changes, preContainer) {
        var html = '<div class="em-summary-text" style="color:var(--neon-lime); font-weight:bold; padding:10px; background:rgba(168,255,0,0.1); border-radius:4px; border:1px solid var(--neon-lime); margin-bottom:10px;"></div>';
        
        html += '<div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px;">' +
                 ManifestTree.buildHTML(changes) + 
                '</div>';
        
        preContainer.innerHTML = html;
        this._updateSummary(changes, preContainer);
        preContainer.classList.remove('hidden');
    },

    _bind: function(container, tab, rootItem) {
        var self = this;
        var area = container.querySelector('#em-xml');
        var pre = container.querySelector('#em-pre');
        var goBtn = container.querySelector('#em-go-btn');
        var dlBtn = container.querySelector('#em-dl');
        var cpBtn = container.querySelector('#em-cp');

        if (dlBtn) dlBtn.onclick = function() { FileOperations.downloadAllContents([rootItem]); };
        
        if (cpBtn) cpBtn.onclick = function() {
            navigator.clipboard.writeText(container.querySelector('#em-p').value);
            UI.showToast("Prompt Copied.", "success");
        };

        if (area) {
            area.oninput = function() {
                var changes = ResponseParser.parseChanges(area.value, rootItem.path);
                if (changes.length > 0) {
                    changes.forEach(function(c) { c.isEnabled = true; });
                    tab.vibeSession.pendingChanges = changes;
                    self._renderPreview(changes, pre);
                    goBtn.classList.remove('hidden');
                } else {
                    if (pre) pre.classList.add('hidden');
                    goBtn.classList.add('hidden');
                    tab.vibeSession.pendingChanges = null;
                }
            };
        }

        if (pre) {
            pre.onclick = function(e) {
                // 1. Handle Collapse/Expand
                var collapseBtn = e.target.closest('.em-collapse-btn');
                if (collapseBtn) {
                    var childrenDiv = collapseBtn.closest('div').parentElement.nextElementSibling;
                    if (childrenDiv && childrenDiv.classList.contains('em-tree-children')) {
                        var isCollapsed = childrenDiv.classList.contains('hidden');
                        if (isCollapsed) {
                            childrenDiv.classList.remove('hidden');
                            collapseBtn.textContent = '▼';
                        } else {
                            childrenDiv.classList.add('hidden');
                            collapseBtn.textContent = '▶';
                        }
                    }
                    return;
                }

                // 2. Handle Folder Checkbox Cascade
                var folderChk = e.target.closest('.em-folder-toggle');
                if (folderChk) {
                    var isChecked = folderChk.checked;
                    var childrenContainer = folderChk.closest('div').parentElement.nextElementSibling;
                    
                    if (childrenContainer && childrenContainer.classList.contains('em-tree-children')) {
                        // Cascade to all nested folder checkboxes
                        var nestedFolders = childrenContainer.querySelectorAll('.em-folder-toggle');
                        nestedFolders.forEach(function(chk) { chk.checked = isChecked; });

                        // Cascade to all nested file cards
                        var childCards = childrenContainer.querySelectorAll('.interactive-card');
                        childCards.forEach(function(cCard) {
                            var idx = parseInt(cCard.dataset.index);
                            if (tab.vibeSession.pendingChanges && tab.vibeSession.pendingChanges[idx]) {
                                var c = tab.vibeSession.pendingChanges[idx];
                                c.isEnabled = isChecked;
                                
                                var chk = cCard.querySelector('input[type="checkbox"]');
                                if (chk) chk.checked = isChecked;
                                
                                cCard.style.opacity = isChecked ? '1' : '0.5';
                                var isDel = c.operation === 'delete';
                                var color = isDel ? 'var(--color-accent-danger)' : 'var(--neon-lime)';
                                cCard.style.borderLeftColor = isChecked ? color : '#444';
                            }
                        });
                    }
                    self._updateSummary(tab.vibeSession.pendingChanges, pre);
                    return;
                }

                // 3. Handle Single Card Click (File Toggle)
                var card = e.target.closest('.interactive-card');
                if (card) {
                    var chk = card.querySelector('input[type="checkbox"]');
                    var isChecked = (e.target === chk) ? chk.checked : !chk.checked;

                    var idx = parseInt(card.dataset.index);
                    if (tab.vibeSession.pendingChanges && tab.vibeSession.pendingChanges[idx]) {
                        var c = tab.vibeSession.pendingChanges[idx];
                        c.isEnabled = isChecked; 
                        chk.checked = isChecked;
                        
                        card.style.opacity = isChecked ? '1' : '0.5';
                        var isDel = c.operation === 'delete';
                        var color = isDel ? 'var(--color-accent-danger)' : 'var(--neon-lime)';
                        card.style.borderLeftColor = isChecked ? color : '#444';
                        
                        self._updateSummary(tab.vibeSession.pendingChanges, pre);
                    }
                    return;
                }
            };
        }

        if (goBtn) goBtn.onclick = async function() {
            try {
                if (!tab.vibeSession.pendingChanges || tab.vibeSession.pendingChanges.length === 0) {
                    UI.showToast("Nothing to manifest. Paste valid XML.", "warning");
                    return;
                }
                
                var toApply = tab.vibeSession.pendingChanges.filter(function(c) { return c.isEnabled !== false; });
                
                if (toApply.length === 0) {
                    UI.showToast("No changes selected. Select at least one spark to manifest.", "warning");
                    return;
                }

                goBtn.textContent = "MANIFESTING...";
                goBtn.disabled = true;
                
                var xmlString = area.value;
                
                tab.vibeSession.history.push({ role: 'user', content: 'Applied external manifestation.' });
                tab.vibeSession.history.push({ role: 'model', content: xmlString, isStreaming: false });

                var loop = await import('./LoopEngine.js');
                await loop.LoopEngine.apply(toApply, rootItem.workspaceId, tab.vibeSession.id);
                
                tab.vibeSession.pendingChanges = null;
                area.value = '';
                if(pre) pre.classList.add('hidden');
                goBtn.classList.add('hidden');
                
                var vc = await import('../vibe-controller.js');
                await vc.VibeController.createCheckpoint(tab);
                vc.VibeController.refreshView(tab);

                UI.showToast(`B"H: ${toApply.length} selected changes manifested successfully.`, "success");
            } catch (err) {
                console.error("MANIFESTATION ERROR:", err);
                UI.showToast("B\"H Manifestation Failed: " + err.message, "error");
            } finally {
                goBtn.textContent = "MANIFEST SELECTED CHANGES";
                goBtn.disabled = false;
            }
        };
    }
};
