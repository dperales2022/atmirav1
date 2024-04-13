import { PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export default async function handler(req, res) {
  if (req.method === "POST") {
    let { filejson, nifparam } = req.body;

    if (!nifparam) {
      nifparam = "Z00000300"; // Set the 'nifparam' variable to 'Z00000300' if it doesn't exist in the request body
    }

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    const namespace = nifparam;

    // Delete previous information
    await pineconeIndex._delete({
      deleteRequest: {
        filter: {
          NIF: { $eq: nifparam },
          Type: "PolicyJSON",
        },
      },
    });

    // Create a new Document object for each row
    const docs = filejson.map((row) => {
      const metadata = {
        NIF: `${row.NIF}`,
        Policy: `${row.Policy}`,
        Type: "PolicyJSON",
      };

      const pageContent =
        `NIF: ${row.NIF} Policy: ${row.Policy} ` +
        Object.entries(row)
          .filter(([key]) => key !== "NIF" && key !== "Policy")
          .map(([key, value]) => `${key}: ${value}`)
          .join(" ");

      return new Document({
        metadata,
        pageContent,
      });
    });

    await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex,
      namespace,
    });
    console.log(docs);
    console.log("Successfully uploaded to DB");
    // Modify output as needed
    return res.status(200).json({
      result: `Uploaded info to Pinecone! `,
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
