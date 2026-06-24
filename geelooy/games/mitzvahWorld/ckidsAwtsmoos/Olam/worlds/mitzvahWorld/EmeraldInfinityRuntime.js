// B"H
/** EmeraldInfinityRuntime: one vessel tying memory, story, animals, villages, audio, and far world. */
import WorldFactDatabase from './world/WorldFactDatabase.js';
import WorldEventHistory from './world/WorldEventHistory.js';
import RelationshipGraph from './social/RelationshipGraph.js';
import RumorNetwork from './social/RumorNetwork.js';
import ReputationSystem from './social/ReputationSystem.js';
import TerrainEvolutionRuntime from './environment/TerrainEvolutionRuntime.js';
import FootTrafficMap from './environment/FootTrafficMap.js';
import ForestMemory from './environment/ForestMemory.js';
import StorySeedGenerator from './story/StorySeedGenerator.js';
import StoryPropagation from './story/StoryPropagation.js';
import DiscoveryDensitySystem from './exploration/DiscoveryDensitySystem.js';
import StatisticalFarWorld from './world/StatisticalFarWorld.js';
export class EmeraldInfinityRuntime{
  constructor(){this.facts=new WorldFactDatabase();this.history=new WorldEventHistory();this.relationships=new RelationshipGraph();this.rumors=new RumorNetwork();this.reputation=new ReputationSystem();this.terrain=new TerrainEvolutionRuntime();this.traffic=new FootTrafficMap();this.forest=new ForestMemory();this.seed=new StorySeedGenerator();this.stories=new StoryPropagation();this.discovery=new DiscoveryDensitySystem();this.farWorld=new StatisticalFarWorld();}
  event(type,payload={}){const e=this.history.record(type,payload);this.facts.rememberEvent(e);this.stories.add(this.seed.fromEvent(e));return e;}
  step(entity,x,z){const t=this.traffic.add(entity,x,z);this.terrain.stepOn(t.id,1);return t;}
  tick(dt=1,people=[]){this.rumors.propagate(people,this.relationships);this.stories.tick({rumors:this.rumors,reputation:this.reputation,people});return{facts:this.facts.snapshot(),history:this.history.summary(),terrain:this.terrain.snapshot()};}
}
export default EmeraldInfinityRuntime;
