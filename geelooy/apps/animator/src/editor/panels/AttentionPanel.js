// B"H
export class AttentionPanel { static model(character) { return { title: 'Attention', characterId: character?.id, target: character?.attentionTarget || null }; } }
