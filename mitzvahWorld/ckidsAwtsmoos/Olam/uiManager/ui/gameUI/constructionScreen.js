
//B"H
/**
 * Bezalel Workshop - The Holy Construction Interface.
 */
import constructionStyle from "../skins/2/constructionStyle.js";

export default {
    shaym: "constructionScreen",
    className: "bezalel-workshop hidden",
    awtsmoosClick: true,
    
    state: {
        baseType: "BoxGeometry",
        modifiers: []
    },

    on: {
        open(e, $, ui) {
            $("constructionScreen").classList.remove("hidden");
            ui.peula($("constructionScreen"), { render: true });
        },
        render(e, $, ui) {
            const list = $("bz-modifiers-list");
            list.innerHTML = "";
            const st = $("constructionScreen").state || { modifiers: [] };
            
            st.modifiers.forEach((m, i) => {
                ui.html({
                    parent: list,
                    className: "bz-modifier-card",
                    children: [
                        { textContent: `${m.type.toUpperCase()}: ${m.text || m.count || ''}` },
                        { tag: "button", textContent: "X", onclick: () => { st.modifiers.splice(i,1); ui.peula($("constructionScreen"), {render: true}); } }
                    ]
                });
            });
        },
        addModifier(e, $, ui) {
            const type = e.detail.type;
            const st = $("constructionScreen").state || { modifiers: [] };
            $("constructionScreen").state = st;

            if (type === 'gematria') {
                const text = prompt("Enter Hebrew Word for Gematria:");
                if (text) st.modifiers.push({ type: 'gematria', text });
            } else {
                st.modifiers.push({ type, count: 5 });
            }
            ui.peula($("constructionScreen"), { render: true });
        },
        spawn(e, $, ui) {
             const st = $("constructionScreen").state || { modifiers: [], baseType: "BoxGeometry" };
             const golem = {
                 guf: { [st.baseType]: [1,1,1] },
                 modifiers: st.modifiers,
                 isProceduralBuilding: true
             };
             ui.peula("ikar", { olamPeula: { addItem: { name: "Sacred Blueprint", className: "Blueprint", isBuildable: true, golem } } });
             $("constructionScreen").classList.add("hidden");
        }
    },

    children: [
        { tag: "style", innerHTML: constructionStyle },
        { className: "bezalel-header", children: [{ className: "bezalel-title", textContent: "Bezalel Workshop" }] },
        {
            className: "bezalel-body",
            children: [
                {
                    className: "bz-panel left",
                    children: [
                        { tag: "button", className: "bz-btn", textContent: "+ Gematria Stack", onclick: (e,$,ui) => ui.peula($("constructionScreen"), {addModifier: {type: 'gematria'}}) },
                        { tag: "button", className: "bz-btn", textContent: "+ Radial Array", onclick: (e,$,ui) => ui.peula($("constructionScreen"), {addModifier: {type: 'radial'}}) },
                        { tag: "button", className: "bz-btn spawn", textContent: "CREATE BLUEPRINT", onclick: (e,$,ui) => ui.peula($("constructionScreen"), {spawn: true}) }
                    ]
                },
                { className: "bz-panel center", children: [{ shaym: "bz-modifiers-list" }] }
            ]
        }
    ]
}
