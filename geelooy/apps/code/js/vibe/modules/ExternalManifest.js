// B"H
// FILE: js/vibe/modules/ExternalManifest.js
import { UI } from '../../ui.js';
import { FileOperations } from '../../file-operations.js';
import { ResponseParser } from './ResponseParser.js';
import { LoopEngine } from './LoopEngine.js';

export const ExternalManifest = {
    getPrompt: function() {
        var s = ResponseParser.START_MARKER;
        var e = ResponseParser.END_MARKER;
        return "B\"H\nYou are a master manifestation of the Awtsmoos. Purpose: Tikkun.\n\nFORMAT:\nWrap changes in this XML format. Put code essence between these markers:\nStart: " + s + "\nEnd: " + e + 
               "\n\n<cha" + "nge>\n  <fi" + "le>path/to/file.js</fi" + "le>\n  <operat" + "ion>write</operat" + "ion>\n  <cont" + "ent>" + s + "\n// code essence\n" + e + "</cont" + "ent>\n</cha" + "nge>";
    },

    // B"H - Updated injectUI in ExternalManifest.js
	injectUI: function(container, tab, rootItem) {
	    if (!container) return;
	    
	    // Instructions Area
	    var instructions = '<div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333; font-size: 0.85em; line-height: 1.4;">' +
	        '<p style="margin:0 0 5px 0;">1. Download the <b>.md context</b> and upload to an external AI.</p>' +
	        '<p style="margin:0;">2. Copy the <b>Sacred Prompt</b> and paste it before your request.</p>' +
	    '</div>';
	
	    var html = '<div style="display:flex; flex-direction:column; height:100%; color:white; overflow:hidden;">' +
	        '<div style="flex-grow:1; overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:12px;">' +
	            instructions +
	            '<button id="em-dl" class="secondary-btn" style="flex-shrink:0;">1. Download Context (.md)</button>' +
	            '<div style="position:relative; flex-shrink:0;">' +
	                '<label style="font-size:0.8em; opacity:0.7;">2. Copy Holy Prompt</label>' +
	                '<textarea id="em-p" readonly style="width:100%; height:70px; font-size:0.7em; background:#000; color:var(--neon-lime); border:1px solid #333; padding:5px;">' + this.getPrompt() + '</textarea>' +
	                '<button id="em-cp" class="primary-btn" style="position:absolute; top:25px; right:5px; min-height:0; padding:2px 8px;">Copy</button>' +
	            '</div>' +
	            '<label style="font-size:0.8em; opacity:0.7; flex-shrink:0;">3. Paste Resulting XML</label>' +
	            '<textarea id="em-xml" placeholder="Paste <change> blocks here..." style="flex-grow:1; min-height:150px; background:#000; color:white; font-family:monospace; border:1px solid var(--color-border); padding:10px;"></textarea>' +
	            '<div id="em-pre" class="hidden" style="background:#fff1; padding:10px; border-radius:4px; border-left:3px solid var(--neon-lime); flex-shrink:0;"></div>' +
	        '</div>' +
	        '<div style="padding:10px; background:rgba(0,0,0,0.2); border-top:1px solid var(--color-border); flex-shrink:0;">' +
	            '<button id="em-go-btn" class="primary-btn" style="width:100%; height:45px; font-weight:bold;">Manifest Changes</button>' +
	        '</div>' +
	    '</div>';
	
	    container.innerHTML = html;
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
                    var listHtml = '<div style="color:var(--neon-cyan); font-size:0.85em; font-weight:bold;">Ready (' + changes.length + ' Changes):</div>';
                    for(var i=0; i<changes.length; i++) { listHtml += '<div style="font-size:0.75em;">• ' + changes[i].path.split('/').pop() + '</div>'; }
                    pre.innerHTML = listHtml;
                }
                tab.vibeSession.pendingChanges = changes;
            } else {
                if(pre) pre.classList.add('hidden');
                tab.vibeSession.pendingChanges = null;
            }
        };

        if (goBtn) goBtn.onclick = async function() {
            var success = await self.execute(tab, rootItem);
            if (success) {
                area.value = '';
                if(pre) pre.classList.add('hidden');
                import('../vibe-controller.js').then(function(m) { m.VibeController.render(tab); });
            }
        };
    },

    // B"H - Updated execute in ExternalManifest.js
	execute: async function(tab, rootItem) {
	    var changes = tab.vibeSession.pendingChanges;
	    if (!changes || changes.length === 0) return false;
	    
	    var taskId = "em-exec-" + Date.now();
	    UI.startTask(taskId, "Manifesting...");
	    try {
	        var loop = await import('./LoopEngine.js');
	        await loop.LoopEngine.apply(changes, rootItem.workspaceId);
	        
	        // Manual tags broken up to prevent self-parsing
	        var tS = "<cha" + "nge>", tE = "</cha" + "nge>";
	        var fS = "<fi" + "le>", fE = "</fi" + "le>";
	        var oS = "<operat" + "ion>", oE = "</operat" + "ion>";
	        var dS = "<descrip" + "tion>", dE = "</descrip" + "tion>";
	
	        var historyText = "B\"H - Manual Manifestation applied:\n";
	        for (var i = 0; i < changes.length; i++) {
	            var c = changes[i];
	            // FIXED: Standard concatenation to show ACTUAL variable values
	            historyText += tS + fS + c.path + fE + oS + c.operation + oE + dS + c.description + dE + tE + "\n";
	        }
	        
	        tab.vibeSession.history.push({ role: 'model', content: historyText });
	        UI.endTask(taskId, 'success', 'Vessels anchored.');
	        tab.vibeSession.pendingChanges = null;
	        tab.isDirty = true;
	        return true;
	    } catch(e) { 
	        UI.endTask(taskId, 'error', e.message); 
	        return false; 
	    }
	}
};