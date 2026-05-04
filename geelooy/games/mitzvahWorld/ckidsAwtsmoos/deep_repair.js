const fs = require('fs');
const path = require('path');

const filesToFix = [
    {
        path: 'tochen/worlds/emeraldVillage/villageCompiler.js',
        fixes: [
            {
                target: /const trace = \(msg\) => \/\/ B"H: silent/g,
                replace: 'const trace = (msg) => { /* B"H: silent */ };'
            }
        ]
    },
    {
        path: 'Olam/methods/placeholderAndEntities.js',
        fixes: [
            {
                target: /\} \/\/else\{\/\/ B"H: silent/g,
                replace: '} else { // B"H: silent'
            }
        ]
    }
];

const rootDir = path.resolve(__dirname);

filesToFix.forEach(f => {
    const fullPath = path.resolve(rootDir, f.path);
    if (!fs.existsSync(fullPath)) {
        console.error(`B"H - File not found: ${f.path}`);
        return;
    }
    
    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let original = content;
        
        f.fixes.forEach(fix => {
            content = content.replace(fix.target, fix.replace);
        });
        
        if (content !== original) {
            fs.writeFileSync(fullPath, content);
            console.log(`B"H - Deep Repaired: ${f.path}`);
        }
    } catch (e) {
        console.error(`B"H - Error fixing ${f.path}:`, e);
    }
});
