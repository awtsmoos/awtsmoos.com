
// B"H
const { tokenize } = require('./lexer.js');
const { Parser } = require('./parser'); 
const { Emitter } = require('./emitter');
const Preprocessor = require('./preprocessor.js');

function compile(source) {
    // 1. Preprocess Macros
    const pre = new Preprocessor();
    const expandedSource = pre.process(source);
    
    // 2. Tokenize
    const tokens = tokenize(expandedSource);
    
    // 3. Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    // 4. Emit WASM
    const emitter = new Emitter();
    return emitter.emit(ast);
}

module.exports = { compile };
