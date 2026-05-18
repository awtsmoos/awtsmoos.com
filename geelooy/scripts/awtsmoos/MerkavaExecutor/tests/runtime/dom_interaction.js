// B"H
const input = document.createElement("input");
input.setAttribute("id", "name");
document.body.appendChild(input);
let heard = "";
input.addEventListener("input", event => {
    heard += event.data || "";
});
page.type("#name", "BH");
page.click("#name");
if (input.value !== "BH") throw new Error("virtual keyboard did not type into active element");
if (heard !== "BH") throw new Error("input event stream was not captured");
console.log("interaction", input.value, mouse.toJSON().history.length);
