import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";
import { pineconeSearch } from "../tools/pinecone_search";
import { DynamicTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SystemMessage } from "@langchain/core/messages";

dotenv.config({ path: "../../.env" });

const groqmodel = new ChatGroq({
    model:"deepseek-r1-distill-llama-70b",
    apiKey: process.env.GROQ_KEY,
    temperature: 0.3,
})

const pineconeTool = async (query:string) => {
    const pineconeSimilaritySearchResults = await pineconeSearch(query)
    return JSON.stringify(pineconeSimilaritySearchResults);
}

const tools = () => [
    new DynamicTool({
        name: "Pinecone Search",
        description: "Use this to search for information in the Pinecone index",
        func: pineconeTool,
    })
]

const executeTraditionalRAG = async (query:string) => {
    const agent = createReactAgent({
        llm: groqmodel,
        tools: tools(),
        prompt: new SystemMessage(`
            You are a PDF analyzer.You are being provided with only one tool which is the Pinecone Search tool.
            You are given a ${query} and you need to search for the most relevant information in the Pinecone index.
            And compulsorily return the answer based on the information provided by the Pinecone Search tool.
            If the information retrived from the Pinecone Search tool is not having proper relevance to the ${query},
            then you need to return "Ask question related to the provided PDF"
        `)
    })

    console.log("Agent is being executed")
    const result = await agent.invoke({ messages:query})

    console.log("")
    console.log(result)

    return result;
}

executeTraditionalRAG("what is the he interest free credit period")