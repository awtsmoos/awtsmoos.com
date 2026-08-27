// B"H

import { GRID_COLS } from '../../constants.js';

const levelEditorStyles = `
/* B"H - LEVEL EDITOR STYLES */

#level-editor-screen { 
    gap: 1rem; 
    padding: 1rem;
    overflow-y: auto; /* This allows the whole screen to scroll if needed on small heights */
}
#level-editor-screen .header { margin-bottom: 0; }
#level-name-input {
    flex-grow: 1;
    margin: 0 1rem;
    background: var(--bg-dark-_1);
    border: 2px solid var(--bg-dark-_2);
    color: var(--text-light);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 1.1rem;
    text-align: center;
    transition: border-color 0.3s;
}
.editor-grid-container {
    width: 100%;
    background-color: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 8px;
    box-sizing: border-box;
    flex-grow: 1; /* Take up remaining space */
    min-height: 0; /* Necessary for flex-grow in a flex column */
    overflow-y: auto; /* Allow the grid itself to scroll */
}
#editor-grid {
    display: grid;
    grid-template-columns: repeat(${GRID_COLS}, 1fr);
    grid-auto-rows: 40px; /* Each row has a fixed height */
    width: 100%;
    gap: 4px;
}
.editor-cell {
    background-color: rgba(0,0,0,0.3);
    border-radius: 2px;
    cursor: pointer;
    transition: background-color 0.2s;
    color: white;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
}
.editor-cell:hover { background-color: rgba(34, 211, 238, 0.5); }
.editor-tools {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex-shrink: 0; /* Prevent these from shrinking */
    flex-wrap: wrap; /* Allow tools to wrap on smaller screens */
}
.editor-actions {
    display: flex;
    gap: 1rem;
    align-items: stretch; /* Make items same height */
    justify-content: space-between;
    width: 100%;
    flex-shrink: 0;
    flex-wrap: wrap;
}
.tool-button {
    background: var(--bg-dark-_2);
    border: 1px solid var(--bg-dark-_1);
    color: var(--text-light);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
}
.tool-button.active {
    background-color: var(--primary-accent);
    color: var(--text-dark);
}
.ai-controls {
    display: flex;
    flex-grow: 1;
    gap: 0.5rem;
}
.ai-controls .select-wrapper {
    flex-grow: 1;
}
.ai-controls select {
    height: 100%;
    font-size: 1rem;
    font-weight: 700;
}
.ai-controls .btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 8px;
}
#save-level-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 8px;
}

/* Custom Scrollbar for the Creator's Divine Canvas */
.editor-grid-container::-webkit-scrollbar {
  width: 16px;
}
.editor-grid-container::-webkit-scrollbar-track {
  background: var(--bg-dark-_1);
  border-radius: 8px;
}
.editor-grid-container::-webkit-scrollbar-thumb {
  background-color: var(--primary-accent);
  border-radius: 8px;
  border: 3px solid var(--bg-dark-_1);
}
.editor-grid-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--primary-accent-hover);
}
`;

export default levelEditorStyles;