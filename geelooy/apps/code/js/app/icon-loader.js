// B"H
// FILE: js/app/icon-loader.js

export async function loadIcons() {
    try {
        const response = await fetch('assets/icons.svg');
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const text = await response.text();
        
        const div = document.createElement('div');
        div.innerHTML = text;
        const svg = div.querySelector('svg');
        
        if (svg) {
            svg.classList.add('hidden'); // Ensure it stays hidden
            document.body.insertBefore(svg, document.body.firstChild);
        } else {
            console.error('No SVG found in icons file.');
        }
    } catch (e) {
        console.error('Failed to load icons:', e);
    }
}