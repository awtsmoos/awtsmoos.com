// B"H

const mainMenuStyles = `
/* B"H - MAIN MENU STYLES */

#main-menu { 
    justify-content: center; 
}
#main-menu .main-menu-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}
#main-menu-perutas {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0,0,0,0.3);
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 1.1rem;
}
.high-score {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--peruta-gold);
    margin-top: -1.5rem;
    margin-bottom: 1.5rem;
}
#main-menu .main-menu-buttons .btn {
  margin-top: 0;
}
`;

export default mainMenuStyles;
