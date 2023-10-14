'use strict';
const readline = require('readline');
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const client = new BedrockRuntimeClient({ apiVersion: '2023-09-30', region: 'us-west-2' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  keepOpen: true,
});

rl.question('Type in your prompt : ', async (prompt) => {
  const params = {
    modelId: "ai21.j2-mid-v1", // Jurassic-2 Mid
    contentType: "application/json",
    accept: "*/*",
    body: JSON.stringify({
      prompt: prompt,
      maxTokens:50, 
      temperature:0,
      topP:1.0,
      stopSequences:["##"],
      countPenalty: { scale :0},
      presencePenalty:{scale:0},
      frequencyPenalty:{scale:0}
    })
  }
  const command = new InvokeModelCommand(params);

  const response = await client.send(command);

  const responseObject = JSON.parse(Buffer.from(response.body).toString());
  const responseText = responseObject.completions[0]?.data?.text;

  process.stdout.write(responseText);
  
  rl.close();
});
