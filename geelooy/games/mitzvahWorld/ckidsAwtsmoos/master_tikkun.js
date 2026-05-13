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

        // 1. Convert silent markers back to a single line comment.

        // BUT only if it was originally a block comment. 
        // Actually, let's just do it for all since we want to avoid swallowing code.
        content = content.replace(/\/\/ B"H: silent/g, '// B"H: silent\n');

        // 2. Fix the nested comment issue.
        // This was the main cause of the break.
        content = content.replace(/\/\*\s*\/\*\s*B"H: silent\s*\*\/\s*\*\//g, '// B"H: silent\n');
        
        // 3. Fix another common broken pattern.
        content = content.replace(/\/\*\s*\/\/ B"H: silent\s*\*\//g, '// B"H: silent\n');

        if (content !== original) {
            fs.writeFileSync(f, content);
            console.log('Fixed Brackets: ' + path.relative(rootDir, f));
        }
    } catch (e) {}
});
