// B"H
const response = await fetch('/virtual/data.json');
const text = await response.text();
console.log('network response', response.status, text);
