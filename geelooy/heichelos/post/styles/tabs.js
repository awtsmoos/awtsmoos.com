//B"H
export function injectPostTabsCSS() {
    const id = "BH-postTabsStyles-V4-Stack-Polished";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* Sidebar and Handle styles moved to layout.js for structural integrity */

        /* --- Global Header (Fixed Top) --- */
        .awtsmoos-sidebar-header {
            width: 100%;
            display: flex;
            flex-direction: column;
            background: #fff;
            flex-shrink: 0;
            z-index: 101; 
            border-bottom: 1px solid #f0f0f0;
            position: relative;
            padding-bottom: 4px;
            user-select: none;
            touch-action: none !important; 
            cursor: grab;
        }
        
        .sidebar.is-dragging .awtsmoos-sidebar-header {
            cursor: grabbing;
        }

        /* Mobile Drag Handle */
        .awtsmoos-drag-handle {
            width: 80px; 
            height: 6px;
            background-color: #d0d0d0;
            border-radius: 10px;
            margin: 10px auto 6px auto; 
            cursor: grab;
            position: relative;
            z-index: 1000;
        }
        
        /* Navigation Row */
        .awtsmoos-nav-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            height: 36px;
        }
        
        button.awtsmoos-nav-back {
            background: transparent;
            border: none;
            padding: 0;
            font-size: 20px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: #007bff;
            transition: background 0.2s, transform 0.1s;
            position: relative;
            z-index: 102; 
        }
        button.awtsmoos-nav-back:hover { background: #f0f8ff; }
        button.awtsmoos-nav-back:active { transform: scale(0.9); }
        button.awtsmoos-nav-back.hidden { visibility: hidden !important; pointer-events: none; }

        .awtsmoos-nav-title {
            font-weight: 600;
            font-size: 15px;
            color: #1a1a1a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            flex: 1;
            padding: 0 10px;
        }

        .awtsmoos-close-sidebar-btn {
            font-size: 22px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            border-radius: 50%;
            line-height: 1;
            position: relative;
            z-index: 102;
        }
        .awtsmoos-close-sidebar-btn:hover { color: #333; background: #f5f5f5; }

        /* --- Tab/View Container --- */
        .awtsmoos-tab-pane-container {
            flex: 1;
            position: relative;
            overflow: hidden !important; 
            background: #fff;
            width: 100%;
            display: flex;
            flex-direction: column;
        }

        /* --- Individual Views (Slides) --- */
        .awtsmoos-individual-tab {
            position: absolute;
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            z-index: 10;
            transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
            pointer-events: none; 
        }

        .awtsmoos-individual-tab.active {
            pointer-events: auto !important;
        }

        .awtsmoos-individual-tab.next-page { transform: translateX(100%); }
        .awtsmoos-individual-tab.hidden-view { display: none !important; }
        
        .slide-in-right { animation: slideInRight 0.3s forwards; }
        .slide-out-left { animation: slideOutLeft 0.3s forwards; }
        .slide-in-left  { animation: slideInLeft 0.3s forwards; }
        .slide-out-right{ animation: slideOutRight 0.3s forwards; }

        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideOutLeft { from { transform: translateX(0); } to { transform: translateX(-30%); opacity: 0; } }
        @keyframes slideInLeft  { from { transform: translateX(-30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight{ from { transform: translateX(0); } to { transform: translateX(100%); } }

        .post-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .tab-content {
            flex: 1;
            overflow-y: auto;
            padding: 0;
            -webkit-overflow-scrolling: touch;
            user-select: text !important;
            -webkit-user-select: text !important;
        }

        .commentors-list {
            padding: 10px 15px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .awtsmoos-list-item {
            padding: 18px 20px;
            border-radius: 16px;
            background: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 15px;
            font-weight: 600;
            color: #2c3e50;
            border: 1px solid rgba(0,0,0,0.04);
            box-shadow: 0 4px 6px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.05);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            user-select: none;
            pointer-events: auto !important;
        }

        .awtsmoos-list-item:hover { 
            transform: translateY(-2px) scale(1.01);
            box-shadow: 0 10px 20px rgba(0,0,0,0.06), 0 6px 6px rgba(0,0,0,0.04);
            border-color: rgba(0,123,255,0.1);
        }

        .awtsmoos-list-item:active { transform: scale(0.98); }

        .awtsmoos-list-item-arrow { 
            color: #cbd5e0; 
            font-size: 20px; 
            font-weight: bold;
            transition: transform 0.3s ease, color 0.3s ease;
        }
        
        .awtsmoos-list-item:hover .awtsmoos-list-item-arrow {
            color: #007bff;
            transform: translateX(4px);
        }

        .awtsmoos-list-item.ai-card {
            background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
            border: 1px solid rgba(0,123,255,0.1);
        }
        
        .awtsmoos-list-item.ai-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 4px; height: 100%;
            background: linear-gradient(to bottom, #00c6ff, #0072ff);
        }

        .awtsmoos-hero-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: calc(100% - 40px);
            margin: 20px auto;
            padding: 12px;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
            z-index: 10;
            pointer-events: auto !important;
        }
        .awtsmoos-hero-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
        }
        .awtsmoos-hero-btn:active { transform: scale(0.98); }

        .continue-chat-btn {
            background: linear-gradient(135deg, #8e2de2, #4a00e0);
            color: white !important;
            border: none;
            padding: 8px 16px !important;
            border-radius: 20px;
            font-size: 13px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            box-shadow: 0 4px 10px rgba(138, 43, 226, 0.2);
            transition: all 0.2s ease-in-out;
            margin-bottom: 12px;
            display: inline-block;
            position: relative;
            z-index: 99999 !important;
            user-select: none; 
            pointer-events: auto !important;
        }

        @media (min-width: 901px) {
            .awtsmoos-drag-handle { display: none !important; }
            .awtsmoos-sidebar-header {
                padding-bottom: 0;
                border-bottom: 1px solid #eee;
            }
            .awtsmoos-nav-row {
                height: 42px; 
            }
        }
    `;
    document.head.appendChild(style);
}