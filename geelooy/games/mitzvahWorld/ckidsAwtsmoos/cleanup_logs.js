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
    try {
        const content = fs.readFileSync(f, 'utf8');
        const lines = content.split('\n');
        let fixed = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Look for lines starting with trailing log syntax
            // like , "color: ..." or );
            if (line.startsWith(', "color:') || line === ');' || line === ');') {
                if (i > 0 && lines[i-1].includes('// B"H: silent')) {
                    console.log(`B"H - Fixing trailing log artifact in ${path.relative(rootDir, f)} at line ${i+1}`);
                    lines[i] = '// B"H: silent'; // Comment it out
                    fixed = true;
                }
            }
        }
        
        if (fixed) {
            fs.writeFileSync(f, lines.join('\n'));
        }
    } catch (e) {}
});
