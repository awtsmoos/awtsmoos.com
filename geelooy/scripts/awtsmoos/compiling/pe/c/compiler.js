/*
B"H
Boruch Hashem
Biezrash Hashem
*/
import { tokenize } from './lexer.js';
import { parse } from './parser/index.js';
import { generateAsm } from './codegen/index.js';
import { STD_LIBS } from './std/index.js';

function preprocess(source) {
    const lines = source.split('\n');
    const output = [];
    const included = new Set();

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#include')) {
            const match = trimmed.match(/<(.+)>/);
            if (match) {
                const libName = match[1];
                if (!included.has(libName) && STD_LIBS[libName]) {
                    output.push(`// --- BEGIN ${libName} ---`);
                    output.push(STD_LIBS[libName]);
                    output.push(`// --- END ${libName} ---`);
                    included.add(libName);
                }
            }
        } else {
            output.push(line);
        }
    }
    return output.join('\n');
}

export function compileC(source) {
    const processedSource = preprocess(source);
    
    // DEBUG: Log consolidated source
    const lines = processedSource.split('\n');
    console.log("%c--- CONSOLIDATED C SOURCE ---", "color: #0ff; font-weight: bold;");
    lines.forEach((line, i) => {
        console.log(`${(i+1).toString().padStart(3, ' ')} | ${line}`);
    });
    console.log("-------------------------------");

    const tokens = tokenize(processedSource);
    const ast = parse(tokens);
    const asmSource = generateAsm(ast);
    return asmSource;
}