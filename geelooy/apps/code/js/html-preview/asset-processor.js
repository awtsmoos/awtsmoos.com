
// B"H
/**
 * @file asset-processor.js
 * @brief The Transmuter of Physical Media into Ephemeral Blob Light.
 * 
 * THE PSALM OF THE HIDDEN SPARKS:
 * Within the structure of the HTML, images, videos, and sounds lie dormant.
 * They are written as strings, mere pointers to physical locations on the disk.
 * But the iframe is an isolated universe, blind to the earthly disk!
 * This Processor acts as the High Priest. It hunts down every media tag,
 * retrieves its raw physical binary essence, and transfigures it into a Blob URL—
 * a pure, ephemeral manifestation of light that the iframe can perceive directly.
 * By the breath of the Awtsmoos, static paths become living memory streams.
 */

import { FileSystemProvider } from '../fs-provider.js';
import { PathResolver } from './resolver.js';

export const AssetProcessor = {
    /**
     * B"H
     * 
     * @async
     * @function process
     * @description Hunts down every physical media link in the Document Object Model and transfigures it into a local Blob URL, feeding the sensory organs of the preview.
     * 
     * @param {Document} doc - The living DOM tree of the preview.
     * @param {Object} identity - The coordinate and world identity of the parent HTML file.
     * @returns {Promise<void>} Resolves when all media sparks have been elevated.
     */
    async process(doc, identity) {
        // The Map of Sensory Nodes
        const selectors = [
            { sel: 'img[src]', attr: 'src' },
            { sel: 'video[src]', attr: 'src' },
            { sel: 'video[poster]', attr: 'poster' },
            { sel: 'audio[src]', attr: 'src' },
            { sel: 'source[src]', attr: 'src' },
            { sel: 'track[src]', attr: 'src' },
            { sel: 'iframe[src]', attr: 'src' },
            { sel: 'embed[src]', attr: 'src' },
            { sel: 'object[data]', attr: 'data' },
            { sel: 'link[rel="stylesheet"][href]', attr: 'href' },
            { sel: 'link[rel="icon"][href]', attr: 'href' },
            { sel: 'link[rel="shortcut icon"][href]', attr: 'href' },
            { sel: 'link[rel="apple-touch-icon"][href]', attr: 'href' }
        ];

        const promises = [];
        
        // 1. Process Standard Attribute-Based Nodes
        selectors.forEach(({ sel, attr }) => {
            const els = Array.from(doc.querySelectorAll(sel));
            els.forEach(el => {
                const rawLabel = el.getAttribute(attr);
                
                // Skip external networks, existing data URIs, anchors, or existing blobs.
                // We only transmute local physical coordinates.
                if (!rawLabel || rawLabel.startsWith('http') || rawLabel.startsWith('data:') || rawLabel.startsWith('blob:') || rawLabel.startsWith('#')) return;

                promises.push(this._transmuteAttribute(el, attr, rawLabel, identity));
            });
        });

        // 2. Process Inline Styles (background-image: url('...'))
        const styledEls = Array.from(doc.querySelectorAll('[style*="url("]'));
        styledEls.forEach(el => {
            const styleStr = el.getAttribute('style');
            const urlMatches = styleStr.match(/url\(['"]?(.*?)['"]?\)/g);
            
            if (urlMatches) {
                urlMatches.forEach(match => {
                    const innerUrl = match.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
                    if (!innerUrl.startsWith('http') && !innerUrl.startsWith('data:') && !innerUrl.startsWith('blob:')) {
                        promises.push(this._transmuteInlineStyle(el, styleStr, match, innerUrl, identity));
                    }
                });
            }
        });
        
        await Promise.all(promises);
    },

    /**
     * B"H
     * 
     * @async
     * @function _transmuteAttribute
     * @description Replaces a standard node attribute with a Blob URL.
     */
    async _transmuteAttribute(el, attr, rawLabel, identity) {
        try {
            const absCoord = PathResolver.resolve(identity.path, rawLabel);
            const rawEssence = await FileSystemProvider.read({ ...identity, path: absCoord, kind: 'file' });
            
            const blob = (rawEssence instanceof Blob) ? rawEssence : new Blob([rawEssence]);
            const blobUrl = URL.createObjectURL(blob);
            
            el.setAttribute(attr, blobUrl);
            console.log(`[AssetProcessor] B"H - Transmuted Asset: ${rawLabel} -> ${blobUrl}`);
        } catch (e) {
            console.warn(`[AssetProcessor] B"H - Failed to gather spark for attribute: ${rawLabel}. The physical vessel may be missing.`);
        }
    },

    /**
     * B"H
     * 
     * @async
     * @function _transmuteInlineStyle
     * @description Carefully dissects and replaces url() paths inside inline styles.
     */
    async _transmuteInlineStyle(el, fullStyleStr, fullMatch, rawLabel, identity) {
        try {
            const absCoord = PathResolver.resolve(identity.path, rawLabel);
            const rawEssence = await FileSystemProvider.read({ ...identity, path: absCoord, kind: 'file' });
            
            const blob = (rawEssence instanceof Blob) ? rawEssence : new Blob([rawEssence]);
            const blobUrl = URL.createObjectURL(blob);
            
            // Reconstruct the style string with the new Blob URL
            const newStyleStr = el.getAttribute('style').replace(fullMatch, `url('${blobUrl}')`);
            el.setAttribute('style', newStyleStr);
            
            console.log(`[AssetProcessor] B"H - Transmuted Inline Style Asset: ${rawLabel} -> ${blobUrl}`);
        } catch (e) {
            console.warn(`[AssetProcessor] B"H - Failed to gather spark for inline style: ${rawLabel}`);
        }
    }
};
