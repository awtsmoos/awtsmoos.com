//B"H
export default {
    hire(employer) {
        this.hired = true; this.employerId = employer.id;
        this.ayshPeula("ui event", "effectsOverlay", { text: this.name + " Hired!", color: "#00ff00" });
    },
    fire() { this.hired = false; this.ayshPeula("ui event", "effectsOverlay", { text: "Fired!", color: "red" }); }
}