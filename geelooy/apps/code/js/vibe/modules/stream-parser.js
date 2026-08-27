
// B"H
// FILE: js/vibe/modules/stream-parser.js

export const StreamParser = {
    parse(fullText) {
        const files = [];
        const tS = "<" + "chan" + "ge>";
        const tE = "</" + "chan" + "ge>";
        
        const changeBlocks = fullText.split(tS);
        
        for (let i = 1; i < changeBlocks.length; i++) {
            const block = changeBlocks[i];
            const fileObj = { path: null, operation: 'write', description: "Manifesting...", content: "", isComplete: false };

            const fS = "<" + "fi" + "le>";
            const fE = "</" + "fi" + "le>";
            const fileMatch = block.match(new RegExp(fS + "([\\s\\S]*?)" + fE));
            if (fileMatch) fileObj.path = fileMatch[1].trim();

            const oS = "<" + "operat" + "ion>";
            const oE = "</" + "operat" + "ion>";
            const opMatch = block.match(new RegExp(oS + "([\\s\\S]*?)" + oE));
            if (opMatch) fileObj.operation = opMatch[1].trim().toLowerCase();

            const dS = "<" + "descrip" + "tion>";
            const dE = "</" + "descrip" + "tion>";
            const descMatch = block.match(new RegExp(dS + "([\\s\\S]*?)" + dE));
            if (descMatch) fileObj.description = descMatch[1].trim();
            
            const cS = "<" + "cont" + "ent>";
            const cE = "</" + "cont" + "ent>";
            const contentStartIdx = block.indexOf(cS) + 9;
            if (contentStartIdx > 8) {
                const contentEndIdx = block.lastIndexOf(cE);
                if (contentEndIdx !== -1) {
                    fileObj.content = block.substring(contentStartIdx, contentEndIdx);
                    fileObj.isComplete = true;
                } else {
                    fileObj.content = block.substring(contentStartIdx); // Streaming...
                }
            }

            if (block.includes(tE)) fileObj.isComplete = true;
            if (fileObj.path) files.push(fileObj);
        }
        return files;
    }
};
