
// B"H
/**
 * @file layout.js
 * @brief The Visual Blueprint for the External Manifest.
 * 
 * CHAPTER LVI: THE GATES OF EXTERNAL KNOWLEDGE
 * When the soul seeks outside counsel, we provide not just the full text,
 * but also the skeletal tree of the project. A small icon of insight (ℹ)
 * sits beside the gates, holding the secret of the Awtsmoos Editor Bridge—
 * a pathway to automate this manual labor entirely through the power of
 * Function Calling.
 */
export const ExternalLayout = {
    getHTML(promptText) {
        return `
            <div class="external-manifest-wrapper" style="flex: 1 1 0; display:flex; flex-direction:column; min-height:0; width:100%; color:white; overflow-y:auto; padding:15px; gap:16px;">
                <div style="background:rgba(0,246,255,0.05); padding:12px; border-radius:8px; border:1px solid var(--color-border); font-size:0.85em; line-height:1.5;">
                    B"H - Follow the sacred sequence to manifest external intelligence.
                </div>
                
                <!-- 1. THE DOWNLOAD VESSEL -->
                <div class="em-section">
                    <label style="font-size:0.8em; opacity:0.7; display:block; margin-bottom:8px;">1. Extract Current Reality</label>
                    <div style="display:flex; gap: 8px; width: 100%;">
                        <button id="em-dl-btn" class="secondary-btn" style="flex: 1; min-height:44px; font-size: 0.85em; padding: 0 5px;">Download Context (.md)</button>
                        <button id="em-dl-tree-btn" class="secondary-btn" style="flex: 1; min-height:44px; font-size: 0.85em; padding: 0 5px;">Download .md Tree</button>
                        <button id="em-info-btn" class="icon-button" style="width: 44px; height: 44px; border: 1px solid var(--color-border); background: var(--color-bg-tertiary);" title="Awtsmoos Extension Info">
                            <span style="font-weight: bold; font-family: serif; font-size: 1.2em; color: var(--neon-cyan);">i</span>
                        </button>
                    </div>
                </div>
                
                <!-- 2. THE PROMPT VESSEL -->
                <div class="em-section" style="position:relative; flex-shrink: 0;">
                    <label style="font-size:0.8em; opacity:0.7; display:block; margin-bottom:8px;">2. Copy Manifestation Ritual</label>
                    <textarea id="em-prompt-area" readonly style="width:100%; height:80px; font-size:0.75em; background:#000; color:var(--neon-lime); border:1px solid #333; padding:10px; border-radius:4px; font-family:var(--font-code); outline:none;">${promptText}</textarea>
                    <button id="em-copy-btn" class="primary-btn" style="position:absolute; top:28px; right:5px; min-height:0; padding:6px 12px; font-size:0.8em; box-shadow: 0 0 10px var(--glow-cyan);">Copy</button>
                </div>
                
                <!-- 3. THE INPUT VESSEL -->
                <div class="em-section" style="display: flex; flex-direction: column; flex-grow: 1; min-height: 150px;">
                    <label style="font-size:0.8em; opacity:0.7; display:block; margin-bottom:8px;">3. Paste Divine Response</label>
                    <textarea id="em-xml-input" placeholder="Paste incoming XML blocks here..." style="flex-grow: 1; width:100%; background:#000; color:white; font-family:var(--font-code); border:1px solid var(--color-border); padding:10px; border-radius:4px; font-size:0.9em; outline:none; resize: none;"></textarea>
                </div>
                
                <div id="em-preview-area" class="hidden" style="flex-shrink: 0;"></div>
                <button id="em-manifest-btn" class="primary-btn hidden" style="flex-shrink: 0; width:100%; min-height:50px; font-weight:bold; letter-spacing:1px; box-shadow:0 0 20px var(--glow-cyan);">MANIFEST SELECTED VESSELS</button>
            </div>
        `;
    }
};
