import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";
import { pineconeSearch } from "../tools/pinecone_search";
import { DynamicTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AIMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config({ path: "../../.env" });

const groqmodel = new ChatGroq({
    model:"deepseek-r1-distill-llama-70b",
    apiKey: process.env.GROQ_KEY,
    temperature: 0.1,
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

const queryWriter = async (query:string) => {
    const result = await groqmodel.invoke(`
        You are a Query Writer Agent.
        You will be provided with a ${query} you need to rewrite the query with correct grammar and punctuation.
        you need to return the updated query in string format.
        You need to only return the updated query and nothing else.
    `)
    return result.content;
}



const relevanceChecker = async (query:string,result:string) => {
    const structuredRelevanceResult = await groqmodel.invoke(`
        You are a Relevance Checker Agent.
        You will be provided with a ${query} and a ${result}.
        You need to check if the ${result} is relevant to the ${query} and you need to rate the relevance of the ${result} to the ${query} on a scale of 1 to 10.
        You need to return the result with only number between 1 and 10 in string format.
    `)
    return structuredRelevanceResult.content;
}

const executeAgenticRAG = async (query:string) => {
    const queryWriterResult = await queryWriter(query)

    console.log(queryWriterResult)

    const agent = createReactAgent({
        llm: groqmodel,
        tools: tools(),
        prompt: new SystemMessage(`
            You are a PDF analyzer.You are being provided with only one tool which is the Pinecone Search tool.
            You are given a ${queryWriterResult} and you need to search for the most relevant information in the Pinecone index.
            And compulsorily return the answer based on the information provided by the Pinecone Search tool.
            If the information retrived from the Pinecone Search tool is not having proper relevance to the ${query},
            then you need to return "Ask question related to the provided PDF"
        `)
    })

    const result = await agent.invoke({ messages:query})
    const lastAIMessage = result.messages.find(msg => msg instanceof AIMessage);
    console.log(lastAIMessage?.content);

    const relevanceCheckerResult = await relevanceChecker(query,String(lastAIMessage?.content));

    console.log("Final result: ")
    console.log(result)
    console.log(relevanceCheckerResult)

    return relevanceCheckerResult
}

executeAgenticRAG("what is the interest free credit period")

