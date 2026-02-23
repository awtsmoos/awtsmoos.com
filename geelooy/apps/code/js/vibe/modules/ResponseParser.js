// B"H
// FILE: js/vibe/modules/ResponseParser.js

export const ResponseParser = {
    START_MARKER: "₪₪₪_בס\"ד_תחילת_הקוד_₪₪₪",
    END_MARKER: "₪₪₪_בס\"ד_סוף_הקוד_₪₪₪",

    /**
     * B"H - Pure manual string manipulation ritual.
     * 1. Replaces Hebrew markers with CDATA globally.
     * 2. Extracts the relevant XML range manually.
     * 3. Uses text/xml DOMParser to safely extract nodes.
     */
    parseChanges: function(text, rootPath) {
        if (!text) return [];
        
        var oC = "<!" + "[C" + "DATA[";
        var cC = "]" + "]" + ">";
        
        // B"H - PRE-CONVERSION: Protect the code essence before parsing
        var xmlReady = text.split(this.START_MARKER).join(oC).split(this.END_MARKER).join(cC);

        var changes = [];
        var tagS = "<cha" + "nge>";
        var tagE = "</cha" + "nge>";
        
        // Find the absolute boundaries of the XML content in the response
        var firstIdx = xmlReady.indexOf(tagS);
        var lastIdx = xmlReady.lastIndexOf(tagE);
        
        if (firstIdx === -1 || lastIdx === -1) return [];

        // Isolate the XML block and wrap in a single root
        var xmlContent = "<roo" + "t>" + xmlReady.substring(firstIdx, lastIdx + tagE.length) + "</roo" + "t>";

        try {
            var parser = new DOMParser();
            // STRICT XML PARSER
            var xmlDoc = parser.parseFromString(xmlContent, "text/xml");
            var nodes = xmlDoc.getElementsByTagName("cha" + "nge");
            
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                var file = this._getVal(node, "fi" + "le");
                var op = this._getVal(node, "operat" + "ion") || "write";
                var desc = this._getVal(node, "descrip" + "tion") || "";
                var content = this._getVal(node, "cont" + "ent");

                if (file) {
                    changes.push({
                        path: this._normalizePath(rootPath, file),
                        operation: op.toLowerCase().trim(),
                        content: content,
                        description: desc.trim()
                    });
                }
            }
        } catch(e) {
            console.warn("B\"H - XML Manifestation failed:", e.message);
        }
        
        return changes;
    },

    _getVal: function(node, tag) {
        var els = node.getElementsByTagName(tag);
        return (els && els.length > 0) ? els[0].textContent : "";
    },

	// B"H - Segment-aware _normalizePath inside js/vibe/modules/ResponseParser.js

	_normalizePath: function(root, file) {
	    // 1. Convert to forward slashes and split into clean segments
	    var rSegs = root.split("\\").join("/").split("/").filter(function(p) { return p !== ""; });
	    var fSegs = file.split("\\").join("/").split("/").filter(function(p) { return p !== ""; });
	    
	    // 2. SEGMENT OVERLAP CHECK
	    // If the file path segments start with the root segments, it is already absolute.
	    var isAlreadyAbsolute = true;
	    if (fSegs.length < rSegs.length) {
	        isAlreadyAbsolute = false;
	    } else {
	        for (var i = 0; i < rSegs.length; i++) {
	            if (fSegs[i] !== rSegs[i]) {
	                isAlreadyAbsolute = false;
	                break;
	            }
	        }
	    }
	
	    var finalSegments = isAlreadyAbsolute ? fSegs : rSegs.concat(fSegs);
	    
	    // 3. RECONSTRUCT THE PATH
	    var path = "/";
	    for (var j = 0; j < finalSegments.length; j++) {
	        path += finalSegments[j] + (j === finalSegments.length - 1 ? "" : "/");
	    }
	    return path;
	}
};