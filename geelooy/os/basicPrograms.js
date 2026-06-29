// B"H
import awtsmoosTextEdit from './programs/awtsmoos-text/index.js';
import awtsmoosFileExplorer from './programs/awtsmoos-file-explorer/index.js';
import awtsmoosBinaryViewer from './programs/awtsmoos-binary-viewer/index.js';
import openWithSelector from './programs/open-with-selector/index.js';
import advancedCodeEditor from './programs/advanced-code-editor/index.js';
import awtsmoosDiagnostics from './programs/awtsmoos-diagnostics/index.js';
export const programs = { awtsmoosTextEdit:{ name:'Text Editor', launch:awtsmoosTextEdit }, awtsmoosFileExplorer:{ name:'File Explorer', launch:awtsmoosFileExplorer }, awtsmoosBinaryViewer:{ name:'Binary Viewer', launch:awtsmoosBinaryViewer }, openWithSelector:{ name:'Open With...', launch:openWithSelector }, advancedCodeEditor:{ name:'Advanced Code Editor', launch:advancedCodeEditor }, awtsmoosDiagnostics:{ name:'Developer Diagnostics', launch:awtsmoosDiagnostics } };
export const programsByExtension = { '.js':['advancedCodeEditor','awtsmoosTextEdit'], '.html':['advancedCodeEditor','awtsmoosTextEdit'], '.css':['advancedCodeEditor','awtsmoosTextEdit'], '.json':['advancedCodeEditor','awtsmoosTextEdit'], '.txt':['awtsmoosTextEdit','advancedCodeEditor'], '.folder':['awtsmoosFileExplorer'] };
export const initialDefaultPrograms = { '.js':'advancedCodeEditor', '.html':'advancedCodeEditor', '.css':'advancedCodeEditor', '.json':'advancedCodeEditor', '.txt':'awtsmoosTextEdit', '.folder':'awtsmoosFileExplorer' };
export let defaultPrograms = {};
export function getDefaultProgram(ext) { const progName = defaultPrograms[ext] || 'awtsmoosBinaryViewer'; return programs[progName].launch; }
/** B"H: diagnostics becomes a first-class program in the registry. */
