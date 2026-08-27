
// B"H
/**
 * @file block-extractor.js
 * @brief Discerning the complete vessels within the flowing stream.
 * 
 * CHAPTER IX: THE DISCERNMENT OF THE FINAL WORD
 * A vessel is only whole when its closure is spoken. 
 * This module has been rectified to perceive the True Closure of a 'change' block,
 * whether it arrives as an escaped entity from a stream or a raw character from a paste.
 */
import { SieveOfTruth } from './SieveOfTruth.js';
import { PathNormalizer } from './path-normalizer.js';
import { MARKERS } from './constants.js';

export class BlockExtractor {
    /**
     * B"H
     * Extracts structured change directives from the raw text.
     * @param {string} rawSpeech - The text containing XML blocks.
     * @param {string} rootPath - The foundation for relative path normalization.
     */
    static extract(rawSpeech, rootPath) {
        if (!rawSpeech) return [];

        // B"H - THE MULTIDIMENSIONAL CHECK:
        // We count how many blocks are truly closed by checking for both &lt;/ and </
        const countOccurrences = (str, sub) => str.split(str.includes(sub) ? sub : "").length - 1;
        
        const trulyCompletedCount = 
            (rawSpeech.split("&lt;/" + "change&gt;").length - 1) + 
            (rawSpeech.split("</" + "change>").length - 1);

        // 1. Transfiguration: Replace Hebrew markers with CDATA for safe parsing
        const transfigured = SieveOfTruth.transfigureToCDATA(rawSpeech);
        
        // 2. Healing: Ensure unclosed tags have temporary shadow-closures
        const healed = SieveOfTruth.healVessels(transfigured);
        
        // 3. Rooting: Wrap in a parent element for standard DOM parsing
        const xmlString = `<root>${healed}</root>`;

        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            // If the parser errors, the vessels are too shattered for standard logic; fallback to manual crawl.
            if (xmlDoc.querySelector("parsererror")) {
                console.warn(`B"H [BlockExtractor] XML Parse Error. Falling back to manual crawl.`);
                return this._manualCrawl(rawSpeech, rootPath, trulyCompletedCount);
            }

            const changeNodes = xmlDoc.querySelectorAll("change");
            const directives = [];

            changeNodes.forEach((node, index) => {
                // A node is solidified if its index is within the count of found closing tags.
                const isSolidified = index < trulyCompletedCount;
                
                const directive = this._nodeToDirective(node, rootPath, isSolidified);
                if (directive) directives.push(directive);
            });

            return directives;
        } catch (e) {
            console.error(`B"H [BlockExtractor] Extraction Shattered:`, e);
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
            // A write operation is considered complete if the XML block was closed AND content exists.
            isComplete: isComplete && (op === 'delete' || content.trim().length > 0)
        };
    }

    /**
     * B"H - A Manual Sieve for when the XML structure is too chaotic for DOMParser.
     */
    static _manualCrawl(rawSpeech, rootPath, trulyCompletedCount) {
        // Handle both escaped and raw tags
        const tagS = rawSpeech.includes("&lt;change&gt;") ? "&lt;change&gt;" : "<change>";
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

    /**
     * B"H - Siphons content from between specific tags, resilient to entity-encoding.
     */
    static _sip(block, tag) {
        const openEsc = "&lt;" + tag + "&gt;";
        const closeEsc = "&lt;/" + tag + "&gt;";
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
