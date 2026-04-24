
// B"H
export const Saving = {
    shaym: "Saving",
    className: "hidden menuItm",
    innerHTML: "Saving...",
    on: {
        awtsmoosRevealed(e, $, ui) {
            var ikar = $("ikar");
            if (!ikar) return;
            ikar.dispatchEvent(new CustomEvent("olamPeula",{ detail: { downloadWorld: true } }));
        },
    }
};
