import { genkit } from 'genkit';import { ollama } from 'genkitx-ollama';
export const ai = genkit({ plugins: 
  [ ollama({ models: [ { name: 'qwen2.5:3b', type: 'generate', }, ], 
    
    serverAddress: process.env.OLLAMA_SERVER || "http://localhost:11434", }) ], model: 'ollama/qwen2.5:3b',});