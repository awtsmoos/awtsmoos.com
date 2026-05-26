// /heichelos/heichel/modules/dragdrop.js
// B"H 
//- Drag and Drop functionality for reordering items.
import { notify } from './ui.js';

let draggedItem = null;
let placeholder = null;

function handleDragStart(e) {
    if (!e.target.classList.contains('card-wrapper')) return;
    draggedItem = e.target;
    setTimeout(() => e.target.classList.add('dragging'), 0);
    
    placeholder = document.createElement('div');
    placeholder.className = 'placeholder card-wrapper';
    placeholder.style.height = `${draggedItem.offsetHeight}px`;
    
    e.currentTarget.addEventListener('dragover', handleDragOver);
    e.currentTarget.addEventListener('drop', handleDrop);
}

function handleDragOver(e) {
    e.preventDefault();
    const overElement = e.target.closest('.card-wrapper:not(.placeholder)');
    if (overElement && overElement !== draggedItem) {
        const rect = overElement.getBoundingClientRect();
        const isAfter = e.clientY > rect.top + rect.height / 2;
        overElement.parentElement.insertBefore(placeholder, isAfter ? overElement.nextSibling : overElement);
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.replaceChild(draggedItem, placeholder);
        const newOrder = [...draggedItem.parentElement.children].map(c => c.dataset.id).filter(Boolean);
        container.dataset.currentOrder = JSON.stringify(newOrder);
        notify(`Visual order updated for ${newOrder.length} item${newOrder.length === 1 ? '' : 's'}.`, 'success');
    }
    cleanup(e.currentTarget);
}

function handleDragEnd(e) {
    cleanup(e.currentTarget);
}

function cleanup(container) {
    draggedItem?.classList.remove('dragging');
    container.removeEventListener('dragover', handleDragOver);
    container.removeEventListener('drop', handleDrop);
    placeholder?.remove();
    draggedItem = null;
    placeholder = null;
}

export function initialize() {
    const containers = document.querySelectorAll('.grid-container');
    containers.forEach(container => {
        container.removeEventListener('dragstart', handleDragStart);
        container.removeEventListener('dragend', handleDragEnd);
        container.addEventListener('dragstart', handleDragStart);
        container.addEventListener('dragend', handleDragEnd);
    });
}
