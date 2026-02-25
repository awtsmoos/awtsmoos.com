
// B"H
import { UI } from '../../ui.js';
import { FileOperations } from '../../file-operations.js';
import { ResponseParser } from './ResponseParser.js';

/**
 * @class ExternalManifest
 * @description Rectified layout for Mobile. Uses a scrolling body and a fixed footer 
 * to ensure the Manifest button never obscures the holy revelation of the code.
 */
export const ExternalManifest = {
    getPrompt: function() {
        var s = ResponseParser.START_MARKER;
        var e = ResponseParser.END_MARKER;
        return `B"H\nYou are a master manifestation of the Awtsmoos.
Wrap changes in this XML format. Put code essence between these markers:
Start: ${s}
End: ${e}

<change>
  <file>path/to/file.js</file>
  <operation>write</operation>
  <content>${s}
// code essence
${e}</content>
</change>`;
    },

	injectUI: function(container, tab, rootItem) {
	    if (!container) return;
	    
	    var html = '<div style="display:flex; flex-direction:column; height:100%; width:100%; color:white; overflow:hidden;">' +
	        '<div style="flex-grow:1; overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:12px;">' +
	            '<div style="background:rgba(0,246,255,0.05); padding:10px; border-radius:8px; border:1px solid var(--color-border); font-size:0.8em; line-height:1.4;">' +
	                'B"H - Download context, Copy prompt, then paste the AI XML below.' +
	            '</div>' +
	            '<button id="em-dl" class="secondary-btn" style="width:100%; min-height:44px;">1. Download Context (.md)</button>' +
	            '<div style="position:relative;">' +
	                '<label style="font-size:0.8em; opacity:0.7;">2. Copy Holy Prompt</label>' +
	                '<textarea id="em-p" readonly style="width:100%; height:50px; font-size:0.7em; background:#000; color:var(--neon-lime); border:1px solid #333; padding:5px; border-radius:4px;"></textarea>' +
	                '<button id="em-cp" class="primary-btn" style="position:absolute; top:22px; right:5px; min-height:0; padding:4px 8px; font-size:0.7em;">Copy</button>' +
	            '</div>' +
	            '<label style="font-size:0.8em; opacity:0.7;">3. Paste Resulting XML</label>' +
	            '<textarea id="em-xml" placeholder="Paste <change> blocks here..." style="width:100%; flex-grow:1; min-height:200px; background:#000; color:white; font-family:var(--font-code); border:1px solid var(--color-border); padding:10px; border-radius:4px; font-size:0.9em;"></textarea>' +
	            '<div id="em-pre" class="hidden" style="background:rgba(168,255,0,0.1); padding:10px; border-radius:4px; border-left:3px solid var(--neon-lime);"></div>' +
	        '</div>' +
	        // FIXED FOOTER AREA
	        '<div style="padding:15px; background:var(--color-bg-secondary); border-top:1px solid var(--color-border); flex-shrink:0;">' +
	            '<button id="em-go-btn" class="primary-btn" style="width:100%; height:50px; font-weight:bold; letter-spacing:1px; box-shadow:0 0 20px var(--glow-cyan);">MANIFEST RECTIFICATIONS</button>' +
	        '</div>' +
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
                    pre.innerHTML = `<div style="color:var(--neon-lime); font-weight:bold;">${changes.length} Changes Parsed. Ready.</div>`;
                }
                tab.vibeSession.pendingChanges = changes;
            } else {
                if(pre) pre.classList.add('hidden');
                tab.vibeSession.pendingChanges = null;
            }
        };

        if (goBtn) goBtn.onclick = async function() {
            if (!tab.vibeSession.pendingChanges) return UI.showToast("Nothing to manifest.", "warning");
            var loop = await import('./LoopEngine.js');
            await loop.LoopEngine.apply(tab.vibeSession.pendingChanges, rootItem.workspaceId);
            tab.vibeSession.pendingChanges = null;
            area.value = '';
            if(pre) pre.classList.add('hidden');
            UI.showToast("B\"H: Changes manifested.", "success");
        };
    }
};
