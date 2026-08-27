// B"H
import { GRID_COLS } from '../constants.js';

export function renderEditorGrid(gridElement, layout, onCellClick) {
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;
    const rowCount = layout.length; // The grid's height is now determined by the layout itself.
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'editor-cell';
            const health = layout[r]?.[c];
            if (health) {
                cell.textContent = health;
                cell.style.backgroundColor = `rgba(34, 211, 238, ${Math.min(1, health / 200)})`;
                cell.dataset.hasBrick = "true";
            }
            cell.addEventListener('click', () => onCellClick(r, c, health));
            gridElement.appendChild(cell);
        }
    }
}