// B"H
const app = document.createElement('div');
app.setAttribute('id', 'app');
app.textContent = 'Merkava DOM is alive';
document.body.appendChild(app);
console.log('dom children', document.body.children.length);
