
/**
 * B"H
 * @module BlockExtractor
 * @description
 * * Chapter 9: The Discernment of Completion
 * A vessel is only whole when its closure is spoken. 
 */
import { SieveOfTruth } from './SieveOfTruth.js';
import { PathNormalizer } from './path-normalizer.js';
import { MARKERS } from './constants.js';

export class BlockExtractor {
    /**
     * B"H
     * Extracts structured change directives from the raw text stream.
     */
    static extract(rawSpeech, rootPath) {
        if (!rawSpeech) return [];

        // B"H - Determine how many vessels are TRULY closed by looking at the raw buffer.
        const trulyCompletedCount = 
            (rawSpeech.split("</" + "change>").length - 1) + 
            (rawSpeech.split("</" + "change>").length - 1);

        const transfigured = SieveOfTruth.transfigureToCDATA(rawSpeech);
        const healed = SieveOfTruth.healVessels(transfigured);
        const xmlString = "<root>" + healed + "</root>";

        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            if (xmlDoc.querySelector("parsererror")) {
                return this._manualCrawl(rawSpeech, rootPath, trulyCompletedCount);
            }

            const changeNodes = xmlDoc.querySelectorAll("change");
            const directives = [];

            changeNodes.forEach((node, index) => {
                const isSolidified = index < trulyCompletedCount;
                const directive = this._nodeToDirective(node, rootPath, isSolidified);
                if (directive) directives.push(directive);
            });

            return directives;
        } catch (e) {
            console.error("B\"H [BlockExtractor] Extraction failed:", e);
            return this._manualCrawl(rawSpeech, rootPath, trulyCompletedCount);
        }
    }

    static _nodeToDirective(node, rootPath, isComplete) {
        const fileLabel = node.querySelector("file")?.textContent?.trim();
        if (!fileLabel) return null;

        const op = node.querySelector("operation")?.textContent?.trim().toLowerCase() || "write";
        const content = node.querySelector("content")?.textContent || "";

        return {
            path: PathNormalizer.normalize(rootPath, fileLabel),
            fileLabel,
            operation: op,
            content,
            description: node.querySelector("description")?.textContent?.trim() || "",
            isComplete: isComplete && (op === 'delete' || content.trim().length > 0)
        };
    }

    static _manualCrawl(rawSpeech, rootPath, trulyCompletedCount) {
        const tagS = rawSpeech.includes("<change>") ? "<change>" : "<change>";
        const blocks = rawSpeech.split(tagS);
        const directives = [];

        blocks.slice(1).forEach((block, index) => {
            const fileLabel = this._sip(block, "file").trim();
            if (fileLabel) {
                const op = this._sip(block, "operation").trim().toLowerCase() || 'write';
                let content = this._sip(block, "content")
                    .split(MARKERS.START).join("")
                    .split(MARKERS.END).join("")
                    .trim();

                const isComplete = index < trulyCompletedCount && (op === 'delete' || content.length > 0);

                directives.push({
                    path: PathNormalizer.normalize(rootPath, fileLabel),
                    fileLabel,
                    operation: op,
                    content,
                    description: this._sip(block, "description").trim() || "Manifesting...",
                    isComplete
                });
            }
        });
        return directives;
    }

    static _sip(block, tag) {
        const openEsc = "<" + tag + ">";
        const closeEsc = "</" + tag + ">";
        const openRaw = "<" + tag + ">";
        const closeRaw = "</" + tag + ">";

        const open = block.includes(openEsc) ? openEsc : openRaw;
        const close = block.includes(closeEsc) ? closeEsc : closeRaw;

        const start = block.indexOf(open);
        if (start === -1) return "";
        const cStart = start + open.length;
        const end = block.indexOf(close, cStart);
        
        return (end === -1) ? block.substring(cStart) : block.substring(cStart, end);
    }
}
