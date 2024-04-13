import { PineconeClient } from "@pinecone-database/pinecone";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PlanAndExecuteAgentExecutor } from "langchain/experimental/plan_and_execute";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { SerpAPI, ChainTool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { MessagesPlaceholder } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { JsonToolkit, createJsonAgent } from "langchain/agents";
import { JsonSpec, JsonObject } from "langchain/tools";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";

const exampleData = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  address: {
    city: "New York",
    state: "NY",
    zip: "10001",
  },
};

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Grab the user prompt
    let { question, nifparam, firstMsg } = req.body;

    if (!question) {
      throw new Error("No input");
    }

    if (!nifparam) {
      nifparam = "Z00000300"; // Set the 'nifparam' variable to 'Z00000300' if it doesn't exist in the request body
    }

    console.log("input received:", question);

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    const namespace = nifparam;

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex, namespace, filter: { NIF: { $eq: nifparam } } },
    );

    /* Part Two: Use as part of a chain (currently no metadata filters) */
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: "gpt-4-0125-preview",
      verbose: true,
    });
    const chainpdf = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 1,
      returnSourceDocuments: false,
    });

    const qaTool = new ChainTool({
      name: "pdf-qa",
      description:
        "useful for when you need to answer questions about documents, clauses, general conditions, coverages. Input should be in the form of a question containing full context",
      chain: chainpdf,
      returnDirect: true,
    });

    const toolkit = new JsonToolkit(new JsonSpec(exampleData));
    const chainjson = createJsonAgent(model, toolkit);
    const jsonTool = new ChainTool({
      name: "json-qa",
      description:
        "useful when to answer questions about an policies, claims, or other structured data. Input should be in the form of a question containing full context",
      chain: chainjson,
      returnDirect: true,
    });

    const datasource = new DataSource({
      type: "sqlite",
      database: "./data/database/ITACAv1.db",
    });
    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: datasource,
    });
    const dbtoolkit = new SqlToolkit(db, model);
    const chaindb = createSqlAgent(model, dbtoolkit);
    const dbTool = new ChainTool({
      name: "db-qa",
      description:
        "useful when to answer questions about an policies, claims, or other structured data. Input should be in the form of a question containing full context",
      chain: chaindb,
      returnDirect: true,
    });

    //Create the tools
    const tools = [
      new SerpAPI(),
      new Calculator(),
      qaTool,
      dbTool,
      //jsonTool,
    ];

    //Execute the agent
    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "zero-shot-react-description",
      returnIntermediateSteps: false,
      maxIterations: 3,
      return_only_output: true,
      returnIntermediateSteps: false,
      returnSourceDocuments: false,
      memory: new BufferMemory({
        memoryKey: "chat_history",
        returnMessages: true,
      }),
      agentArgs: {
        inputVariables: ["input", "agent_scratchpad", "chat_history"],
        memoryPrompts: [new MessagesPlaceholder("chat_history")],
      },
    });

    const input = question;
    const response = await executor.call({ input });

    return res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
