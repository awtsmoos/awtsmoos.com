// B"H
export default [
    { shaym: "msg npc", style: { bottom: "20px", right: "15px", pointerEvents: "auto", maxWidth: "80%", wordWrap: "break-word" }, awtsmoosClick: true, className: "dialogue npc" },
    { shaym: "msg chossid", style: { bottom: "20px", left: "15px", pointerEvents: "auto", maxWidth: "80%", wordWrap: "break-word" }, awtsmoosClick: true, className: "dialogue chossid" },
    { shaym: "approach npc msg", className: "asApproachNpc hidden", awtsmoosOnChange: { textContent(e, me) { me.innerText = "Press C to talk to " + e.data.textContent; } } },
    { shaym: "approach portal msg", className: "asApproachNpc hidden", awtsmoosOnChange: { textContent(e, me) { me.innerText = "Press C to travel to " + e.data.textContent; } } }
];
