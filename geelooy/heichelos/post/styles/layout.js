//B"H
/**
 * Injecting the Layout CSS.
 * Extreme Edition: Zero waste, hard edges.
 */
export function injectPostLayoutCSS() {
    const id = "BH-postLayoutStyles-Pro-V3";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- Root Reset --- */
        html, body {
            overflow: hidden !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f4f4f0;
            font-family: "Courier New", Courier, monospace;
        }

        :root {
            --sidebar-width: 350px;
            --sidebar-bg: #ffffff;
            --sidebar-border: #000000;
            --header-height: 64px;
        }

        .all.awtsmoospage {
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .main {
            flex: 1;
            overflow: hidden; 
            display: flex;
            flex-direction: column;
            position: relative;
        }

        /* --- Post Frame --- */
        .post-frame {
            display: flex;
            flex-direction: row;
            flex: 1;
            height: 100%;
            position: relative;
            background: #f4f4f0;
            overflow: hidden; 
        }

        /* --- Main Content Area --- */
        div#realPost {
            flex: 1;
            height: 100%;
            overflow-y: auto !important; 
            -webkit-overflow-scrolling: touch;
            /* Reduced padding significantly to remove "extra space" */
            padding: 10px; /* Tight padding */
            background-color: #f4f4f0;
            box-sizing: border-box;
            position: relative;
            z-index: 1;
            /* Scrollbar styling */
            scrollbar-color: #000 #f4f4f0;
            scrollbar-width: thin;
        }

        /* --- Sidebar Container --- */
        .sidebar {
            width: var(--sidebar-width);
            min-width: 300px;
            max-width: 60vw;
            height: 100% !important;
            background: var(--sidebar-bg);
            border-left: 3px solid var(--sidebar-border);
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 100;
            flex-shrink: 0; 
        }

        /* --- Hidden Sidebar --- */
        @media only screen and (min-width: 901px) {
            .sidebar.hidden-comments {
                margin-right: calc(var(--sidebar-width) * -1); 
                display: none !important; 
            }
        }

        /* --- Resizer --- */
        .awtsmoos-sidebar-resizer {
            position: absolute;
            left: -5px;
            top: 0;
            bottom: 0;
            width: 10px;
            cursor: ew-resize;
            z-index: 200;
            background: transparent;
        }
        .awtsmoos-sidebar-resizer:hover {
            background: rgba(0, 0, 0, 0.1);
        }

        /* --- Mobile --- */
        @media only screen and (max-width: 900px) {
            .post-frame {
                flex-direction: column;
            }

            div#realPost {
                padding: 10px 10px 80px 10px;
            }

            .sidebar {
                width: 100% !important;
                max-width: 100%;
                height: 80vh !important; 
                position: fixed;
                bottom: 0;
                left: 0;
                top: auto;
                border-left: none;
                border-top: 3px solid #000;
                box-shadow: 0 -4px 0px rgba(0,0,0,0.1);
                border-radius: 0;
                z-index: 9999;
                transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            
            .sidebar.hidden-comments {
                display: flex !important; 
                transform: translateY(100%) !important;
            }
        }
    `;
    document.head.appendChild(style);
}
