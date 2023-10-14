'use strict';
const readline = require('readline');
const { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } = require("@aws-sdk/client-bedrock-runtime");
const client = new BedrockRuntimeClient({ apiVersion: '2023-09-30', region: 'us-west-2' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  keepOpen: true,
});

rl.question('Type in your prompt : ', async (prompt) => {
  const params = {
    modelId: "cohere.command-text-v14",
    contentType: "application/json",
    accept: "*/*",
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 10,
      temperature: 0.75,
      p: 0.01,
      k: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE',
      stream: true
    })
  }
  const command = new InvokeModelWithResponseStreamCommand(params);

  const response = await client.send(command);

  const chunks = [];
  for await (const chunk of response.body) {
    const parsedChunk = JSON.parse(Buffer.from(chunk.chunk.bytes).toString('utf-8'))
    if (parsedChunk.is_finished || parsedChunk.text === '<EOS_TOKEN>') {
      continue;
    }
    process.stdout.write(parsedChunk.text);
    chunks.push(parsedChunk.text);
  }
  
  rl.close();
});