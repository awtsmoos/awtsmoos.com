
// B"H
import { Linter } from '../linter.js';
import { ASTDocs } from './docs.js';

export const ASTSummary = {
    async getSummaryAtOffset(code, offset) {
        if (!Linter.isReady) return null;

        try {
            const ast = Linter.getAST(code);
            if (!ast || ast.error) return null;
            
            let bestMatch = null;
            
            const traverse = (node) => {
                if (!node || typeof node !== 'object') return;
                
                // PERFORMANCE GUARD: Skip nodes far away from current offset
                if (node.end < offset - 500 && node.type !== 'Program') return; 
                if (node.start > offset + 500 && node.type !== 'Program') return;

                let targetRange = null;
                let targetNode = node;

                // Handle Declarations and Methods
                if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
                    if (node.id) targetRange = node.id;
                } 
                else if (node.type === 'MethodDefinition' || node.type === 'Property') {
                    if (node.key) targetRange = node.key;
                } 
                else if (node.type === 'VariableDeclarator') {
                    if (node.init && (node.init.type.includes('Function'))) {
                        if (node.id) targetRange = node.id;
                    }
                }

                if (targetRange) {
                    if (offset >= targetRange.start && offset <= targetRange.end) {
                        bestMatch = targetNode;
                    }
                }

                for (const key in node) {
                    if (key === 'loc' || key === 'range' || key === 'start' || key === 'end') continue;
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) node[key].forEach(traverse);
                        else traverse(node[key]);
                    }
                }
            };
            
            traverse(ast);
            
            if (bestMatch) {
                const line = (code.substring(0, bestMatch.start).match(/\n/g) || []).length + 1;
                return {
                    type: 'function',
                    summary: `${this._formatNodeSummary(bestMatch)} (Line ${line})`,
                    signature: this._extractSignature(bestMatch),
                    docs: ASTDocs.extractDocs(code, bestMatch)
                };
            }
        } catch(e) { console.warn("AST Summary Error", e); }
        return null;
    },

    _formatNodeSummary(node) {
        if (node.type === 'ClassDeclaration') return 'Class';
        let type = 'Function';
        if (node.type === 'MethodDefinition') {
            type = node.kind === 'constructor' ? 'Constructor' : 'Method';
            if (node.static) type = 'Static ' + type;
        }
        else if (node.type === 'Property') {
            if (node.kind === 'get') type = 'Getter';
            else if (node.kind === 'set') type = 'Setter';
            else type = 'Method';
        }
        const funcNode = (node.value && (node.value.type.includes('Function'))) 
            ? node.value 
            : (node.init ? node.init : node);
        if (funcNode?.async) type = 'Async ' + type;
        if (funcNode?.generator) type = 'Generator ' + type;
        return type;
    },

    _extractSignature(node) {
        let name = '';
        let funcNode = node;
        if (node.type === 'VariableDeclarator') {
            name = node.id.name;
            funcNode = node.init;
        } else if (node.type === 'MethodDefinition' || node.type === 'Property') {
            name = node.key.name || node.key.value; 
            funcNode = node.value;
        } else if (node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') {
            name = node.id ? node.id.name : '(anonymous)';
        }
        const formatParams = (params) => {
            if(!params || params.length === 0) return '';
            return params.map(p => {
                if (p.type === 'Identifier') return p.name;
                if (p.type === 'AssignmentPattern') return `${p.left.name}?`; 
                if (p.type === 'RestElement') return `...${p.argument.name}`;
                return 'arg';
            }).join(', ');
        };
        const params = funcNode.params || (funcNode.value && funcNode.value.params) || [];
        const paramStr = formatParams(params);
        if (node.type === 'ClassDeclaration') return `class ${name}`;
        if (node.kind === 'get') return `get ${name}()`;
        if (node.kind === 'set') return `set ${name}(${paramStr})`;
        return `${name}(${paramStr})`;
    },

    getParamNames(node) {
        let funcNode = node;
        if (node.type === 'VariableDeclarator') funcNode = node.init;
        else if (node.type === 'MethodDefinition' || node.type === 'Property') funcNode = node.value;
        const params = funcNode?.params || (funcNode?.value && funcNode.value.params) || [];
        return params.map(p => {
            if (p.type === 'Identifier') return p.name;
            if (p.type === 'AssignmentPattern') return p.left.name;
            if (p.type === 'RestElement') return p.argument.name;
            return 'arg';
        });
    }
};
