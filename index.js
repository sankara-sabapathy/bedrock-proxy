'use strict';

const { BedrockRuntime } = require('aws-sdk')

const bedrock = new BedrockRuntime({ endpoint: 'bedrock-runtime.us-west-2.amazonaws.com', apiVersion: '2023-09-30', region: 'us-west-2' });

module.exports.handler = async (event) => {
  const input = JSON.parse(event.body);
  if(!input.prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing prompt / Prompt length greater than 50 char"
      }, null, 2)
    }
  }
  const response = await bedrock.invokeModel({
    "modelId": "ai21.j2-mid-v1",
    "contentType": "application/json",
    "accept": "*/*",
    "body": JSON.stringify({"prompt": input.prompt,"maxTokens":50,"temperature":0,"topP":1.0,"stopSequences":["##"],"countPenalty":{"scale":0},"presencePenalty":{"scale":0},"frequencyPenalty":{"scale":0}}) 
  }).promise();
  const responseObject = JSON.parse(Buffer.from(response.body).toString());
  const responseText = responseObject.completions[0]?.data?.text;
  return {
    statusCode: 200,
    body: JSON.stringify({
      text: responseText
    }, null, 2)
  };
};
