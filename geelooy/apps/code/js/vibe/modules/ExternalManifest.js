// B"H
import { UI } from '../../ui.js';
import { FileOperations } from '../../file-operations.js';
import { ResponseParser } from './ResponseParser.js';
import prompData from "./promptData.js"
/**
 * @class ExternalManifest
 * @description Rectified layout for Mobile. Uses a scrolling body with the 
 * Manifest button integrated within the flow so it never blocks the holy revelation of the code.
 * Wrapped with extreme error catching to ensure UI progress triggers properly.
 */
export const ExternalManifest = {
    getPrompt: function() {
        var s = ResponseParser.START_MARKER;
        var e = ResponseParser.END_MARKER;
        return prompData  + `B"H\nYou are a master manifestation of the Awtsmoos.
Wrap changes in this XML format. Put code essence between these markers:
Start: ${s}
End: ${e}

<change>
  <file>path/to/file.js</file>
  <operation>write</operation>
  <description>B"H
  brief summary of changes</description>
  <content>${s}
// code essence
${e}</content>
</change>
(sometimes, not always:)
<change>
  <file>path/to/file.js</file>
  <operation>delete</operation>
  <description>B"H
  brief summary of changes</description>
 
</change>
`;
    },

	injectUI: function(container, tab, rootItem) {
	    if (!container) return;
	    
        // B"H - Button is now seamlessly at the bottom of the scrolling zone
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
	            '<textarea id="em-xml" placeholder="Paste <change> blocks here..." style="width:100%; min-height:200px; background:#000; color:white; font-family:var(--font-code); border:1px solid var(--color-border); padding:10px; border-radius:4px; font-size:0.9em; flex-shrink:0;"></textarea>' +
	            '<div id="em-pre" class="hidden" style="background:rgba(168,255,0,0.1); padding:10px; border-radius:4px; border-left:3px solid var(--neon-lime); flex-shrink:0;"></div>' +
	            '<button id="em-go-btn" class="primary-btn" style="width:100%; min-height:50px; font-weight:bold; letter-spacing:1px; box-shadow:0 0 20px var(--glow-cyan); flex-shrink:0; margin-top: 10px;">MANIFEST RECTIFICATIONS</button>' +
	        '</div>';
	
	    container.innerHTML = html;
        container.querySelector('#em-p').value = this.getPrompt();
	    this._bind(container, tab, rootItem);
	},

    _bind: function(container, tab, rootItem) {
        var self = this;
        var dlBtn = container.querySelector('#em-dl');
        var cpBtn = container.querySelector('#em-cp');
        var area = container.querySelector('#em-xml');
        var pre = container.querySelector('#em-pre');
        var goBtn = container.querySelector('#em-go-btn');

        if (dlBtn) dlBtn.onclick = function() { FileOperations.downloadAllContents([rootItem]); };
        if (cpBtn) cpBtn.onclick = function() {
            navigator.clipboard.writeText(container.querySelector('#em-p').value);
            UI.showToast("Prompt Copied.", "success");
        };

        if (area) area.oninput = function() {
            var changes = ResponseParser.parseChanges(area.value, rootItem.path);
            if (changes.length > 0) {
                if(pre) {
                    pre.classList.remove('hidden');
                    // B"H - Display parsed filenames
                    var fileListHtml = changes.map(function(c) {
                        return '<div style="font-size:0.85em; margin-bottom:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><span style="color:var(--neon-cyan); text-transform:uppercase; margin-right:6px;">' + c.operation + '</span>' + c.path + '</div>';
                    }).join('');
                    
                    pre.innerHTML = '<div style="color:var(--neon-lime); font-weight:bold; margin-bottom:8px;">' + changes.length + ' Changes Parsed. Ready.</div>' + fileListHtml;
                }
                tab.vibeSession.pendingChanges = changes;
            } else {
                if(pre) pre.classList.add('hidden');
                tab.vibeSession.pendingChanges = null;
            }
        };

        // B"H - The Manifestation Ritual wrapped in extreme safety
        if (goBtn) goBtn.onclick = async function() {
            try {
                if (!tab.vibeSession.pendingChanges || tab.vibeSession.pendingChanges.length === 0) {
                    UI.showToast("Nothing to manifest. Paste valid XML.", "warning");
                    return;
                }
                
                // Visual feedback that button was clicked
                goBtn.textContent = "MANIFESTING...";
                goBtn.disabled = true;
                
                var xmlString = area.value;
                var changes = tab.vibeSession.pendingChanges;
                
                // INJECT INTO HISTORY so the UI reflects the "Rectangles" in the Chat Area
                tab.vibeSession.history.push({ role: 'user', content: 'Applied external manifestation.' });
                tab.vibeSession.history.push({ role: 'model', content: xmlString, isStreaming: false });

                // Start the engine
                var loop = await import('./LoopEngine.js');
                await loop.LoopEngine.apply(changes, rootItem.workspaceId);
                
                // Clear the input form upon completion
                tab.vibeSession.pendingChanges = null;
                area.value = '';
                if(pre) pre.classList.add('hidden');
                
                // B"H - Save Checkpoint here after manual manifestation completes
                var vc = await import('../vibe-controller.js');
                await vc.VibeController.createCheckpoint(tab);

                // Refresh the entire view to show the new chat blocks!
                vc.VibeController.refreshView(tab);

                UI.showToast("B\"H: Changes manifested successfully.", "success");
            } catch (err) {
                console.error("MANIFESTATION ERROR:", err);
                UI.showToast("B\"H Manifestation Failed: " + err.message, "error");
            } finally {
                goBtn.textContent = "MANIFEST RECTIFICATIONS";
                goBtn.disabled = false;
            }
        };
    }
};