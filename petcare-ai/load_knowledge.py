"""
load_knowledge.py
Run this ONCE to populate ChromaDB with PetCare+ knowledge.
Usage: python load_knowledge.py
"""

import chromadb
from sentence_transformers import SentenceTransformer

KNOWLEDGE_FILE = "petcare_chromadb_knowledge.txt"
CHROMA_PATH    = "./chroma_db"          
COLLECTION     = "petcare_knowledge"

def parse_chunks(filepath: str) -> list[dict]:
    """Parse the knowledge file into individual chunks."""
    chunks = []
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    raw_chunks = content.split("---\n\nCHUNK")
    for raw in raw_chunks:
        raw = raw.strip()
        if not raw or raw.startswith("PETCARE+"):
            continue

        lines = raw.split("\n")
        header = lines[0] if lines else ""
        chunk_id_line = ""
        topic = ""
        doc_id = ""

        for line in lines:
            if line.startswith("ID:"):
                doc_id = line.replace("ID:", "").strip()
            if "TOPIC:" in line:
                topic = line.split("TOPIC:")[-1].strip()

        body_parts = raw.split("---\n", 2)
        body = body_parts[-1].strip() if len(body_parts) >= 2 else raw

        if doc_id and body:
            chunks.append({
                "id":    doc_id,
                "topic": topic,
                "text":  body,
            })

    return chunks


def main():
    print("📦 Loading embedding model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("🗄️  Connecting to ChromaDB...")
    client     = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_or_create_collection(name=COLLECTION)

    print(f"📄 Parsing knowledge file: {KNOWLEDGE_FILE}")
    chunks = parse_chunks(KNOWLEDGE_FILE)
    print(f"   Found {len(chunks)} chunks")

    ids        = [c["id"]    for c in chunks]
    documents  = [c["text"]  for c in chunks]
    metadatas  = [{"topic": c["topic"]} for c in chunks]

    print("🔢 Generating embeddings...")
    embeddings = model.encode(documents).tolist()

    print("💾 Inserting into ChromaDB...")
    collection.upsert(
        ids        = ids,
        documents  = documents,
        embeddings = embeddings,
        metadatas  = metadatas,
    )

    print(f"\n✅ Done! {len(chunks)} chunks stored in collection '{COLLECTION}'")
    print(f"   ChromaDB path: {CHROMA_PATH}")


if __name__ == "__main__":
    main()