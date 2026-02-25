
// B"H
// FILE: js/html-preview/transformer.js

/**
 * @class PreviewTransformer
 * @description The holy alchemist. It parses the JS source code 
 * into an AST tree and transmutes every relative import path 
 * into a manifested Blob URL.
 * 
 * THE POEM OF TRANSMUTATION:
 * Names are but pointers to Essence.
 * The browser seeks a name it knows, a URL.
 * We peer into the AST, the skeleton of the Word,
 * find the 'ImportDeclaration' sparks,
 * and replace the relative labels with the radiant light 
 * of the manifested Blob.
 */
export const PreviewTransformer = {
    /**
     * @async
     * @function transform
     * @description B"H. Uses the AST to replace import strings.
     * @param {string} code The raw JS essence.
     * @param {Function} resolver The function that manifestations path to Blob URLs.
     */
    async transform(code, resolver) {
        if (!code) return "";
        const ParserPromise = window.MerkavahParserPromise;
        if (!ParserPromise) {
            console.error("B\"H: AST Parser missing from heavens.");
            return code;
        }

        try {
            const Parser = await ParserPromise;
            const p = new Parser(code);
            // Awaken the parser's specific senses
            if (p.registerExpressionParsers) p.registerExpressionParsers();
            if (p.registerStatementParsers) p.registerStatementParsers();
            if (p.registerDeclarationParsers) p.registerDeclarationParsers();

            const ast = p.parse();
            const edits = [];

            // Divine Walk: Identify every import/export string
            const walk = (node) => {
                if (!node || typeof node !== 'object') return;
                
                const isImportExport = (
                    node.type === 'ImportDeclaration' || 
                    (node.type === 'ExportNamedDeclaration' && node.source) || 
                    node.type === 'ExportAllDeclaration' ||
                    node.type === 'ImportExpression'
                );

                if (isImportExport && node.source && node.source.type === 'Literal') {
                    edits.push(node.source);
                }

                for (const key in node) {
                    const child = node[key];
                    if (Array.isArray(child)) child.forEach(walk);
                    else walk(child);
                }
            };
            walk(ast);

            // Process back-to-front to preserve offsets
            edits.sort((a, b) => b.start - a.start);

            let transformed = code;
            for (const node of edits) {
                const originalPath = node.value;
                const newUrl = await resolver(originalPath);
                
                if (newUrl && newUrl !== originalPath) {
                    const start = node.start;
                    const end = node.end;
                    transformed = transformed.slice(0, start) + `"${newUrl}"` + transformed.slice(end);
                }
            }

            return transformed;
        } catch (e) {
            console.error("B\"H: AST Transmutation Shevirah:", e);
            return code; // Fallback to raw essence if parsing fails
        }
    }
};
