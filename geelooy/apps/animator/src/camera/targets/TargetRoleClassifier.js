// B"H
export class TargetRoleClassifier{static role(id,event={}){if(id===event.speaker)return'speaker';if(id===event.listener)return'listener';if(id===event.prop||id===event.objectTarget)return'object';if(id===event.primaryTarget)return'primary';return'subject';}}
