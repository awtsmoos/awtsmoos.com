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

        // 1. Convert nested silent markers back to a single line comment.

        // This prevents the leading // from swallowing the rest of the line (including brackets)
        content = content.replace(/\/\/\s*\/\* B"H: silent \*\//g, '// B"H: silent\n');

        // 2. Also normalize ordinary silent markers.
        content = content.replace(/\/\/\s*B"H: silent/g, '// B"H: silent\n');

        if (content !== original) {
            fs.writeFileSync(f, content);
            console.log('Fixed Brackets (Deep): ' + path.relative(rootDir, f));
        }
    } catch (e) {}
});
