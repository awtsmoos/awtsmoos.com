
// B"H
/**
 * @class PreviewTransformer
 * @description Replaces relative imports with manifested Blob URLs.
 * Crucial Rectification: Replaces the entire range of the string literal, quotes included,
 * to ensure no residue (like the '.' dot) remains from the old path.
 */
export const PreviewTransformer = {
    async transform(code, resolver) {
        if (!code) return "";
        const ParserPromise = window.MerkavahParserPromise;
        if (!ParserPromise) return this._regexTransform(code, resolver);

        try {
            const Parser = await ParserPromise;
            const parser = new Parser(code);
            if (parser.registerExpressionParsers) parser.registerExpressionParsers();
            if (parser.registerStatementParsers) parser.registerStatementParsers();
            if (parser.registerDeclarationParsers) parser.registerDeclarationParsers();

            const ast = parser.parse();
            const edits = [];
            const walk = (node) => {
                if (!node || typeof node !== 'object') return;
                if ((node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration' || 
                     node.type === 'ExportAllDeclaration' || node.type === 'ImportExpression') && node.source) {
                    edits.push(node.source);
                } 
                for (const key in node) {
                    const child = node[key];
                    if (Array.isArray(child)) child.forEach(walk);
                    else walk(child);
                }
            };
            walk(ast);

            // B"H - Rectification: Ensure unique ranges and process back-to-front
            const uniqueEdits = Array.from(new Map(edits.map(e => [e.start, e])).values());
            uniqueEdits.sort((a, b) => b.start - a.start);

            let transformed = code;
            for (const node of uniqueEdits) {
                // node is the Literal ("./path"). node.start and node.end span the quotes.
                const originalValue = node.value;
                const newPath = await resolver(originalValue);
                
                if (newPath && newPath !== originalValue) {
                    const before = transformed.slice(0, node.start);
                    const after = transformed.slice(node.end);
                    // B"H - We wrap the new URL in fresh double quotes to replace the old ones entirely.
                    transformed = `${before}"${newPath}"${after}`;
                }
            }
            return transformed;
        } catch (e) {
            console.warn("[Transformer] AST Shevirah, using RegEx.", e);
            return this._regexTransform(code, resolver);
        }
    },

    async _regexTransform(code, resolver) {
        const regex = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?(['"])([^'"]+)\1|import\s*\(\s*(['"])([^'"]+)\3\s*\)/g;
        let transformed = code;
        const matches = [];
        let match;
        while ((match = regex.exec(code)) !== null) {
            const fullMatch = match[0];
            const quote = match[1] || match[3];
            const specifier = match[2] || match[4];
            const quotedSpecifier = quote + specifier + quote;
            const startIdx = match.index + fullMatch.lastIndexOf(quotedSpecifier);
            matches.push({ value: specifier, start: startIdx, end: startIdx + quotedSpecifier.length });
        }
        matches.sort((a, b) => b.start - a.start);
        for (const m of matches) {
            const newPath = await resolver(m.value);
            if (newPath && newPath !== m.value) {
                transformed = transformed.slice(0, m.start) + `"${newPath}"` + transformed.slice(m.end);
            }
        }
        return transformed;
    }
};
