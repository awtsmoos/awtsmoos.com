//B"H
export function injectPostTabsCSS() {
    const id = "BH-postTabsStyles-Pro-V7";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        .sidebar {
            display: flex;
            flex-direction: column;
            overflow: hidden; 
            height: 100% !important;
            /* DAMPENED RATIO: Base 13px + 50% of the variance from 16px */
            /* If Main=16, Sidebar=13. If Main=26, Sidebar=18. */
            font-size: calc(13px + (var(--awtsmoos-font-size) - 16px) * 0.5);
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
            /* Header stays slightly larger but fixed relative to sidebar base */
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

        .awtsmoos-tab-pane-container {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: #fff;
            width: 100%;
            height: 100%; 
        }

        .awtsmoos-individual-tab {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #fff;
            display: flex;
            flex-direction: column;
            overflow: hidden; 
            transition: transform 0.2s ease-in-out;
            pointer-events: none; 
        }

        .awtsmoos-individual-tab.active { pointer-events: auto; transform: translateX(0); }
        .awtsmoos-individual-tab.next-page { transform: translateX(100%); }
        
        .post-info, .tab-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto; 
            padding: 0;
            padding-bottom: 20px; 
        }

        .post-info-container {
            padding: 1.2em;
            display: flex;
            flex-direction: column;
            gap: 1em;
        }

        .tl { 
            display: flex;
            flex-direction: column;
            gap: 0.3em;
            padding: 0.8em;
            border: 2px solid #000;
            box-shadow: 4px 4px 0px #ccc;
            background: #fff;
        }

        .tl .label {
            font-size: 0.85em;
            text-transform: uppercase;
            font-weight: 900;
            color: #000;
            background: #ffcc00; 
            display: inline-block;
            width: fit-content;
            padding: 0.1em 0.4em;
            border: 1px solid #000;
        }

        .tl .value {
            font-size: 1em;
            color: #000; 
            font-weight: 600;
            font-family: monospace;
        }

        .tl .value a {
            color: #000;
            text-decoration: underline;
            font-weight: 700;
        }
        
        .post-navigation-container {
            display: flex;
            flex-direction: column;
            gap: 0.8em;
            margin-top: 0.8em;
            padding: 1em;
            border: 2px solid #000;
            background: #eee;
            box-shadow: 4px 4px 0 #000;
        }

        .nav-button {
            padding: 0.6em;
            background: #fff;
            border: 2px solid #000;
            color: #000;
            font-weight: 700;
            text-align: center;
            text-decoration: none;
            box-shadow: 2px 2px 0 #000;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        .nav-button:hover { 
            background: #ffcc00; 
            transform: translate(1px, 1px);
            box-shadow: 1px 1px 0 #000;
        }
        
        .series-chapter-select {
            padding: 0.5em;
            border: 2px solid #000;
            font-weight: 600;
            background: #fff;
            font-family: monospace;
            font-size: 0.9em;
        }

        .awtsmoos-list-item {
            padding: 1em;
            background: #fff;
            border-bottom: 2px solid #eee;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background 0.1s;
        }
        .awtsmoos-list-item:hover { 
            background-color: #ffcc00; 
            color: #000;
            border-bottom-color: #000;
        }

        .awtsmoos-list-item span {
            font-weight: 700;
            font-size: 1em;
            font-family: monospace;
        }
        
        .awtsmoos-hero-btn {
            width: 100%;
            padding: 1em;
            background-color: #000;
            color: white;
            border: none;
            font-weight: 700;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 6px 6px 0 #888;
            margin-top: 0.8em;
            border: 2px solid #000;
            font-size: 1em;
        }
        .awtsmoos-hero-btn:hover { 
            background-color: #333; 
            box-shadow: 3px 3px 0 #888;
            transform: translate(3px, 3px);
        }

        @media (max-width: 900px) {
            .awtsmoos-drag-handle { display: block; }
        }
    `;
    document.head.appendChild(style);
}
