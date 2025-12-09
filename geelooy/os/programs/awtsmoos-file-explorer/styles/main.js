
// B"H
export default /*css*/`
:root {
    /* Color Palette - Modern & Professional */
    --primary-color: #007AFF;
    --primary-gradient: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
    --bg-glass: rgba(255, 255, 255, 0.85);
    --bg-solid: #ffffff;
    --border-glass: rgba(0, 0, 0, 0.08);
    --border-hover: rgba(0, 0, 0, 0.15);
    
    --text-main: #1c1c1e;
    --text-secondary: #6e6e73;
    --text-tertiary: #a1a1a6;

    /* Depth & Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);
    --shadow-hover: 0 8px 16px rgba(0,0,0,0.08);
    
    /* Effects */
    --backdrop-blur: blur(20px);
    --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-smooth: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    
    /* Layout */
    --header-height: 52px;
    --sidebar-width: 240px;
    --radius-md: 10px;
    --radius-lg: 14px;
}

/* Global Reset & Typography */
.file-explorer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--bg-glass);
    backdrop-filter: var(--backdrop-blur);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: var(--text-main);
    overflow: hidden;
    user-select: none;
    -webkit-font-smoothing: antialiased;
}

/* Custom Scrollbar */
.file-explorer *::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.file-explorer *::-webkit-scrollbar-track {
    background: transparent;
}
.file-explorer *::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.1);
    border-radius: 20px;
}
.file-explorer *::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0,0,0,0.25);
}

.file-explorer:focus { outline: none; }

.file-explorer-content { 
    display: flex; 
    flex-grow: 1; 
    overflow: hidden; 
    position: relative; 
    background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.8) 100%);
    min-height: 0; /* Crucial: Allows children (body) to scroll */
    min-width: 0; /* Prevents grid/flex children from forcing width overflow */
}

/* --- Buttons & Inputs --- */
button {
    font-family: inherit;
    border: none;
    outline: none;
    background: transparent;
}

/* Header & Navbar */
.file-explorer-header {
    display: flex;
    flex-direction: column;
    padding: 12px 18px;
    background: rgba(255,255,255,0.6);
    border-bottom: 1px solid var(--border-glass);
    gap: 12px;
    flex-shrink: 0;
    z-index: 20;
    backdrop-filter: blur(10px);
    box-shadow: var(--shadow-sm);
}

.button-bar { display: flex; align-items: center; gap: 14px; width: 100%; }

.menu-buttons button, .view-controls button {
    background: var(--bg-solid);
    border: 1px solid var(--border-glass);
    border-radius: 8px;
    padding: 7px 16px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-main);
    transition: var(--transition-fast);
    box-shadow: var(--shadow-sm);
}

.menu-buttons button:hover, .view-controls button:hover {
    background: #fafafa;
    border-color: var(--border-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.menu-buttons button:active {
    transform: translateY(0);
    background: #f0f0f0;
}

.sidebar-toggle-btn {
    padding: 8px;
    cursor: pointer;
    border-radius: 8px;
    color: var(--text-secondary);
    transition: var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
}
.sidebar-toggle-btn span {
    font-size: 18px;
    line-height: 1;
}
.sidebar-toggle-btn:hover { 
    background-color: rgba(0,0,0,0.05); 
    color: var(--text-main); 
}

/* Path Bar */
.path-bar-container {
    display: flex; align-items: stretch; width: 100%; height: 38px;
    border: 1px solid var(--border-glass); 
    border-radius: 10px; 
    background: rgba(255,255,255,0.5);
    padding: 3px 6px; 
    transition: var(--transition-smooth); 
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
}
.path-bar-container:focus-within {
    border-color: var(--primary-color); 
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
    background: #fff;
}

.path-breadcrumbs { 
    display: flex; align-items: center; flex-grow: 1; 
    overflow-x: auto; scrollbar-width: none; padding-left: 8px; 
}
.path-segment {
    padding: 5px 10px; border-radius: 6px; cursor: pointer; 
    font-size: 13px; color: var(--text-secondary); 
    white-space: nowrap; font-weight: 500;
    transition: var(--transition-fast);
}
.path-segment:hover { 
    background-color: rgba(0,0,0,0.05); 
    color: var(--text-main); 
}
.path-separator { color: var(--text-tertiary); margin: 0 2px; font-size: 14px; font-weight: 300; }

.path-input-container { display: none; width: 100%; }
.path-input-container input { 
    width: 100%; border: none; outline: none; font-size: 14px; 
    background: transparent; padding: 0 10px; color: var(--text-main); 
}

.edit-path-btn, .nav-btn {
    cursor: pointer; color: var(--text-secondary); font-size: 16px; 
    padding: 0 12px; display: flex; align-items: center; 
    transition: var(--transition-fast);
    border-radius: 6px;
}
.edit-path-btn:hover, .nav-btn:hover { 
    color: var(--primary-color); 
    background: rgba(0, 122, 255, 0.05); 
}
.nav-btn { border-right: 1px solid var(--border-glass); margin-right: 6px; }


/* Dialog */
.input-dialog-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.3); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(8px);
    opacity: 0; animation: fadeIn 0.3s forwards;
}
@keyframes fadeIn { to { opacity: 1; } }

.input-dialog {
    background: #fff; padding: 28px; border-radius: 16px;
    width: 380px; 
    box-shadow: var(--shadow-lg);
    font-size: 14px; 
    transform: scale(0.9); 
    animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
@keyframes scaleUp { to { transform: scale(1); } }

.dialog-title { 
    font-weight: 700; margin-bottom: 20px; font-size: 20px; 
    color: var(--text-main); letter-spacing: -0.5px;
}
.input-dialog input { 
    width: 100%; padding: 12px; 
    border: 1px solid #e0e0e0; 
    background: #f9f9f9;
    border-radius: 8px; margin-bottom: 24px; box-sizing: border-box; 
    font-size: 16px; 
    transition: all 0.2s;
}
.input-dialog input:focus { 
    background: #fff;
    border-color: var(--primary-color); 
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1); 
}
.dialog-buttons { display: flex; justify-content: flex-end; gap: 12px; }
.dialog-buttons button { 
    padding: 10px 20px; border-radius: 8px; 
    border: 1px solid #e5e5e5; 
    background: white; cursor: pointer; 
    font-weight: 600; font-size: 14px;
    transition: all 0.2s;
}
.dialog-buttons button:hover { background: #f3f3f3; }
.dialog-buttons button:first-child { 
    background: var(--primary-color); 
    color: white; border-color: transparent;
    box-shadow: 0 4px 10px rgba(0, 122, 255, 0.3);
}
.dialog-buttons button:first-child:hover { 
    background: #0066d6; 
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(0, 122, 255, 0.4);
}

/* Selection Action Bar */
.selection-action-bar {
    position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: rgba(30, 30, 35, 0.9); color: white; padding: 10px 24px; border-radius: 100px;
    display: flex; align-items: center; gap: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 100;
    font-size: 14px; 
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
    animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.selection-action-bar span {
    font-weight: 600;
    margin-right: 8px;
}
.selection-action-bar button {
    background: rgba(255,255,255,0.15); border: none; color: white;
    padding: 6px 16px; border-radius: 20px; cursor: pointer;
    font-size: 13px; font-weight: 600; transition: background 0.2s;
}
.selection-action-bar button:hover { background: rgba(255,255,255,0.25); }
.selection-action-bar button.cancel-btn { background: #FF3B30; color: white; }
.selection-action-bar button.cancel-btn:hover { background: #D70015; }
@keyframes slideUp { from { transform: translate(-50%, 60px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
`