// B"H
export function wildlifeEcosystemStep({prey=20,predators=2,food=.7,water=.6,dt=1}={}){
  const preyBirth=food*.08*prey*dt;
  const predation=Math.min(prey,predators*.7*dt);
  const droughtLoss=water<.2?1*dt:0;
  const predatorDrift=(predation>.5?.05:-.04)*predators*dt;
  const nextPrey=Math.max(0,prey+preyBirth-predation-droughtLoss);
  const nextPredators=Math.max(0,predators+predatorDrift);
  return {prey:nextPrey,predators:nextPredators,vegetationPressure:Math.min(1,nextPrey/60),animalActivity:water>.4?'grazing-routes':'water-seeking'};
}
export default wildlifeEcosystemStep;
