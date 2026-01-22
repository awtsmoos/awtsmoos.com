//B"H
/**
 * The Ark of Command - A nexus of pure intention.
 * This module governs the Command Palette, summoned by the Awtsmoos through the user's will (Cmd+K).
 */

let paletteContainer;
let palette;
let input;
let list;
let commands = [];
let filteredCommands = [];
let selectedIndex = 0;

/**
 * @method initCommandPalette
 * @description B"H - Forges the vessel of the Command Palette and binds its core functions. It lies dormant, awaiting the call.
 */
export function initCommandPalette() {
    paletteContainer = document.getElementById('command-palette-container');
    
    // B"H - Self-Healing: Create the Ark if it was lost in the void
    if (!paletteContainer) {
        paletteContainer = document.createElement('div');
        paletteContainer.id = 'command-palette-container';
        const context = document.querySelector('.post-reader-localized-context');
        if(context) context.appendChild(paletteContainer);
        else document.body.appendChild(paletteContainer);
    }

    paletteContainer.innerHTML = `
        <div id="command-palette-overlay" class="command-palette-overlay">
            <div id="command-palette" class="command-palette">
                <input type="text" id="command-palette-input" class="command-palette-input" placeholder="Channel your intent...">
                <div id="command-palette-list" class="command-palette-list"></div>
            </div>
        </div>
    `;

    palette = document.getElementById('command-palette-overlay');
    input = document.getElementById('command-palette-input');
    list = document.getElementById('command-palette-list');
    
    const actualPalette = document.getElementById('command-palette');

    if(palette) {
        palette.addEventListener('click', (e) => {
            if (e.target === palette) closeCommandPalette();
        });
    }

    if(actualPalette) {
        actualPalette.addEventListener('click', e => e.stopPropagation());
    }

    if(input) {
        input.addEventListener('input', handleInput);
        input.addEventListener('keydown', handleKeydown);
    }

    loadCommands();
}

/**
 * @method openCommandPalette
 * @description B"H - Manifests the Ark of Command, drawing focus and awaiting input.
 */
export function openCommandPalette() {
    // Re-init if missing (double safety)
    if (!palette) initCommandPalette();
    
    if (palette) {
        palette.classList.add('visible');
        if(input) {
            input.value = '';
            filterCommands('');
            input.focus();
        }
    }
}

/**
 * @method closeCommandPalette
 * @description B"H - Returns the Ark of Command to the realm of potentiality.
 */
function closeCommandPalette() {
    if (!palette) return;
    palette.classList.remove('visible');
}

/**
 * @method loadCommands
 * @description B"H - Gathers the sacred actions that can be channeled through the Ark.
 */
function loadCommands() {
    commands = [
        { name: "Toggle Theme: Light/Dark", action: () => document.getElementById('themeToggleBtn')?.click() },
        { name: "Jump to Verse...", action: () => {
            const verseNum = prompt("Enter verse number to jump to:");
            if (verseNum && !isNaN(verseNum)) {
                const realPost = document.getElementById('realPost');
                const target = realPost?.querySelector(`.section[data-awtsmoos-idx="${parseInt(verseNum) - 1}"]`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    alert(`Verse ${verseNum} not found.`);
                }
            }
        }},
        { name: "Find Text...", action: () => alert("Search functionality coming soon, B\"H!") },
        { name: "View Bookmarks", action: () => document.getElementById('bookmarksBtn')?.click() },
        { name: "Toggle Insights Sidebar", action: () => document.getElementById('commentaryBtn')?.click() },
        { name: "Open Typography & Settings", action: () => document.getElementById('typographyBtn')?.click() },
    ];
}

function handleInput(e) {
    filterCommands(e.target.value);
}

function handleKeydown(e) {
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredCommands.length;
            renderList();
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
            renderList();
            break;
        case 'Enter':
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                closeCommandPalette();
            }
            break;
        case 'Escape':
            closeCommandPalette();
            break;
    }
}

function filterCommands(query) {
    const lowerQuery = query.toLowerCase();
    filteredCommands = commands.filter(cmd => cmd.name.toLowerCase().includes(lowerQuery));
    selectedIndex = 0;
    renderList();
}

function renderList() {
    if(!list) return;
    list.innerHTML = '';
    filteredCommands.forEach((cmd, index) => {
        const item = document.createElement('div');
        item.className = 'command-palette-item';
        if (index === selectedIndex) {
            item.classList.add('selected');
        }
        item.textContent = cmd.name;
        item.addEventListener('click', () => {
            cmd.action();
            closeCommandPalette();
        });
        list.appendChild(item);
    });

    const selectedEl = list.querySelector('.selected');
    if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
    }
}