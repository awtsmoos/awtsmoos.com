
// B"H
/**
 * @file css-transmuter.js
 * @brief The Weaver of Garments.
 * 
 * CHAPTER XLII: THE RECTIFICATION OF THE STYLES
 * 
 * A CSS file often relies on its brethren through `@import url(...)`. 
 * But in the realm of Blob URLs (how the Awtsmoos Simulator runs), 
 * relative imports shatter completely, because a Blob has no folder!
 * 
 * This module traverses the CSS AST (using pure Regex for speed), 
 * locates every `@import`, fetches the physical essence from the 
 * FileSystemProvider, and replaces the import with a newly manifested 
 * Blob URL, allowing the style cascade to function flawlessly in the Sandbox.
 */

import { PathResolver } from './resolver.js';
import { VirtualServer } from './virtual-server.js';

export const CSSTransmuter = {
    /**
     * B"H
     * Processes a raw CSS string, resolving all local @import statements.
     * 
     * @param {string} rawCSS - The original stylesheet content.
     * @param {string} cssAbsPath - The absolute coordinate of this CSS file.
     * @param {string|number} workspaceId - The world identity.
     * @returns {Promise<string>} The purified CSS with resolved Blob links.
     */
    async transmute(rawCSS, cssAbsPath, workspaceId) {
        let processedCSS = rawCSS;
        
        // Regex to find @import "file.css"; or @import url('file.css');
        const importRegex = /@import\s+(?:url\()?['"]?(.*?\.[a-zA-Z0-9]+)['"]?\)?;/g;
        
        let match;
        const replacements = [];

        // Gather all required transmutaions
        while ((match = importRegex.exec(rawCSS)) !== null) {
            const fullStatement = match[0];
            const relativePath = match[1];
            
            // Ignore external URLs
            if (relativePath.startsWith('http') || relativePath.startsWith('data:')) {
                continue;
            }

            const targetAbsPath = PathResolver.resolve(cssAbsPath, relativePath);
            replacements.push({ fullStatement, targetAbsPath });
        }

        // Execute transmutations
        for (const req of replacements) {
            try {
                const res = await VirtualServer.fetch(workspaceId, cssAbsPath, req.targetAbsPath);
                
                // Recursively transmute the imported CSS in case IT has imports!
                const nestedCSS = await this.transmute(res.text, res.absPath, workspaceId);
                
                const blob = new Blob([nestedCSS], { type: 'text/css' });
                const blobUrl = URL.createObjectURL(blob);
                
                processedCSS = processedCSS.replace(req.fullStatement, `@import url('${blobUrl}');`);
                console.log(`[CSSTransmuter] B"H Resolved CSS Import: ${req.targetAbsPath} -> Blob`);
            } catch (e) {
                console.warn(`[CSSTransmuter] B"H Missing Style Vessel: ${req.targetAbsPath}`, e);
                // Comment out broken imports to prevent CSS halting
                processedCSS = processedCSS.replace(req.fullStatement, `/* B"H Broken Import: ${req.fullStatement} */`);
            }
        }

        // Also fix background-image: url(...)
        const urlRegex = /url\(['"]?(.*?\.[a-zA-Z0-9]+)['"]?\)/g;
        let urlMatch;
        const urlReplacements = [];

        while ((urlMatch = urlRegex.exec(processedCSS)) !== null) {
            const fullStatement = urlMatch[0];
            const relativePath = urlMatch[1];
            
            // Skip data URIs or externals
            if (relativePath.startsWith('http') || relativePath.startsWith('data:') || relativePath.startsWith('#')) {
                continue;
            }
            // Skip if it was already caught by @import (very rare overlap but safe to ignore)
            if (fullStatement.includes('@import')) continue;

            const targetAbsPath = PathResolver.resolve(cssAbsPath, relativePath);
            urlReplacements.push({ fullStatement, targetAbsPath });
        }

        for (const req of urlReplacements) {
            try {
                const res = await VirtualServer.fetch(workspaceId, cssAbsPath, req.targetAbsPath);
                
                const blob = new Blob([res.buffer || res.text], { type: res.mime });
                const blobUrl = URL.createObjectURL(blob);
                
                // Escape regex replace safety
                const safeReplace = processedCSS.split(req.fullStatement).join(`url('${blobUrl}')`);
                processedCSS = safeReplace;
                
            } catch (e) {
                // Ignore missing images silently
            }
        }

        return processedCSS;
    }
};
