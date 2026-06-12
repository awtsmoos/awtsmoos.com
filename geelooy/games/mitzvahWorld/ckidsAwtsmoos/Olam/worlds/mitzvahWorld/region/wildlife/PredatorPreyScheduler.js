// B"H
/** @file PredatorPreyScheduler.js @description Chapter 1008: predator/prey events become typed state triggers. */
export function predatorPreySchedule() {
  return [
    { event: "fox-hunts-rabbit", predator: "fox", prey: "rabbit", range: 46, attackRange: 2.4, period: 42 },
    { event: "rabbit-flees-fox", species: "rabbit", threat: "fox", range: 54, period: 12 },
    { event: "deer-flee-player", species: "deer", threat: "player", range: 18, period: 8 },
    { event: "frog-drinks-marsh", species: "frog", state: "drink", period: 24 },
    { event: "goat-climbs-ridge", species: "goat", state: "climb", period: 30 },
    { event: "birds-flock-rise", species: "bird", state: "flock", period: 18 }
  ];
}
