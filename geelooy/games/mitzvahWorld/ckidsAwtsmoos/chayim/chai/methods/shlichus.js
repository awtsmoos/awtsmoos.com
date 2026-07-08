// B"H
/**
 * @module ShlichusMethods
 * @description THE FACULTIES OF THE MISSION
 * Handles quest acceptance, progress tracking, and reward distribution.
 */
import { SHLICHUS_MANIFEST } from '../../../tochen/shlichus/shlichusManifest.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    activeMissions: [],

    acceptMission(missionId) {
        const missionTemplate = SHLICHUS_MANIFEST[missionId];
        if (!missionTemplate) return;

        if (this.activeMissions.find(m => m.id === missionId)) return;

        const newMission = {
            ...missionTemplate,
            currentStep: 0,
            currentValue: 0,
            targetValue: missionTemplate.steps[0].amount || 1,
            completed: false
        };

        this.activeMissions.push(newMission);
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: "MISSION ACCEPTED!", color: "#ffd700" });
        this.updateShlichusUI();
    },

    updateQuestProgress(type, target) {
        let changed = false;
        this.activeMissions.forEach(mission => {
            if (mission.completed) return;

            const step = mission.steps[mission.currentStep];
            if (step.type === type && step.target === target) {
                mission.currentValue++;
                if (mission.currentValue >= mission.targetValue) {
                    this.advanceMission(mission);
                }
                changed = true;
            }
        });

        if (changed) this.updateShlichusUI();
    },

    advanceMission(mission) {
        mission.currentStep++;
        if (mission.currentStep >= mission.steps.length) {
            this.completeMission(mission);
        } else {
            const nextStep = mission.steps[mission.currentStep];
            mission.currentValue = 0;
            mission.targetValue = nextStep.amount || 1;
            this.olam.ayshPeula("ui event", "effectsOverlay", { text: "STEP COMPLETE!", color: "#00ff00" });
        }
    },

    completeMission(mission) {
        mission.completed = true;
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: "SHLICHUS COMPLETE!", color: "#ffd700" });
        
        // Distribute Rewards
        if (mission.rewards) {
            if (mission.rewards.xp) this.gainXp(mission.rewards.xp);
            if (mission.rewards.items) {
                mission.rewards.items.forEach(item => {
                    this.addToInventory(item.itemId, item.amount);
                });
            }
            if (mission.rewards.skills) {
                mission.rewards.skills.forEach(skillId => {
                    this.learnSkill(skillId);
                });
            }
        }
        this.updateShlichusUI();
    },

    updateShlichusUI() {
        this.olam.ayshPeula("ui event", "shlichusBook", { updateShlichus: this.activeMissions });
    }
};
