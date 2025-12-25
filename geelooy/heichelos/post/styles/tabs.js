
//B"H
export function injectPostTabsCSS() {
    const id = "BH-postTabsStyles-Pro-V8";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
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

        /* AI Card Styling */
        .ai-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e6f2ff 100%);
            border-left: 4px solid #00d2ff;
        }
        .ai-card:hover {
            background: #e1f5fe;
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
    `;
    document.head.appendChild(style);
}
