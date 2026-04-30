
/**
 * B"H
 * @module walletCSS
 */
export default /*css*/`
.wallet-display {
    background: linear-gradient(90deg, #1e130c 0%, #3a2a11 100%);
    border: 2px solid #FFD700;
    border-radius: 12px;
    padding: 12px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.4);
    margin-top: 10px;
    flex-shrink: 0;
    transition: transform 0.2s;
}
.wallet-display:hover {
    transform: scale(1.02);
    box-shadow: 0 0 35px rgba(255, 215, 0, 0.6);
}
.wallet-title {
    font-family: 'Fredoka One', cursive;
    color: #FFD700;
    font-size: 22px;
    text-transform: uppercase;
    text-shadow: 0 0 8px #b8860b;
}
.wallet-amount {
    font-size: 28px;
    font-weight: bold;
    color: #fff;
    text-shadow: 2px 2px 0 #000;
    display: flex;
    align-items: center;
    gap: 12px;
}
.wallet-coin-icon {
    width: 35px;
    height: 35px;
    background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImNvcHBlckdyYWQiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSIgZng9IjMwJSIgZnk9IjMwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmYmY4MCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2I4NzMzMyIvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJ1cmwoI2NvcHBlckdyYWQpIiBzdHJva2U9IiM4MDQwMDAiIHN0cm9rZS13aWR0aD0iMyIvPjwvc3ZnPg==");
    background-size: contain;
    background-repeat: no-repeat;
    filter: drop-shadow(0 0 5px #ffd700);
}
`;
