import express, { Request, Response } from 'express';
import Groq from 'npm:groq-sdk';
import cors from 'cors';

const app = express();
const groq = new Groq({ apiKey: Deno.env.get("GROQ_API_KEY") });

const PORT = 3141;

app.use(express.json());
app.use(cors({
  origin: '*', // Allows your Netlify frontend to communicate with Render
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

const secure_prompt = async(query: string, language: string = 'en') => {

  const file = language == 'en' ? 'persona_eng.txt' : 'persona_tr.txt';

  const system = await Deno.readTextFile(file);

  console.log(`system content ${system.substring(0,50)}`);

  return query + system;
}

app.post("/query",async(req : Request, res : Response)=>{


  console.log(req.body);
  console.log(`query is ${req.body.query}`);
  console.log(`lang is ${req.body.language}`);

  //const language = req.body.language;
  const prompt2run = await secure_prompt(req.body.query, req.body.language);

  const stream = await groq.chat.completions.create({

    model: "llama-3.1-8b-instant", // High-speed processing target model on Groq
    messages: [{ role: "user", content: prompt2run }],
    stream: true,

  });

  for await (const chunk of stream) {
    const textChunk = chunk.choices[0]?.delta?.content || "";
    if (textChunk) {
      res.write(textChunk);
    }
  }

  console.log('responce sent');
  res.end();

});

app.listen(PORT, () => {
  console.log(`Backend server context active on port ${PORT}`);
});
