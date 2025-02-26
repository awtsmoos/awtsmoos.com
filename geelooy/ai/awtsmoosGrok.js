//B"H

async function sendToGrok({
    prompt, 
    conversationId,
    parentMessageId
}) {
    /**
     * for new:
     * 
        parentMessageId
        https://grok.com/rest/app-chat/conversations/new



        customInstructions
: 
""
deepsearchPreset
: 
""
disableSearch
: 
false
enableImageGeneration
: 
true
enableImageStreaming
: 
true
enableSideBySide
: 
true
fileAttachments
: 
[]
forceConcise
: 
false
imageAttachments
: 
[]
imageGenerationCount
: 
2
isPreset
: 
false
isReasoning
: 
false
message
: 
"BH"
modelName
: 
"grok-latest"
returnImageBytes
: 
false
returnRawGrokInXaiRequest
: 
false
sendFinalMetadata
: 
true
temporary
: 
false
toolOverrides
: 
{}
     */
    var resp = await fetch(`https://grok.com/rest/app-chat/conversations/${conversationId}/responses`, {
      "headers": {
       
        "content-type": "application/json",
        
      },
      "body":JSON.stringify( {
    	"message": prompt,
    	"modelName": "grok-2",
    	"parentResponseId": parentMessageId,
        "disableSearch": false,
    	"enableImageGeneration": true,
    	"imageAttachments": [],
    	"returnImageBytes": false,
    	"returnRawGrokInXaiRequest": false,
    	"fileAttachments": [],
    	"enableImageStreaming": true,
    	"imageGenerationCount": 2,
    	"forceConcise": false,
    	"toolOverrides": {},
    	"enableSideBySide": true,
    	"sendFinalMetadata": true,
    	"customInstructions": "",
    	"deepsearchPreset": "",
    	"isReasoning": false
      }),
      "method": "POST"
    });
}
///await sendToGrok({prompt:"Go on WAY better", conversationId: "116d65e7-fead-4f4c-a71c-0628cdc1c889"})