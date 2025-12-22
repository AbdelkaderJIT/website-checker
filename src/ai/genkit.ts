import { genkit } from 'genkit';import { ollama } from 'genkitx-ollama';
export const ai = genkit({ plugins: 
  [ ollama({ models: [ { name: 'deepseek-r1:latest', type: 'generate', }, ], 
    
    serverAddress: process.env.OLLAMA_SERVER || "http://127.0.0.1:11434", }) ], model: 'ollama/deepseek-r1:latest',});