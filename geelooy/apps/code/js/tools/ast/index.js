
// B"H
import { ASTSummary } from './summary.js';
import { ASTFolding } from './folding.js';

export const ASTEngine = {
    setEditor: (editor) => ASTFolding.setEditor(editor),
    getSummaryAtOffset: (code, offset) => ASTSummary.getSummaryAtOffset(code, offset),
    getFoldableLines: (code) => ASTFolding.getFoldableLines(code),
    toggleFoldAtLine: (line) => ASTFolding.toggleFoldAtLine(line),
    unfoldById: (id) => ASTFolding.unfoldById(id),
    unfoldAll: () => ASTFolding.unfoldAll(),
    foldBlocks: () => ASTFolding.foldBlocks()
};
