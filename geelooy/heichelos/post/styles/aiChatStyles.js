//B"H
export function injectAIChatCSS() {
    const id = "BH-aiChatStyles-Pro";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- General Layout --- */
        .ai-chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            font-size: 1em; 
            background: #ffffff;
            overflow: hidden;
            font-family: "Courier New", Courier, monospace;
        }
        
        .ai-message, .ai-block-content {
            font-size: inherit; /* B"H - Force Inherit */
        }

        /* --- Thread Wrapper --- */
        .ai-thread-wrapper {
            margin-top: 15px;
            border: 3px solid #000;
            background: #fff;
            box-shadow: 6px 6px 0 #ccc;
            font-size: inherit;
        }

        .ai-thread-header {
            background: #000;
            color: #fff;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: bold;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        
        /* Fork Banner (Only at very top if viewed via Deep Link) */
        .ai-fork-banner {
            background: #2a0a29; 
            color: #ffcc00;
            padding: 8px 12px;
            font-size: 0.85em;
            display: flex;
            align-items: center;
            border-bottom: 2px solid #ffcc00;
            justify-content: space-between;
        }

        /* --- Timeline & Tree Structure --- */
        .ai-thread-timeline {
            padding: 10px 10px 10px 10px;
            position: relative;
            background: #f4f4f0;
        }
        
        /* Nested Timeline (The Branch) */
        .ai-nested-thread {
            margin-left: 20px; /* Indent */
            margin-top: 15px;
            border-left: 3px solid #ccc;
            padding-left: 10px;
            position: relative;
        }
        
        /* Visual connector for nest */
        .ai-nested-thread::before {
            content: '';
            position: absolute;
            top: -10px; /* Connect to parent above */
            left: -3px; /* Align with border */
            width: 15px;
            height: 25px;
            border-bottom: 3px solid #ccc;
            border-left: 3px solid #ccc;
            border-bottom-left-radius: 8px;
            z-index: 0;
        }

        .ai-nested-header {
            font-size: 0.85em;
            color: #555;
            background: #e9e9e9;
            padding: 4px 8px;
            display: inline-block;
            margin-bottom: 5px;
            border: 1px solid #ccc;
            position: relative;
            z-index: 1;
        }

        /* --- Blocks --- */
        .ai-thread-block {
            margin-bottom: 15px;
            position: relative;
        }

        .ai-msg-controls {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            background: #000;
            color: #fff;
            padding: 4px 8px;
            border: 2px solid #000;
            border-bottom: none;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .ai-role-label {
            margin-right: auto; 
            color: #ffcc00;
        }
        
        .ai-msg-branch, .ai-msg-toggle {
            background: #333;
            color: #fff;
            border: 1px solid #555;
            padding: 2px 6px;
            cursor: pointer;
            font-size: 1em;
        }
        .ai-msg-branch:hover { background: #0f0; color: #000; }
        .ai-msg-toggle:hover { background: #fff; color: #000; }

        .ai-block-content {
            background: #fff;
            border: 2px solid #000;
            padding: 12px;
            font-size: inherit; /* B"H - Force Inherit */
            box-shadow: 4px 4px 0 rgba(0,0,0,1);
            position: relative;
            cursor: text;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .ai-block-content.collapsed {
            max-height: 40px; 
            cursor: pointer;
            opacity: 0.7;
        }
        .ai-block-content.collapsed::after {
            content: '...';
            position: absolute;
            bottom: 5px;
            right: 10px;
            font-weight: bold;
            background: #fff;
        }

        .ai-thread-block.model .ai-block-content {
            background: #fffae0; 
        }

        /* --- Branching Input --- */
        .ai-branch-input-area {
            margin-top: 10px;
            margin-left: 20px;
            padding: 10px;
            background: #000;
            border: 2px solid #0f0;
            position: relative;
            font-size: 0.9em;
        }
        
        .ai-branch-input-area textarea {
            width: 100%;
            background: #111;
            color: #0f0;
            border: 1px solid #0f0;
            padding: 8px;
            font-family: monospace;
            box-sizing: border-box;
            resize: vertical;
            font-size: 1em;
            min-height: 60px;
        }
        
        .ai-branch-input-area button {
            margin-top: 5px;
            padding: 5px 10px;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        
        .fork-btn { background: #0f0; color: #000; border: none; }
        .cancel-btn { background: #333; color: #fff; border: 1px solid #555; }

        /* --- Terminal --- */
        .ai-inline-terminal {
            margin-top: 20px;
            border-top: 2px dashed #000;
            padding-top: 15px;
            display: flex;
            gap: 10px;
            align-items: flex-end;
            font-size: inherit;
        }
        
        .ai-inline-terminal textarea {
            flex: 1;
            background: #fff;
            border: 2px solid #000;
            padding: 10px;
            font-family: inherit;
            resize: none;
            box-shadow: inset 2px 2px 5px rgba(0,0,0,0.1);
            font-size: inherit;
        }
        
        .ai-inline-terminal button {
            background: #000;
            color: #fff;
            border: 2px solid #000;
            width: 40px;
            height: 40px;
            font-size: 1.2em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .ai-header-btn {
            background: #fff;
            border: 1px solid #fff;
            color: #000;
            padding: 2px 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 0.8em;
            margin-left: 5px;
        }
        .ai-header-btn:hover {
            background: #ffcc00;
            border-color: #ffcc00;
        }
    `;
    document.head.appendChild(style);
}