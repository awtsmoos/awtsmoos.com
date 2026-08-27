// B"H

const levelGridStyles = `
/* B"H - LEVEL & STORE GRIDS */

.level-grid, .custom-level-list, .store-grid {
  overflow-y: auto;
  width: 100%;
  padding: 0 0.5rem;
  flex-grow: 1;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 1rem;
}

.custom-level-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
}

.store-grid { 
    display: flex; 
    flex-direction: column; 
    gap: 1rem; 
}


/* --- Custom Levels Screen Specifics --- */
.custom-levels-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    flex-shrink: 0;
}
.custom-levels-actions .btn {
    padding: 0.75rem 1.5rem;
}
.no-custom-levels {
    text-align: center;
    color: var(--text-muted);
    margin-top: 2rem;
    grid-column: 1 / -1; /* Span full width */
}
.custom-level-item {
    aspect-ratio: 1 / 1;
    background-color: var(--bg-dark-_1);
    border-radius: 8px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}
.custom-level-item:hover {
    transform: translateY(-4px);
    border-color: var(--primary-accent);
    box-shadow: 0 4px 10px rgba(34, 211, 238, 0.3);
}
.custom-level-name {
    font-weight: 700;
    text-align: center;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}
.custom-level-buttons {
    display: flex;
    gap: 0.5rem;
    background-color: rgba(0,0,0,0.4);
    padding: 4px;
    border-radius: 99px;
}
.custom-level-buttons .btn-icon {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 2px;
    transition: transform 0.2s;
}
.custom-level-buttons .btn-icon:hover {
    transform: scale(1.2);
}
`;

export default levelGridStyles;