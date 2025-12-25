//B"H
export function injectAIChatCSS() {
    const id = "BH-aiChatStyles-Pro";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- GLOBAL RESET & INHERITANCE --- */
        .ai-chat-container {
            display: flex;
            flex-direction: column;
            gap: 0;
            background-color: #f4f4f0;
            font-family: 'Courier New', Courier, monospace;
            padding: 10px;
        }

        .ai-chat-container * {
            font-size: inherit !important; /* CRITICAL: Force font scaling from parent */
            box-sizing: border-box;
        }

        /* --- THREAD WRAPPER --- */
        .ai-thread-wrapper {
            border: 3px solid #000;
            background: #fff;
            margin-bottom: 20px;
            box-shadow: 6px 6px 0px #000;
        }

        .ai-thread-header {
            background: #000;
            color: #fff;
            padding: 10px;
            font-weight: 900;
            text-transform: uppercase;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #000;
        }

        .ai-header-btn {
            background: #fff;
            color: #000;
            border: 2px solid #fff;
            font-weight: bold;
            padding: 2px 6px;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.1s;
        }
        .ai-header-btn:hover {
            background: #ffcc00; /* Yellow */
            border-color: #ffcc00;
            transform: translate(2px, 2px);
            box-shadow: none;
        }

        /* --- TIMELINE RAIL --- */
        .ai-thread-timeline {
            padding: 20px 10px 20px 20px;
            position: relative;
        }
        
        /* Continuous Vertical Rail for Main Thread */
        .ai-thread-timeline::before {
            content: '';
            position: absolute;
            top: 20px;
            bottom: 20px;
            left: 20px; /* Align with bubbles */
            width: 2px;
            background: repeating-linear-gradient(to bottom, #000 0, #000 4px, transparent 4px, transparent 8px);
            z-index: 0;
        }

        /* --- MESSAGE BLOCK --- */
        .ai-thread-block {
            position: relative;
            margin-bottom: 20px;
            padding-left: 20px; /* Space from rail */
            z-index: 1;
        }

        /* Connector Dot */
        .ai-thread-block::before {
            content: '';
            position: absolute;
            left: -6px; /* Center on rail (20px padding - 6px shift approx) */
            top: 15px;
            width: 12px;
            height: 12px;
            background: #000;
            border: 2px solid #fff;
            border-radius: 50%;
            z-index: 2;
        }

        /* --- MESSAGE CONTENT BUBBLE --- */
        .ai-main-body {
            display: flex;
            flex-direction: column;
            max-width: 100%;
        }

        .ai-msg-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
            font-size: 0.8em !important;
            font-weight: bold;
            text-transform: uppercase;
            background: #000;
            color: #fff;
            padding: 4px 8px;
            border: 2px solid #000;
            display: inline-flex; /* Shrink to fit */
            width: fit-content;
        }
        
        .ai-role-label {
            margin-right: 10px;
            color: #ffcc00;
        }

        .ai-block-content {
            border: 2px solid #000;
            padding: 15px;
            position: relative;
            box-shadow: 4px 4px 0px #000;
            background: #fff;
            transition: transform 0.1s;
        }
        
        .ai-block-content:hover {
            transform: translate(-1px, -1px);
            box-shadow: 5px 5px 0px #000;
        }

        /* User Specifics */
        .ai-thread-block.user .ai-block-content {
            background: #fff;
        }

        /* AI Specifics */
        .ai-thread-block.model .ai-block-content {
            background: #fffae0; /* Light Yellow */
        }
        
        /* Markdown Content Styling */
        .ai-content-text {
            line-height: 1.6;
            overflow-wrap: break-word;
        }
        .ai-content-text code {
            background: #eee;
            padding: 2px 4px;
            border: 1px solid #ccc;
        }
        .ai-content-text pre {
            background: #000;
            color: #0f0;
            padding: 10px;
            overflow-x: auto;
            border: 1px solid #0f0;
        }

        /* --- CONTROLS --- */
        .ai-msg-actions {
            margin-top: 5px;
            display: flex;
            gap: 10px;
            opacity: 0; /* Hidden until hover */
            transition: opacity 0.2s;
        }
        .ai-thread-block:hover .ai-msg-actions {
            opacity: 1;
        }

        .ai-action-btn {
            background: transparent;
            border: none;
            color: #555;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
            font-size: 0.75em !important;
            padding: 0;
            text-decoration: underline;
        }
        .ai-action-btn:hover {
            color: #000;
            background: #ffcc00;
            text-decoration: none;
        }

        /* --- NESTED BRANCHES --- */
        .ai-branch-container {
            margin-top: 15px;
            /* No left padding here, handled by nested-thread */
        }

        .ai-nested-thread {
            position: relative;
            margin-left: 20px; /* Indent the whole branch */
            border-left: 4px solid #ffcc00; /* Distinct Branch Rail */
            padding-left: 15px;
            background: rgba(0,0,0,0.02); /* Slight dim for depth */
            margin-bottom: 20px;
        }
        
        .ai-nested-header {
            background: #ffcc00;
            color: #000;
            padding: 5px 10px;
            font-weight: bold;
            font-size: 0.8em !important;
            display: inline-block;
            margin-bottom: 10px;
            border: 2px solid #000;
            box-shadow: 2px 2px 0 #000;
        }
        
        .branch-icon {
            font-size: 1.2em !important;
            margin-right: 5px;
        }

        /* --- INPUT AREAS --- */
        .ai-branch-input-area {
            background: #000;
            padding: 15px;
            margin-top: 10px;
            border: 2px solid #ffcc00;
        }
        
        .ai-branch-input-area textarea {
            width: 100%;
            background: #222;
            color: #0f0;
            font-family: monospace;
            border: 1px solid #555;
            padding: 10px;
            min-height: 80px;
        }
        
        .ai-input-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 10px;
        }
        
        .ai-btn {
            border: 2px solid #fff;
            padding: 5px 15px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
        }
        
        .ai-btn-primary {
            background: #0f0;
            color: #000;
            border-color: #0f0;
        }
        
        .ai-btn-secondary {
            background: transparent;
            color: #fff;
        }

        /* --- TERMINAL (ROOT INPUT) --- */
        .ai-inline-terminal {
            margin-top: 20px;
            border: 3px solid #000;
            background: #eee;
            padding: 10px;
            display: flex;
            gap: 10px;
            align-items: flex-end;
        }
        
        .ai-inline-terminal textarea {
            flex: 1;
            border: 2px solid #000;
            padding: 10px;
            font-family: inherit;
            resize: none;
            background: #fff;
            color: #000;
        }
        
        .ai-send-icon-btn {
            background: #000;
            color: #ffcc00;
            border: 2px solid #000;
            width: 45px;
            height: 45px;
            font-size: 1.5em !important;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.1s;
        }
        .ai-send-icon-btn:hover {
            background: #ffcc00;
            color: #000;
            transform: translate(2px, 2px);
        }
    `;
    document.head.appendChild(style);
}