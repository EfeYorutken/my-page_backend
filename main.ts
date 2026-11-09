import express from 'express';
import Groq from 'npm:groq-sdk';
import cors from 'cors';

const app = express();
const groq = new Groq({ apiKey: Deno.env.get("GROQ_API_KEY") });

const MODEL = Deno.env.get("GROQ_MODEL") ?? "openai/gpt-oss-20b";

interface QueryRequest {
  body: { query: string; language?: string };
}

interface QueryResponse {
  headersSent: boolean;
  write(chunk: string): unknown;
  end(): unknown;
  status(code: number): QueryResponse;
  json(body: unknown): unknown;
}

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

app.post("/query",async(req: QueryRequest, res: QueryResponse)=>{


  console.log(req.body);
  console.log(`query is ${req.body.query}`);
  console.log(`lang is ${req.body.language}`);

  //const language = req.body.language;
  const prompt2run = await secure_prompt(req.body.query, req.body.language);

  try {
    const stream = await groq.chat.completions.create({

      model: MODEL, // Overridable via GROQ_MODEL; defaults to the Llama 3.1 8B replacement
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
  } catch (error) {
    console.error(`Groq request failed for model "${MODEL}":`, error);

    const detail = error instanceof Error ? error.message : String(error);

    if (res.headersSent) {
      res.end();
    } else {
      res.status(502).json({ error: "AI provider request failed", detail });
    }
  }

});

app.listen(PORT, () => {
  console.log(`Backend server context active on port ${PORT}`);
});
