// B"H
import { beautify } from './beautifier.js';

document.addEventListener('DOMContentLoaded', () => {
    const beautifyBtn = document.getElementById('beautify-btn');
    const copyBtn = document.getElementById('copy-btn');
    const jsInput = document.getElementById('js-input');
    const jsOutput = document.getElementById('js-output');
    const errorDisplay = document.getElementById('error-display');

    // Simple test code to start with
    jsInput.value = `// B"H\nconst   myArr= [1,2,3,4,5];\nfunction hello( name){console.log(\`Hello, \${name}!\`)}\nif(true){hello('World');}`;

    beautifyBtn.addEventListener('click', async () => {
        const code = jsInput.value;
        if (!code) {
            jsOutput.textContent = '';
            errorDisplay.style.display = 'none';
            return;
        }

        beautifyBtn.textContent = 'Beautifying...';
        beautifyBtn.disabled = true;

        try {
            const formattedCode = await beautify(code);
            jsOutput.textContent = formattedCode;
            errorDisplay.style.display = 'none';
        } catch (error) {
            console.error("Beautification failed:", error);
            jsOutput.textContent = '';
            errorDisplay.textContent = error.message;
            errorDisplay.style.display = 'block';
        } finally {
            beautifyBtn.textContent = 'Beautify Code';
            beautifyBtn.disabled = false;
        }
    });

    copyBtn.addEventListener('click', () => {
        if (jsOutput.textContent) {
            navigator.clipboard.writeText(jsOutput.textContent)
                .then(() => alert('Beautified code copied to clipboard!'))
                .catch(err => console.error('Failed to copy text: ', err));
        }
    });
});