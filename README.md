# RAG vs AgenticRAG

This project compares **Retrieval-Augmented Generation (RAG)** with **Agentic RAG** for querying and analyzing PDF documents using Pinecone, LangChain, and Groq.

## Prerequisites

1. **Node.js** and **Bun** installed.
2. API keys for:
   - Pinecone
   - OpenAI
   - Cohere
   - Groq
   - LlamaParse (Llama Cloud)

## Setup

### 1. Install Dependencies

Run the following command to install all dependencies:

```bash
bun install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
PINECONE_API_KEY=your_pinecone_api_key
OPENAI_API_KEY=your_openai_api_key
COHERE_API_KEY=your_cohere_api_key
GROQ_KEY=your_groq_api_key
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key
```

### 3. Add PDF to Vector Store

To parse and store a PDF in Pinecone, run the following script:

```bash
bun run src/scripts/vectorStore.ts
```

This script uses LlamaParse to extract text from the PDF and stores it in Pinecone.

### 4. Run Traditional RAG

To execute the **Traditional RAG** agent, run:

```bash
bun run src/agent/traditional_rag_agent.ts
```

This agent performs a similarity search in Pinecone and returns the most relevant information.

### 5. Run Agentic RAG

To execute the **Agentic RAG** agent, run:

```bash
bun run src/agent/agentic_rag_agent.ts
```

This agent includes additional steps like query rewriting and relevance checking to improve the quality of the response.

## Project Structure

- **`src/scripts/vectorStore.ts`**: Parses and stores PDFs in Pinecone.
- **`src/tools/pinecone_search.ts`**: Handles Pinecone similarity search and Cohere reranking.
- **`src/agent/traditional_rag_agent.ts`**: Implements the Traditional RAG pipeline.
- **`src/agent/agentic_rag_agent.ts`**: Implements the Agentic RAG pipeline with query rewriting and relevance checking.

## Notes

- Ensure the PDF path in `vectorStore.ts` is correct before running the script.
- The project uses Groq for LLM inference, but you can replace it with other models if needed.

## License

This project is open-source and available under the MIT License.
