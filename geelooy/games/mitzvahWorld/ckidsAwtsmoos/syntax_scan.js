const { execSync } = require('child_process');
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

console.log(`B"H - Scanning ${files.length} files for arrow function or trailing syntax errors...`);

files.forEach(f => {
    try {
        const content = fs.readFileSync(f, 'utf8');
        // Simple heuristic for swallowed arrow functions: => followed by // B"H: silent
        if (/=>\s*\/\/ B"H: silent/.test(content)) {
             console.error(`B"H - 🚨 Swallowed arrow function in ${path.relative(rootDir, f)}`);
        }
        
        // Also check for unbalanced openers as before
        const brackets = { '{': 0, '[': 0, '(': 0 };
        const openers = { '{': '}', '[': ']', '(': ')' };
        const closers = { '}': '{', ']': '[', ')': '(' };
        
        let inString = false;
        let stringChar = '';
        let inComment = false;
        let commentType = ''; 

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const next = content[i+1];
            if (inComment) {
                if (commentType === 'line' && char === '\n') inComment = false;
                else if (commentType === 'block' && char === '*' && next === '/') { inComment = false; i++; }
                continue;
            }
            if (inString) {
                if (char === stringChar && content[i-1] !== '\\') inString = false;
                continue;
            }
            if (char === '/' && next === '/') { inComment = true; commentType = 'line'; i++; continue; }
            if (char === '/' && next === '*') { inComment = true; commentType = 'block'; i++; continue; }
            if (char === "'" || char === '"' || char === '`') { inString = true; stringChar = char; continue; }
            if (openers[char]) brackets[char]++;
            else if (closers[char]) {
                brackets[closers[char]]--;
                if (brackets[closers[char]] < 0) {
                     console.error(`B"H - 🚨 Unbalanced closer [${char}] in ${path.relative(rootDir, f)} near char ${i}`);
                     break;
                }
            }
        }
        for (const [key, count] of Object.entries(brackets)) {
            if (count !== 0) {
                console.error(`B"H - 🚨 Unbalanced opener [${key}] in ${path.relative(rootDir, f)} (Count: ${count})`);
            }
        }
    } catch (e) {}
});

console.log('B"H - Scan complete.');
