// B"H
import { contactShadowIntent } from '../../systems/visuals/ContactShadowPolicy.js';
import { edgeWearIntent } from '../../systems/visuals/EdgeWearMaterialPass.js';
import { roughnessVariation } from '../../systems/visuals/RoughnessVariationPass.js';
if(!contactShadowIntent('animal').enabled) throw new Error('Contact shadow disabled');
if(!edgeWearIntent('wall').cornerWear) throw new Error('Wall edge wear missing');
if(roughnessVariation('terrain').max<.95) throw new Error('Terrain roughness variation too weak');
console.log('B"H contactShadowEdgeWearAudit passed');
