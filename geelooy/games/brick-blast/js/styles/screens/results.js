// B"H

const resultScreenStyles = `
/* B"H - RESULT SCREEN STYLES (Game Over, Level Complete) */

#level-complete-screen, #game-over-screen { 
    justify-content: center; 
}

.result-screen-content { 
    text-align: center; 
    width: 100%;
}
.result-screen-content p { 
    font-size: 1.25rem; 
    margin-top: 0; 
    margin-bottom: 1.5rem; 
    color: white; /* Removed gray */
    font-weight: 700;
}
.result-score { 
    font-weight: 900; 
    color: var(--warning); 
    text-shadow: 0 0 10px rgba(250, 204, 21, 0.4);
}
.peruta-penalty { 
    font-weight: 900; 
    color: var(--danger); 
    font-size: 1.4rem; 
}
.peruta-bonus { 
    font-weight: 900; 
    color: var(--peruta-gold); 
    font-size: 1.4rem; 
}
.result-buttons { 
    display: flex; 
    flex-direction: column; 
    gap: 1rem; 
    width: 80%; 
    margin: 2rem auto 0 auto;
}
.result-buttons .btn { 
    margin-top: 0; 
}

`;

export default resultScreenStyles;