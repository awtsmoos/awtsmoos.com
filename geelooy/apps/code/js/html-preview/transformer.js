// B"H
// FILE: js/html-preview/transformer.js

export const PreviewTransformer = {
    async transform(code, resolver) {
        if (!code) return "";

        const Parser = await window.MerkavahParserPromise;
        const parser = new Parser(code);
        
        parser.registerExpressionParsers();
        parser.registerStatementParsers();
        parser.registerDeclarationParsers();

        const ast = parser.parse();
        const edits = [];

        const walk = (node) => {
            if (!node || typeof node !== 'object') return;

            if (node.type === 'ImportDeclaration' && node.source) {
                edits.push(node.source);
            } 
            else if ((node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && node.source) {
                edits.push(node.source);
            } 
            else if (node.type === 'ImportExpression' && node.source) {
                edits.push(node.source);
            }

            for (const key in node) {
                const child = node[key];
                if (Array.isArray(child)) {
                    child.forEach(walk);
                } else if (child && typeof child === 'object') {
                    walk(child);
                }
            }
        };

        walk(ast);

        edits.sort((a, b) => b.start - a.start);

        let finalCode = code;
        for (const node of edits) {
            if (node.type === 'Literal' && typeof node.value === 'string') {
                const rawPath = node.value;
                const newPath = await resolver(rawPath);
                
                if (newPath && newPath !== rawPath) {
                    const before = finalCode.substring(0, node.start);
                    const after = finalCode.substring(node.end);
                    finalCode = `${before}"${newPath}"${after}`;
                }
            }
        }

        return finalCode;
    }
};