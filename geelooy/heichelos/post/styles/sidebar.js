
//B"H
export function injectSidebarCSS() {
    const id = "BH-sidebarStyles-Pro-V1";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        .sidebar {
            display: flex;
            flex-direction: column;
            overflow: hidden; 
            height: 100% !important;
            font-size: 0.9rem;
        }
        
        .awtsmoos-sidebar-header {
            background: #000; 
            color: #fff;
            border-bottom: 3px solid #000;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            position: relative;
            z-index: 20;
            padding: 0; 
            font-size: 1.1em; 
        }

        .awtsmoos-drag-handle {
            width: 40px; 
            height: 6px;
            background-color: #555;
            margin: 6px auto; 
            cursor: grab;
            display: none; 
        }

        .awtsmoos-nav-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            gap: 10px;
        }
        
        .awtsmoos-nav-title {
            font-size: 1em;
            font-weight: 900;
            color: #fff;
            text-transform: uppercase;
            letter-spacing: 1px;
            flex: 1;
            text-align: center;
        }

        button.awtsmoos-nav-back, 
        .awtsmoos-close-sidebar-btn {
            background: #fff;
            border: 2px solid #fff;
            width: 2em;
            height: 2em;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1em;
            color: #000;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 2px 2px 0 #555;
        }
        
        button.awtsmoos-nav-back:hover, 
        .awtsmoos-close-sidebar-btn:hover {
            background-color: #ffcc00; 
            border-color: #ffcc00;
            box-shadow: 1px 1px 0 #555;
            transform: translate(1px, 1px);
        }
        
        button.awtsmoos-nav-back.hidden { visibility: hidden; pointer-events: none; }

        @media (max-width: 900px) {
            .awtsmoos-drag-handle { display: block; }
        }
    `;
    document.head.appendChild(style);
}
