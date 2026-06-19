// B"H
export class CharacterViewAngleMapper{static view(yaw=0){const a=((Number(yaw)%360)+360)%360;if(a<22||a>338)return'front';if(a<68||a>292)return'threeQuarter';if(a<112||a>248)return'side';if(a<158||a>202)return'backThreeQuarter';return'back';}}
