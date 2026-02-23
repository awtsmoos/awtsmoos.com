// B"H
// FILE: js/vibe/view/chat-ui.js

import { MarkdownParser } from '../modules/markdown-parser.js';
import pnimi from '/scripts/awtsmoos/coding/pnimi.js';

export const ChatUI = {
    renderHistory: function(container, history, tab, controller) {
        // B"H - Improved selector: search locally, then globally
        var hist = container.querySelector('#vibe-chat-history') || document.getElementById('vibe-chat-history');
        if (!hist) return;
        
        var msgs = history.filter(function(m) { return m.role !== 'system'; });
        
        hist.innerHTML = '';
        for (var i = 0; i < msgs.length; i++) {
            this.appendMessage(msgs[i], hist, tab, controller);
        }
        
        // Ensure the scrolls to the bottom of the revelation
        hist.scrollTop = hist.scrollHeight;
    },

    appendMessage: function(msg, container, tab, controller) {
        var div = document.createElement('div');
        div.className = "vibe-message " + msg.role;
        
        if (msg.role === 'user') {
            div.innerHTML = MarkdownParser.parse(msg.content);
        } else {
            this._renderModelMessage(div, msg.content, tab, controller);
        }
        
        container.appendChild(div);
        this._hydrateCodeBlocks(div);
    },

    // B"H - Updated _renderModelMessage in chat-ui.js

	_renderModelMessage: function(div, content, tab, controller) {
	    div.innerHTML = '';
	    
	    var oC = "<!" + "[C" + "DATA[";
	    var cC = "]" + "]" + ">";
	    var tagS = "<cha" + "nge>";
	    var tagE = "</cha" + "nge>";
	
	    // B"H - First, identify and convert markers to CDATA in a clone of the text
	    var protectedContent = content.split("₪₪₪_בס\"ד_תחילת_הקוד_₪₪₪").join(oC).split("₪₪₪_בס\"ד_סוף_הקוד_₪₪₪").join(cC);
	
	    var lastIdx = 0;
	    while (true) {
	        var sIdx = protectedContent.indexOf(tagS, lastIdx);
	        
	        if (sIdx === -1) {
	            var remaining = protectedContent.substring(lastIdx).trim();
	            if (remaining) {
	                var textDiv = document.createElement('div');
	                textDiv.innerHTML = MarkdownParser.parse(remaining);
	                div.appendChild(textDiv);
	            }
	            break;
	        }
	
	        var beforeText = protectedContent.substring(lastIdx, sIdx).trim();
	        if (beforeText) {
	            var textDiv = document.createElement('div');
	            textDiv.innerHTML = MarkdownParser.parse(beforeText);
	            div.appendChild(textDiv);
	        }
	
	        var eIdx = protectedContent.indexOf(tagE, sIdx);
	        if (eIdx === -1) {
	            // Block is streaming/incomplete
	            var incomplete = protectedContent.substring(sIdx);
	            var obj = this._parseManual(incomplete, false);
	            if (obj) div.appendChild(this._createCard(obj, tab, controller));
	            break;
	        }
	
	        var fullBlock = protectedContent.substring(sIdx, eIdx + tagE.length);
	        var obj = this._parseManual(fullBlock, true);
	        if (obj) div.appendChild(this._createCard(obj, tab, controller));
	        
	        lastIdx = eIdx + tagE.length;
	    }
	},

    _parseManual: function(block, isComplete) {
        var extract = function(src, tag) {
            var s = "<" + tag + ">";
            var e = "</" + tag + ">";
            var si = src.indexOf(s);
            if (si === -1) return "";
            var ei = src.indexOf(e, si);
            if (ei === -1) return src.substring(si + s.length).trim();
            return src.substring(si + s.length, ei).trim();
        };

        var file = extract(block, "fi" + "le");
        if (!file) return null;

        return {
            path: file,
            operation: extract(block, "operat" + "ion") || "write",
            description: extract(block, "descrip" + "tion") || "Rectification applied.",
            isComplete: isComplete
        };
    },

    _createCard: function(file, tab, controller) {
	    var card = document.createElement('div');
	    card.className = "vibe-manifest-card";
	    
	    // Aesthetic setup
	    card.style.background = "rgba(13, 17, 23, 0.95)";
	    card.style.border = "1px solid #383e5e";
	    card.style.borderLeft = "4px solid #00f6ff";
	    card.style.padding = "12px";
	    card.style.margin = "10px 0";
	    card.style.borderRadius = "6px";
	    card.style.cursor = "pointer";
	
	    // Extract names manually
	    var fileName = file.path.split("/").pop() || "vessel";
	    var dirParts = file.path.split("/");
	    dirParts.pop();
	    var dirPath = dirParts.join("/") || "/";
	    var status = file.isComplete ? '✓' : '...';
	
	    // B"H - Pure string concatenation for the HTML content
	    card.innerHTML = 
	        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
	            '<div style="overflow:hidden;">' +
	                '<div style="font-family:monospace; color:#00f6ff; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + fileName + '</div>' +
	                '<div style="font-size:0.7em; color:rgba(200,200,255,0.5);">' + dirPath + '</div>' +
	            '</div>' +
	            '<div style="color:#a8ff00; font-weight:bold; font-size:1.2em;">' + status + '</div>' +
	        '</div>' +
	        '<div style="margin-top:6px; font-size:0.8em; color:rgba(255,255,255,0.7);">' + file.operation.toUpperCase() + ": " + file.description + '</div>';
	
	    if (file.operation !== 'delete') {
	        card.onclick = function(e) {
	            e.stopPropagation();
	            if (controller) controller.previewFile(tab, file.path);
	        };
	    }
	    return card;
	},

    _hydrateCodeBlocks: function(container) {
        if (typeof pnimi === 'undefined') return;
        var blocks = container.querySelectorAll('.vibe-code-container');
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].dataset.hydrated) continue;
            try { 
                new pnimi(blocks[i].querySelector('pre'), 'js'); 
                blocks[i].dataset.hydrated = 'true';
            } catch(e) {}
        }
    },
    
    // B"H - Ensure updateLastMessage is in ChatUI in js/vibe/view/chat-ui.js

	updateLastMessage: function(container, content, tab, controller) {
	    // Find the very last message bubble
	    var lastMsg = container.lastElementChild;
	    
	    // If it's not a model bubble, or doesn't exist, create one
	    if (!lastMsg || !lastMsg.classList.contains('model')) {
	        this.appendMessage({ role: 'model', content: content }, container, tab, controller);
	        return;
	    }
	    
	    // Efficiently re-render only the inner content of the last bubble
	    this._renderModelMessage(lastMsg, content, tab, controller);
	    this._hydrateCodeBlocks(lastMsg);
	    
	    // Auto-scroll to keep the new words in view
	    if (container.scrollHeight - container.scrollTop <= container.clientHeight + 100) {
	        container.scrollTop = container.scrollHeight;
	    }
	},
};