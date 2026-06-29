// B"H
import { acceptQuest, progressQuestObjective, questOfferPayload, turnInQuest } from "../../missions/QuestGossipRuntime.js";
import { questMarkersPayload } from "../../missions/QuestMarkerRuntime.js";
import { questTrackerPayload } from "../../missions/QuestTrackerRuntime.js";
import { openVendor } from "../../social/VendorRuntime.js";
import { trainerPayload, trainAbilityAtTrainer } from "../../trainers/TrainerRuntime.js";

export function runStarterServiceLoop(olam, combat) {
  const rebbe = olam.npcs.find(n => n.role === "rebbe") || olam.npcs[0];
  combat.selectTarget(rebbe.id);
  const interaction = combat.talkToTarget();
  const offer = questOfferPayload(olam, "the_first_shliach");
  const accepted = acceptQuest(olam, "the_first_shliach");
  const progress1 = progressQuestObjective(olam, "the_first_shliach", "talk_rebbe");
  const progress2 = progressQuestObjective(olam, "the_first_shliach", "discover_rebbe_house");
  const turnedIn = turnInQuest(olam, "the_first_shliach");
  const vendor = openVendor(olam, "toolmaker");
  const trainer = trainerPayload(olam);
  const trained = trainAbilityAtTrainer(olam, "learner", { free:true, silent:true });
  return { interaction, offer, accepted, progress1, progress2, turnedIn, tracker:questTrackerPayload(olam), markers:questMarkersPayload(olam), vendor, trainer, trained };
}
