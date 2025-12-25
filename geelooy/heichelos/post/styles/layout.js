//B"H
/**
 * Injecting the Layout CSS.
 * This restores the Split-Pane architecture where the main content div (#realPost)
 * is the actual scroll container. This is CRITICAL for the Highlighter script.
 * Refined for the Essence of the Creator.
 */
export function injectPostLayoutCSS() {
    const id = "BH-postLayoutStyles-Refined-V5-Locked";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- Root Lock: Ensures #realPost is the only scroller --- */
        html, body {
            overflow: hidden !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            /* Prevent pull-to-refresh on mobile which breaks dragging */
            overscroll-behavior-y: contain; 
        }

        :root {
            --awtsmoos-font-size: 18px;
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

        /* --- Post Frame Layout --- */
        .post-frame {
            display: flex;
            flex-direction: row;
            flex: 1;
            position: relative;
            background: #fff;
            overflow: hidden; 
        }

        /* Main Content Scroll Container */
        div#realPost {
            flex: 1;
            height: 100%;
            overflow-y: scroll !important; 
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
            padding: 80px 12% 60vh 12%; 
            line-height: 2;
            color: #1a1a1a;
            background-color: #ffffff;
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: var(--awtsmoos-font-size); 
            box-sizing: border-box;
            position: relative;
            z-index: 1;
        }

        /* --- Sidebar Base (Shared Properties) --- */
        .sidebar {
            background: #fdfdfd;
            display: flex;
            flex-direction: column;
            
            /* CRITICAL: Must be visible to catch handle clicks */
            overflow: visible !important;
            
            box-shadow: -5px 0 25px rgba(0,0,0,0.03);
            z-index: 100;
            
            position: relative;
            /* No transition by default to keep resizing snappy */
            transition: none !important; 
            will-change: width, flex-basis, height;
        }

        /* --- Desktop Layout (Isolated) --- */
        @media only screen and (min-width: 901px) {
            .sidebar {
                width: 450px;
                min-width: 280px;
                height: 100% !important;
                border-left: 1px solid #e0e0e0;
                top: 0 !important;
                bottom: 0 !important;
                /* Ensure the sidebar doesn't shrink on its own */
                flex: 0 0 auto !important;
            }
            
            .sidebar.hidden-comments {
                display: none !important;
            }
        }

        /* --- Sidebar Resizer (Desktop Only) --- */
        .awtsmoos-sidebar-resizer {
            position: absolute;
            left: -10px; /* Sits exactly on the border */
            top: 0;
            bottom: 0;
            width: 20px; /* Generous hit area */
            cursor: ew-resize; 
            /* Subtle visual hint */
            background: rgba(0,0,0,0.01); 
            z-index: 2147483647 !important; 
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
        }
        
        .awtsmoos-sidebar-resizer::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 1px;
            background: rgba(0,0,0,0.05);
            transition: background 0.2s;
        }
        
        .awtsmoos-sidebar-resizer:hover::after {
            background: rgba(0, 123, 255, 0.5);
            width: 2px;
        }

        /* --- Mobile Layout (Isolated) --- */
        @media only screen and (max-width: 900px) {
            .post-frame {
                flex-direction: column;
            }

            div#realPost {
                padding: 40px 20px 50vh 20px;
            }

            .sidebar {
                width: 100% !important; 
                flex: none !important;
                
                /* B"H - Defaulting to 66vh (2/3rds) as requested */
                height: 66vh !important; 
                
                position: fixed;
                bottom: 0 !important;
                left: 0 !important;
                top: auto !important; 
                
                border-left: none !important;
                border-top: 1px solid #ccc;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
                z-index: 99999; 
                
                border-top-left-radius: 20px;
                border-top-right-radius: 20px;
                
                /* Transition only for hiding/showing, not dragging */
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            
            .sidebar.is-dragging {
                transition: none !important;
            }
            
            /* Hidden State on Mobile: Slide down out of view */
            .sidebar.hidden-comments { 
                display: flex !important; 
                transform: translateY(100%) !important;
                pointer-events: none;
            }
            
            .awtsmoos-sidebar-resizer {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}