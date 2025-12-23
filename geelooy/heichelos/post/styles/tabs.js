//B"H
export function injectPostTabsCSS() {
    const id = "BH-postTabsStyles";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- Tab Navigation Bar --- */
        .tab-buttons {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(5px);
            border-bottom: 1px solid #eaeaea;
            padding: 8px 12px;
            height: 55px;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
            scrollbar-width: none; /* Hide scrollbar Firefox */
            box-sizing: border-box;
            z-index: 5;
        }
        
        .tab-buttons::-webkit-scrollbar { display: none; }

        .tab-button {
            padding: 6px 14px;
            font-size: 13px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-weight: 500;
            color: #666;
            background: #f5f5f5;
            border-radius: 18px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s ease;
            border: 1px solid transparent;
            user-select: none;
        }

        .tab-button:hover {
            background: #eef0f2;
            color: #333;
            transform: translateY(-1px);
        }

        .tab-button.active {
            background: #007bff;
            color: white;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
            border-color: #007bff;
        }

        /* --- Tab Content Container --- */
        .all-tabs {
            flex: 1;
            position: relative;
            overflow: hidden;
            background: #fff;
        }

        .tab-container {
            position: absolute;
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%;
            background: #fff;
            display: none; /* Hidden by default */
            flex-direction: column;
            z-index: 10;
            animation: fadeInTab 0.2s ease-out;
        }

        .tab-container.active {
            display: flex;
        }
        
        @keyframes fadeInTab {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .tab-content {
            flex: 1;
            overflow-y: auto;
            padding: 0;
            scroll-behavior: smooth;
        }
        
        /* --- Internal Tab Headers --- */
        .post-info {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .comment-header {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            background: #fff;
            border-bottom: 1px solid #f0f0f0;
            gap: 12px;
            flex-shrink: 0;
            position: sticky;
            top: 0;
            z-index: 20;
        }

        .back-btn {
            padding: 6px 12px;
            background: #f0f2f5;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            color: #606770;
            transition: all 0.2s;
            display: flex;
            align-items: center;
        }
        
        .back-btn:hover {
            background: #e4e6eb;
            color: #1c1e21;
        }
        
        .back-btn::before {
            content: "‹";
            font-size: 18px;
            margin-right: 4px;
            line-height: 1;
            position: relative;
            top: -1px;
        }

        .info-header {
            font-weight: 700;
            font-size: 16px;
            color: #1c1e21;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }
    `;
    document.head.appendChild(style);
}
