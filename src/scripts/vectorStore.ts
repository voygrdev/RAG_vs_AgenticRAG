import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from 'langchain/document';
import { LlamaParseReader } from "llamaindex";
import * as dotenv from "dotenv";

dotenv.config({path:"../../.env"})

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: 'text-embedding-3-small',
});

const reader = new LlamaParseReader({
    resultType: "markdown",
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
})

const pinecone = new PineconeClient({apiKey: process.env.PINECONE_API_KEY!});

const pineconeIndex = pinecone.index('test');

const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
        pineconeIndex,
    }
)

export async function createVector(path:string):Promise<void>{

    const documents: Document[] = [];

    console.log(`LlamaParse Started on ${path}`)

    const parsedDocument = await reader.loadData(path);

    console.log(parsedDocument)

    for (const parsedDoc of parsedDocument) {
        const doc = new Document({
            pageContent: parsedDoc.text,
            metadata: {
                source:"Parsed using LlamaParse",
            }
        });
        documents.push(doc);
    }

    console.log("Storing document in Pinecone");

    await vectorStore.addDocuments(documents);

    console.log("Document stored in Pinecone");

}

createVector("../../download.pdf") //add pdf path

