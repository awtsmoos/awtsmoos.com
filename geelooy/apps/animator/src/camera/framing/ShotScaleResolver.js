// B"H
import { ShotVocabulary } from '../grammar/ShotVocabulary.js';
export class ShotScaleResolver{static zoom(shotType='mediumShot',bounds={}){const s=ShotVocabulary.get(shotType);const widthPenalty=Math.max(.78,Math.min(1.08,240/Math.max(160,bounds.w||240)));return Math.max(.52,Math.min(2.05,s.defaultZoom*widthPenalty));}}
