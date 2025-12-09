
// B"H
export default /*css*/`
/* --- MAIN SCROLLABLE BODY --- */
.file-explorer-body { 
    flex: 1 1 auto; 
    padding: 20px; 
    overflow-y: auto;
    overflow-x: hidden; /* Prevent horizontal scroll on body unless needed */
    height: 100%; 
    min-height: 0; /* Crucial for nested flex scrolling */
    position: relative;
    box-sizing: border-box;
    scroll-behavior: smooth;
}

/* Details view needs horizontal scroll for columns on small screens */
.file-explorer-body.details-view {
    overflow-x: auto;
}

/* Drag Over Overlay Effect */
.file-explorer-body.drag-over::after {
    content: '';
    position: absolute;
    inset: 10px;
    border: 2px dashed var(--primary-color);
    background: rgba(0, 122, 255, 0.05);
    border-radius: 12px;
    pointer-events: none;
    z-index: 100;
    backdrop-filter: blur(2px);
}

/* --- ICONS GRID VIEW (Modern Cards) --- */
.icons-view { 
    display: grid; 
    /* Increased min-width for better text fit */
    grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); 
    gap: 16px; 
    padding-bottom: 60px; /* Space for selection bar */
    width: 100%;
}

.file-item.icon { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: flex-start; 
    padding: 16px 10px; 
    border-radius: 16px; 
    cursor: pointer;
    
    /* Neo-Glass Aesthetic */
    background: rgba(255, 255, 255, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 6px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.5);
    backdrop-filter: blur(8px);
    
    /* Layout Sizing Fixes - Allow growth */
    height: 100%; /* Stretch to fill grid row height */
    min-height: 130px; 
    
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    
    animation: fadeScaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
}

.file-item.icon:hover { 
    background: rgba(255, 255, 255, 0.75); 
    transform: translateY(-6px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.8);
    z-index: 10;
}

.file-item.icon:active {
    transform: scale(0.96);
}

.file-item.icon.selected { 
    background: rgba(0, 122, 255, 0.12);
    border-color: rgba(0, 122, 255, 0.4);
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

/* Icon Image Container */
.file-item.icon .icon-img {
    width: 60px; 
    height: 60px; 
    margin-bottom: 10px;
    filter: drop-shadow(0 8px 12px rgba(0,0,0,0.1));
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex; 
    align-items: center; 
    justify-content: center;
    flex-shrink: 0;
}

/* EXTREME CONSTRAINT: Prevent SVG Layout Blowout */
.icon-img svg {
    width: 100% !important;
    height: 100% !important;
    display: block;
    object-fit: contain;
    overflow: visible; /* Ensure SVG shadows aren't clipped internally */
}

.file-item.icon:hover .icon-img { 
    transform: scale(1.15) rotate(2deg); 
    filter: drop-shadow(0 12px 16px rgba(0,0,0,0.15));
}

/* Text Styling */
.file-item.icon span { 
    font-size: 13px; 
    text-align: center; 
    line-height: 1.35;
    font-weight: 500;
    color: var(--text-main);
    width: 100%;
    
    /* Allow full text display */
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    
    text-shadow: 0 1px 1px rgba(255,255,255,0.8);
}

/* --- DETAILS TABLE VIEW --- */
.details-view { 
    display: flex; 
    flex-direction: column; 
    width: 100%; 
    min-width: 600px; /* Ensure table doesn't crush on small screens */
}

.details-header {
    display: grid; 
    grid-template-columns: var(--grid-cols); 
    
    /* Sticky Frost Header */
    background: rgba(245, 245, 247, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    
    border-bottom: 1px solid rgba(0,0,0,0.08); 
    position: sticky; 
    top: 0; 
    z-index: 20;
    
    margin: -20px -20px 8px -20px; /* Negative margins to stick to edges of padded container */
    padding: 8px 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.header-cell { 
    padding: 10px 12px; 
    font-size: 11px; 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.08em;
    color: var(--text-tertiary); 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 6px;
    border-radius: 6px;
    transition: all 0.2s;
}

.header-cell:hover { 
    background: rgba(0,0,0,0.04); 
    color: var(--text-main);
}
.header-cell.active-sort { color: var(--primary-color); }

.details-row {
    display: grid; 
    grid-template-columns: var(--grid-cols); 
    align-items: center;
    border-bottom: 1px solid rgba(0,0,0,0.03);
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 2px;
    
    cursor: default; 
    font-size: 13px; 
    color: var(--text-secondary);
    transition: background 0.15s ease, transform 0.1s;
    
    animation: slideUpFade 0.3s backwards;
}

.details-row:hover { 
    background-color: rgba(255,255,255, 0.6); 
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}

.details-row.selected { 
    background-color: rgba(0, 122, 255, 0.1); 
    color: var(--text-main);
}

.row-cell { 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    display: flex; 
    align-items: center; 
    padding-right: 10px;
}

.row-cell.name-cell { 
    gap: 12px; 
    font-weight: 600; 
    color: var(--text-main); 
}

.small-icon { 
    width: 28px; 
    height: 28px; 
    flex-shrink: 0; 
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.05));
}
/* Ensure small icons are also constrained */
.small-icon svg {
    width: 100% !important;
    height: 100% !important;
    display: block;
}

/* Empty State */
.empty-folder-state {
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center;
    height: 60vh; 
    color: var(--text-tertiary); 
    grid-column: 1 / -1; 
    animation: fadeIn 0.5s ease;
}
.empty-folder-state::before {
    content: ''; display: block; width: 80px; height: 80px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23d1d5db" stroke-width="1"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>');
    background-size: contain; margin-bottom: 16px; opacity: 0.6;
}
.empty-folder-state span { 
    font-size: 16px; 
    font-weight: 500; 
}

/* --- ANIMATIONS --- */
@keyframes fadeScaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
}

@keyframes slideUpFade {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* --- RESPONSIVE MOBILE OVERRIDES --- */
@media (max-width: 600px) {
    .file-explorer-body { padding: 10px; }
    
    .icons-view {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
    }
    
    .file-item.icon { padding: 10px 5px; border-radius: 12px; min-height: 120px; }
    .file-item.icon .icon-img { width: 48px; height: 48px; margin-bottom: 8px; }
    .file-item.icon span { font-size: 11px; }
    
    /* On mobile details view, we might need horizontal scroll, managed by container */
    .details-row { padding: 8px 4px; font-size: 12px; }
    .header-cell { padding: 8px 4px; font-size: 10px; }
    .small-icon { width: 22px; height: 22px; }
}
`