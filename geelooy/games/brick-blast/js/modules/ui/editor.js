// B"H
import * as persistence from '../../persistence.js';
import { GRID_COLS, GRID_ROWS } from '../../constants.js';
import { renderEditorGrid, showScreen } from '../../ui.js';
import { HealthTuner } from './health-tuner.js';

export class Editor {
    constructor(elements, uiManager) {
        this.elements = elements;
        this.uiManager = uiManager;
        this.currentLevel = null;
        this.brushHealth = 10;
        this.isErasing = false;
        this.healthTuner = new HealthTuner(elements);
    }
    
    showBrushHealthTuner() {
        this.healthTuner.show(this.brushHealth, (newHealth) => {
            this.brushHealth = newHealth;
            document.getElementById('brush-health-display').textContent = `Health: ${this.brushHealth}`;
        });
    }

    async showLevelEditor(levelId) {
        const customLevels = await persistence.getCustomLevels();
        this.currentLevel = levelId ? customLevels.find(l => l.id === levelId) : null;
        
        let layout;
        if (this.currentLevel) {
            this.elements.levelNameInput.value = this.currentLevel.name;
            layout = this.currentLevel.layout;
        } else {
            this.elements.levelNameInput.value = '';
            layout = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(null));
        }

        this.elements.editorGrid.dataset.layout = JSON.stringify(layout);
        this.render();
        showScreen('level-editor-screen');
    }
    
    render() {
        const layout = JSON.parse(this.elements.editorGrid.dataset.layout);
        renderEditorGrid(this.elements.editorGrid, layout, (r, c, health) => this.onCellClick(r, c, health));
    }

    onCellClick(row, col, currentHealth) {
        if (this.isErasing) {
            this.updateBrick(row, col, null);
            return;
        }

        if (currentHealth) {
            this.healthTuner.show(currentHealth, (newHealth) => {
                this.updateBrick(row, col, newHealth);
                this.brushHealth = newHealth;
                document.getElementById('brush-health-display').textContent = `Health: ${this.brushHealth}`;
            });
        } else {
            this.updateBrick(row, col, this.brushHealth);
        }
    }

    updateBrick(row, col, newHealth) {
        const layout = JSON.parse(this.elements.editorGrid.dataset.layout);
        layout[row][col] = newHealth > 0 ? newHealth : null;
        this.elements.editorGrid.dataset.layout = JSON.stringify(layout);
        this.render();
    }


    addRowAbove() {
        const gridContainer = this.elements.editorGrid.parentElement;
        const oldScrollHeight = gridContainer.scrollHeight;

        const layout = JSON.parse(this.elements.editorGrid.dataset.layout);
        layout.unshift(Array(GRID_COLS).fill(null));
        this.elements.editorGrid.dataset.layout = JSON.stringify(layout);
        this.render();
        
        const newScrollHeight = gridContainer.scrollHeight;
        gridContainer.scrollTop += newScrollHeight - oldScrollHeight;
    }

    async saveLevel() {
        const nameInput = this.elements.levelNameInput;
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.style.borderColor = 'var(--danger)';
            nameInput.placeholder = 'A name is required!';
            setTimeout(() => {
                nameInput.style.borderColor = '';
            }, 2000);
            return;
        }
        const layout = JSON.parse(this.elements.editorGrid.dataset.layout);
        const newLevel = {
            id: this.currentLevel ? this.currentLevel.id : `custom_${Date.now()}`,
            name,
            layout: layout, // Preserve empty rows
            static: true // All custom levels are static for now.
        };
        await persistence.saveCustomLevel(newLevel);
        await this.uiManager.showCustomLevels();
    }
    
    toggleEraser(button) {
        this.isErasing = !this.isErasing;
        button.classList.toggle('active', this.isErasing);
    }
    
    async importLevel(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const level = JSON.parse(e.target.result);
                if (level.name && level.layout) {
                    level.id = `custom_${Date.now()}`;
                    await persistence.saveCustomLevel(level);
                    await this.uiManager.showCustomLevels();
                } else {
                    alert('Invalid level file format.');
                }
            } catch (error) {
                alert('Could not parse level file.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }
}