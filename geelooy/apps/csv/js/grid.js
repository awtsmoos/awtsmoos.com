//B"H
/**
 * Handles DOM manipulation for the Grid.
 * Direct DOM updates for performance.
 */

export class GridUI {
    constructor(container, initialData, onDataChange) {
        this.container = container;
        this.data = initialData;
        this.onDataChange = onDataChange;
        this.render();
    }

    setData(newData) {
        this.data = newData;
        this.render();
    }

    updateCell(r, c, value) {
        this.data[r][c] = value;
        this.onDataChange(this.data);
    }

    addRow() {
        const cols = this.data[0] ? this.data[0].length : 0;
        this.data.push(new Array(cols).fill(''));
        this.render(); // Full re-render is acceptable for this scale
        this.onDataChange(this.data);
    }

    addCol() {
        this.data.forEach(row => row.push(''));
        this.render();
        this.onDataChange(this.data);
    }

    render() {
        this.container.innerHTML = '';
        const table = document.createElement('table');
        
        // --- Header Row ---
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Corner cell
        const corner = document.createElement('th');
        corner.className = 'corner';
        headerRow.appendChild(corner);

        // Column headers (A, B, C...)
        const colCount = this.data[0] ? this.data[0].length : 0;
        for (let i = 0; i < colCount; i++) {
            const th = document.createElement('th');
            th.textContent = this.getColumnLabel(i);
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // --- Body ---
        const tbody = document.createElement('tbody');
        
        // Use document fragment for batch insertion
        const fragment = document.createDocumentFragment();

        this.data.forEach((row, rIndex) => {
            const tr = document.createElement('tr');
            
            // Row Header (1, 2, 3...)
            const th = document.createElement('td');
            th.className = 'row-header';
            th.textContent = rIndex + 1;
            tr.appendChild(th);

            // Data Cells
            row.forEach((cellData, cIndex) => {
                const td = document.createElement('td');
                td.className = 'cell';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.value = cellData;
                input.dataset.r = rIndex;
                input.dataset.c = cIndex;
                
                // Event Listeners for Input
                // Changed from 'change' to 'input' to capture real-time updates
                // This fixes the issue where Ctrl+S while typing didn't save the current cell
                input.addEventListener('input', (e) => {
                    this.updateCell(rIndex, cIndex, e.target.value);
                });

                // Navigation keys could be added here
                
                td.appendChild(input);
                tr.appendChild(td);
            });

            fragment.appendChild(tr);
        });

        tbody.appendChild(fragment);
        table.appendChild(tbody);
        this.container.appendChild(table);
    }

    getColumnLabel(index) {
        let label = '';
        let i = index;
        while (i >= 0) {
            label = String.fromCharCode(65 + (i % 26)) + label;
            i = Math.floor(i / 26) - 1;
        }
        return label;
    }
}