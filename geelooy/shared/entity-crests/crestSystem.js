// B"H
export function crestSvg(type='post'){
const map={post:'📜',question:'✦',answer:'☀',comment:'🧵',series:'🌳',heichel:'🏛',asset:'💎'};
return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#281942"/><text x="50" y="62" font-size="42" text-anchor="middle">${map[type]||'◉'}</text></svg>`;
}
