import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import * as dotenv from "dotenv";
import { CohereRerank } from "@langchain/cohere";

dotenv.config({path:"../../.env"})

const pinecone = new PineconeClient({apiKey: process.env.PINECONE_API_KEY!});

const pineconeIndex = pinecone.index('test');

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    model: 'text-embedding-3-small',
});

const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
        pineconeIndex,
    }
)

export async function pineconeSearch(query:string):Promise<string>{

    // console.log("Performing Pinecone Cosine Similarity Search")

    const pineconeSimilaritySearch = await vectorStore.similaritySearch(query,5);

    // console.log(pineconeSimilaritySearch)

    // console.log("Performing Cohere Rerank")

    const cohereRerank = new CohereRerank({
        apiKey: process.env.COHERE_API_KEY,
        model: "rerank-english-v3.0",
    });

    const rerankedDocuments = await cohereRerank.rerank(
        pineconeSimilaritySearch.map(doc => doc.pageContent),
        query,
        {
            topN: 2,
        }
    );

    rerankedDocuments.forEach((doc, index) => {
        // console.log(`\nReranked Document ${index + 1}:`);
        // console.log('Content:', pineconeSimilaritySearch[doc.index]?.pageContent);
        // console.log('Relevance Score:', doc.relevanceScore);
    });

    const formattedResults = rerankedDocuments.map(doc => ({
        content:pineconeSimilaritySearch[doc.index]?.pageContent,
    }))

    // console.log(formattedResults)

    return formattedResults.map(doc => doc.content).join("\n");
}


pineconeSearch("Give me the schedule of charges")