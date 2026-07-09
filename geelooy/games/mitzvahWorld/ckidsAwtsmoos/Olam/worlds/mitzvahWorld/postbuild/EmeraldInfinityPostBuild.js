// B"H
/**
 * EmeraldInfinityPostBuild pours the new civilization memory into the actual world boot.
 * It creates no meshes, no materials, no listeners, no raycasts: only consequence data.
 */
import EmeraldInfinityRuntime from "../EmeraldInfinityRuntime.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import VillageMemory from "../village/VillageMemory.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import VillageEconomy from "../village/VillageEconomy.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import TradeNetwork from "../village/TradeNetwork.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import VillageGrowthSimulator from "../village/VillageGrowthSimulator.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import ShabbosPreparationRuntime from "../community/ShabbosPreparationRuntime.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import HolidayRuntime from "../community/HolidayRuntime.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import LearningNetwork from "../community/LearningNetwork.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import ScholarTravelSystem from "../community/ScholarTravelSystem.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import VillageSoundscape from "../audio/VillageSoundscape.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import ForestSoundscape from "../audio/ForestSoundscape.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import WeatherSoundscape from "../audio/WeatherSoundscape.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import AnimalFamilies from "../region/wildlife/AnimalFamilies.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import AnimalMigration from "../region/wildlife/AnimalMigration.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import AnimalTerritoryMemory from "../region/wildlife/AnimalTerritoryMemory.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import AnimalPredatorNetwork from "../region/wildlife/AnimalPredatorNetwork.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import HerdHierarchy from "../region/wildlife/HerdHierarchy.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import BirdMigrationRuntime from "../region/wildlife/BirdMigrationRuntime.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const getScene=c=>c?.scene||c?.olam?.scene||null;
const getOlam=c=>c?.olam||c||{};
function seedVillages(rt){rt.event('new_teacher_arrived',{subject:'teacher_1',place:'kfar_1'});rt.event('storm_destroyed_fence',{subject:'north_fence',place:'kfar_1'});rt.relationships.relate('teacher_1','student_1','teacher',.85);rt.relationships.relate('baker_1','shepherd_1','neighbor',.35);rt.rumors.seed('north_fence','storm_destroyed_fence','watchman',['repair']);rt.reputation.adjust('player','helpfulness',2,'known for village errands');rt.step('player',12,20);rt.step('goat_1',13,21);rt.forest.season('cedar_valley',{rain:.7,storm:.15,grazing:.05});rt.farWorld.tick('far_kfar_beis',12);rt.tick(1,['teacher_1','student_1','baker_1','shepherd_1','player']);}
function buildVillageData(){const memory=new VillageMemory();const economy=new VillageEconomy();const trade=new TradeNetwork();const growth=new VillageGrowthSimulator();memory.change('kfar_1',{food:-16,repairs:1},'storm consequence');economy.change('kfar_1',{wood:9,tools:-2},'repair demand');trade.change('kfar_1',{food:6,wood:-3},'neighbor trade');growth.grow('kfar_1');return{memory:memory.snapshot('kfar_1'),economy:economy.snapshot('kfar_1'),trade:trade.snapshot('kfar_1'),growth:growth.snapshot('kfar_1')};}
function buildCommunityData(){const shabbos=new ShabbosPreparationRuntime();const holidays=new HolidayRuntime();const learning=new LearningNetwork();const scholars=new ScholarTravelSystem();shabbos.add('kfar_1','cook for guests',2);shabbos.add('kfar_1','clean courtyard',1);holidays.add('kfar_1','prepare sukkah wood',1);learning.add('kfar_1','teacher_1 teaches student_1',3);scholars.add('kfar_1','traveling scholar mission',2);return{shabbos:shabbos.snapshot('kfar_1'),holidays:holidays.snapshot('kfar_1'),learning:learning.snapshot('kfar_1'),scholars:scholars.snapshot('kfar_1')};}
function buildAnimalData(){const families=new AnimalFamilies();const migration=new AnimalMigration();const territory=new AnimalTerritoryMemory();const predators=new AnimalPredatorNetwork();const herds=new HerdHierarchy();const birds=new BirdMigrationRuntime();families.link('deer_mother_1','fawn_1','family');migration.remember('deer_herd_1','route_spring',2);territory.remember('wolf_pack_1','north_wadi',3);predators.link('wolf_pack_1','sheep_flock_1','predator');herds.link('ram_1','sheep_flock_1','leader');birds.remember('dove_flock_1','spring_return',4);return{families:families.summary(),migration:migration.summary(),territory:territory.summary(),predators:predators.summary(),herds:herds.summary(),birds:birds.summary()};}
function buildAudioData(){const village=new VillageSoundscape();const forest=new ForestSoundscape();const weather=new WeatherSoundscape();village.set('learning',.7);village.set('children',.45);forest.set('birds',.8);forest.set('wind',.35);weather.set('post_storm_drips',.5);return{village:village.snapshot(),forest:forest.snapshot(),weather:weather.snapshot()};}
export function ensureEmeraldInfinityPostBuild(context={}){const scene=getScene(context);const olam=getOlam(context);const runtime=olam.emeraldInfinity||new EmeraldInfinityRuntime();seedVillages(runtime);const consequence={world:runtime.tick(1,['teacher_1','student_1','player']),villages:buildVillageData(),community:buildCommunityData(),animals:buildAnimalData(),audio:buildAudioData(),discovery:runtime.discovery.reveal([{type:'story',text:'A broken fence became a village repair mission.'}],Date.now()+240001),visualHints:{terrain:runtime.terrain.snapshot().maps,forest:runtime.forest.renderHint('cedar_valley'),farWorld:runtime.farWorld.snapshot()}};olam.emeraldInfinity=runtime;olam.emeraldInfinityConsequence=consequence;if(scene?.userData){scene.userData.emeraldInfinity=runtime;scene.userData.emeraldInfinityConsequence=consequence;}return{runtime,consequence,stats:{facts:runtime.facts.snapshot().count,rumors:runtime.rumors.publicView().length,terrainCells:runtime.terrain.snapshot().cells,drawCallsAdded:0,materialsAdded:0,listenersAdded:0,raycastsAdded:0}};}
export default ensureEmeraldInfinityPostBuild;
