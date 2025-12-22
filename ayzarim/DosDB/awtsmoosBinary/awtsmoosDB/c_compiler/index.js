// B"H
const { tokenize } = require('./lexer.js');
const { Parser } = require('./parser.js');
const { Emitter } = require('./emitter.js');

function compile(source) {
    const tokens = tokenize(source);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const emitter = new Emitter();
    return emitter.emit(ast);
}

module.exports = { compile };