// B"H
const { tokenize } = require('./lexer.js');
// CHANGE: Remove '.js' extension to load from the directory/index.js
const { Parser } = require('./parser'); 
const { Emitter } = require('./emitter');

function compile(source) {
    const tokens = tokenize(source);
    
    // The new modular Parser class
    const parser = new Parser(tokens);
    const ast = parser.parse();
    
    // The new modular Emitter class
    const emitter = new Emitter();
    return emitter.emit(ast);
}

module.exports = { compile };