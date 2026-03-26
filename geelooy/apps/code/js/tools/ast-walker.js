
// B"H
// FILE: js/tools/ast-walker.js

export const ASTWalker = {
    async findImports(code, absPath, getLine) {
        const sources = [];
        const ParserPromise = window.MerkavahParserPromise;
        
        if (!ParserPromise) {
            console.warn(`[ASTWalker] B"H - Parser absent for ${absPath}.`);
            return sources;
        }

        try {
            const Parser = await ParserPromise;
            const p = new Parser(code);
            if (p.registerExpressionParsers) p.registerExpressionParsers();
            if (p.registerStatementParsers) p.registerStatementParsers();
            if (p.registerDeclarationParsers) p.registerDeclarationParsers();
            
            const ast = p.parse();

            const walk = (node) => {
                if (!node || typeof node !== 'object') return;
                
                const isImportDecl = node.type === 'ImportDeclaration';
                const isExportSource = (node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') && node.source;
                
                if (isImportDecl || isExportSource) {
                    if (node.source && (node.source.type === 'Literal' || node.source.type === 'StringLiteral')) {
                        console.log(`[ASTWalker] Found Static Import: "${node.source.value}" at line ${getLine(node.source.start || 0)} in ${absPath}`);
                        sources.push(node.source);
                    }
                } else if (node.type === 'ImportExpression' || 
                         (node.type === 'CallExpression' && node.callee && (node.callee.type === 'Import' || (node.callee.type === 'Identifier' && node.callee.name === 'import')))) {
                    
                    const arg = node.source || (node.arguments && node.arguments[0]);
                    if (arg && (arg.type === 'Literal' || arg.type === 'StringLiteral')) {
                        console.log(`[ASTWalker] Found Dynamic Import: "${arg.value}" at line ${getLine(arg.start || 0)} in ${absPath}`);
                        sources.push(arg);
                    } else if (arg && arg.type === 'TemplateLiteral' && arg.quasis && arg.quasis.length === 1) {
                        console.log(`[ASTWalker] Found Dynamic Template Import: "${arg.quasis[0].value.raw}" at line ${getLine(arg.start || 0)} in ${absPath}`);
                        sources.push({ value: arg.quasis[0].value.raw, start: arg.start, end: arg.end });
                    }
                }

                // Also support CommonJS Require (require('./y')) as a fallback for universal scanning
                if (node.type === 'CallExpression' && node.callee && node.callee.name === 'require') {
                    const arg = node.arguments && node.arguments[0];
                    if (arg && (arg.type === 'Literal' || arg.type === 'StringLiteral')) {
                        console.log(`[ASTWalker] Found CommonJS Require: "${arg.value}" at line ${getLine(arg.start || 0)} in ${absPath}`);
                        sources.push(arg);
                    }
                }

                for (const key in node) {
                    const child = node[key];
                    if (Array.isArray(child)) {
                        for (let k = 0; k < child.length; k++) walk(child[k]);
                    } else {
                        walk(child);
                    }
                }
            };
            walk(ast);
        } catch (e) {
            console.warn(`[ASTWalker] B"H - AST Parse failed for ${absPath}. Relying fully on Regex Net. Error:`, e);
        }
        return sources;
    }
};
