
// B"H
import { TextActions } from '../text.js';

export const TEXT_TRANS_ACTIONS = {
    'select-all': () => TextActions.selectAll(),
    'copy-all': () => TextActions.copyAll(),
    'beautify': () => {},
    'insert-cyber-ipsum': () => TextActions.insertCyberIpsum(),
    'zalgo-text': () => TextActions.zalgoText(),
    'text-binary': () => TextActions.textBinary(),
    'text-reverse': () => TextActions.textReverse(),
    'transform-upper': () => TextActions.transformUpper(),
    'transform-lower': () => TextActions.transformLower(),
    'transform-title': () => TextActions.transformTitle(),
    'transform-base64-encode': () => TextActions.base64Encode(),
    'transform-base64-decode': () => TextActions.base64Decode(),
    'transform-url-encode': () => TextActions.urlEncode(),
    'transform-url-decode': () => TextActions.urlDecode(),
    'sort-lines': () => TextActions.sortLines(),
    'trim-trailing-whitespace': () => TextActions.trimTrailingWhitespace(), // B"H - Added Action
    'insert-date': () => TextActions.insertDate(),
    'insert-uuid': () => TextActions.insertUUID(),
    'fold-functions': () => {
        import('../../tools/ast-engine.js').then(m => m.ASTEngine.foldBlocks());
    }
};
