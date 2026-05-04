const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(function(file) {
            const fullPath = path.resolve(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat && stat.isDirectory()) {
                if (!file.includes('node_modules') && !file.includes('.git')) {
                    results = results.concat(walk(fullPath));
                }
            } else if (fullPath.endsWith('.js')) {
                results.push(fullPath);
            }
        });
    } catch (e) {}
    return results;
}

const rootDir = __dirname;
const files = walk(rootDir);

files.forEach(f => {
    if (f === __filename) return;
    try {
        let content = fs.readFileSync(f, 'utf8');
        let original = content;

        // B"H - The Ultimate Tikkun
        // 1. Replace ALL block silents with line silents followed by a newline.
        // The newline ensures that any trailing code (like a brace or paren) 
        // is NOT swallowed by the line comment.
        // The use of // instead of /* */ prevents nesting errors entirely.
        content = content.replace(/\/\* B"H: silent \*\//g, '// B"H: silent\n');

        if (content !== original) {
            fs.writeFileSync(f, content);
            console.log('Ultimate Tikkun: ' + path.relative(rootDir, f));
        }
    } catch (e) {}
});
