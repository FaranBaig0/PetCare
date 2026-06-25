import os
import json
import numpy as np
import chromadb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# ── CORS ────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Clients ──────────────────────────────────────────────
groq_client     = Groq(api_key=os.getenv("GROQ_API_KEY"))

print("Loading embedding model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model ready!")

# ── ChromaDB ─────────────────────────────────────────────
print("Connecting to ChromaDB...")
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection    = chroma_client.get_or_create_collection(name="petcare_knowledge")
print(f"ChromaDB ready! Collection has {collection.count()} chunks.")

# ── Models ───────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str

class SymptomRequest(BaseModel):
    symptoms: str


# ── Helper: query ChromaDB for relevant context ──────────
def get_context(query: str, n_results: int = 3) -> str:
    """Semantic search ChromaDB and return top matching chunks as context string."""
    query_embedding = embedding_model.encode([query]).tolist()
    results = collection.query(
        query_embeddings = query_embedding,
        n_results        = min(n_results, collection.count() or 1),
        include          = ["documents", "metadatas"],
    )
    docs = results.get("documents", [[]])[0]
    if not docs:
        return "No specific context found. Answer based on general PetCare+ knowledge."
    return "\n\n---\n\n".join(docs)


# ── POST /chat  →  customer support / navigation ─────────
@app.post("/chat")
async def website_navigator(req: ChatRequest):
    try:
        context = get_context(req.message)

        system_prompt = f"""
You are the PetCare+ in-app support assistant. Your job is to help users navigate the app and answer questions about its features.
Keep your response brief and friendly (maximum 2-3 sentences).
Use the context below to give accurate, specific answers. If the context mentions a screen path (like /marketplace or /doctors), mention it clearly.

CONTEXT:
{context}

Rules:
- Be polite and concise.
- If the user asks where to do something, tell them exactly which screen or button to use.
- Do not make up features that are not in the context.
"""
        completion = groq_client.chat.completions.create(
            model       = "llama-3.3-70b-versatile",
            messages    = [
                {"role": "system",  "content": system_prompt},
                {"role": "user",    "content": req.message},
            ],
            temperature = 0.2,
        )
        return {"reply": completion.choices[0].message.content.strip()}

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /predict-symptom  →  vet AI diagnosis ────────────
@app.post("/predict-symptom")
async def check_symptoms(req: SymptomRequest):
    try:
        system_prompt = """
You are an advanced expert AI Veterinary Assisting Core. Analyze the user's pet symptoms.
You must return your analysis in a valid, raw JSON structure with exactly two fields. Do not include markdown code block syntax (like ```json).

Expected Format:
{"diagnosis": "Your clear medical evaluation text here.", "urgency": "low" or "medium" or "high"}
"""
        completion = groq_client.chat.completions.create(
            model       = "llama-3.3-70b-versatile",
            messages    = [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": f"Analyze these symptoms: {req.symptoms}"},
            ],
            temperature = 0.1,
        )
        return json.loads(completion.choices[0].message.content.strip())

    except Exception as e:
        print(f"Symptom error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)