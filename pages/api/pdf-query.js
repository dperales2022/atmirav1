import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";

const CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT = `Given the following conversation and a follow up question, return the conversation history excerpt that includes any relevant context to the question if it exists and rephrase the follow up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Your answer should follow the following format:
\`\`\`
Use the following pieces of context to answer the users question. First of all look at the documents uploaded at the vector store and after that look at the chat history and see if there is any relevant context to the question. If there is, then rephrase the question to be a standalone question.
Always answer in Spanish. If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
<Relevant chat history excerpt as context here>
Standalone question: <Rephrased question here>
\`\`\`
Your answer:`;

let fasterModel;
let slowerModel;
let chain;

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

    const pinecone = new Pinecone();

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    const namespace = nifparam;
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex, namespace, filter: { NIF: { $eq: nifparam } } },
    );

    fasterModel = new ChatOpenAI({
      modelName: "gpt-4-0125-preview",
      temperature: 0,
    });
    slowerModel = new ChatOpenAI({
      modelName: "gpt-4-0125-preview",
      temperature: 0,
    });

    chain = ConversationalRetrievalQAChain.fromLLM(
      slowerModel,
      vectorStore.asRetriever(),
      {
        returnSourceDocuments: true,
        memory: new BufferMemory({
          memoryKey: "chat_history",
          inputKey: "question", // The key for the input to the chain
          outputKey: "text", // The key for the final conversational output of the chain
          returnMessages: true,
        }),
        questionGeneratorChainOptions: {
          llm: fasterModel,
          //template: CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT,
        },
      },
    );
    const response = await chain.call({ question });
    console.log(response);

    return res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
