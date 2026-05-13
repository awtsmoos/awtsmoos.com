
/**
 * B"H
 * @module GlobalStyles
 * @chapter The Simple Light (Ohr Pashut)
 */
export const GlobalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Share+Tech+Mono&display=swap');

    body, html {
        margin: 0;
        padding: 0;
        background: #000;
        overflow: hidden;
        user-select: none;
        touch-action: none; /* Prevents mortal scrolling on mobile */
    }

    .overworld-btn:hover {
        background: rgba(0, 229, 255, 0.2) !important;
        transform: scale(1.05);
    }
    
    .overworld-btn:active {
        transform: scale(0.95);
    }

    #btn-close-bag:hover {
        background: #f44336 !important;
        transform: scale(1.05);
    }

    /* Holy Scrollbars */
    ::-webkit-scrollbar {
        width: 8px;
    }
    ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.5); 
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb {
        background: #00e5ff; 
        border-radius: 4px;
        box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #84ffff; 
    }
`;
