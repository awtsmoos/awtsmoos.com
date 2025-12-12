
// B"H
// This file is deprecated in favor of modular visitors in the visitors/ directory.
// We keep it as a shell to prevent 404s if referenced, but it defines nothing.
(function(root) {
    root.MerkavaCompiler = root.MerkavaCompiler || {};
    // B"H - Do NOT define monolithic visitors here. 
    // The modular files (declarations.js, expressions.js, etc.) handle this.
})(typeof self !== 'undefined' ? self : this);
