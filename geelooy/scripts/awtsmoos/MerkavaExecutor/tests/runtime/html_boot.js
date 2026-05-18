// B"H
window.htmlBooted = true;
const marker = document.createElement("div");
marker.setAttribute("id", "html-boot-marker");
marker.textContent = "HTML boot awakened";
document.body.appendChild(marker);
console.log("html boot script ran");
