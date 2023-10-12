'use strict';

// const { BedrockRuntime } = require('aws-sdk')
const { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } = require("@aws-sdk/client-bedrock-runtime");
const client= new BedrockRuntimeClient({apiVersion: '2023-09-30', region: 'us-west-2' , defaultsMode: 'legacy' });

module.exports.handler = awslambda.streamifyResponse(async (event, responseStream) => {
  const input = JSON.parse(event.body);
  if(!input.prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing prompt / Prompt length greater than 50 char"
      }, null, 2)
    }
  }
  responseStream.setContentType('text/plain');
  responseStream.write('Hello, world!');


  const params = {
    modelId: "cohere.command-text-v14",
    contentType: "application/json",
    accept: "*/*",
    body: JSON.stringify({
      prompt: input.prompt,
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
    console.log(JSON.parse(Buffer.from(chunk.chunk.bytes).toString('utf-8')).text)
    responseStream.write(JSON.parse(Buffer.from(chunk.chunk.bytes).toString('utf-8')).text);
    chunks.push(JSON.parse(Buffer.from(chunk.chunk.bytes).toString('utf-8')).text);
  }
  console.log(chunks);
  console.log(JSON.stringify(chunks))

  responseStream.end();

  // const responseObject = JSON.parse(Buffer.from(response.body).toString());
  // const responseText = responseObject.completions[0]?.data?.text;
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     text: response
  //   }, null, 2)
  // };
});


// handler({
//   body: JSON.stringify({
//     prompt: "What is the capital of France?"
//   })})

