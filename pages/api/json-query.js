import { OpenAI } from "langchain/llms/openai";
import { JsonToolkit, createJsonAgent } from "langchain/agents";
import { JsonSpec } from "langchain/tools";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

let toolkit;
let model;
let executor;

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

    if (firstMsg) {
      console.log("initializing chain");
      const db = await open({
        filename: "./data/database/ITACAv1.db",
        driver: sqlite3.Database,
      });

      let rows = await db.all(
        "SELECT Producto AS Product, Poliza AS Policy, Situacion AS Status, CodAgente AS Agent, NIFAsegur AS NIF, NomAsegurado AS Holder, FecEfecto AS EffectiveDate, FecVencim AS ExpirationDate, FecAnulac AS CancellationDate FROM Polizas WHERE NIFAsegur = ?",
        [nifparam],
      );

      // Add an ID property to each row
      rows = rows.map((row, index) => {
        return { id: index + 1, ...row };
      });

      toolkit = new JsonToolkit(new JsonSpec(rows));
      model = new OpenAI({
        modelName: "gpt-4-0125-preview",
        temperature: 0,
      });
      executor = createJsonAgent(model, toolkit);
    }
    const input = question;

    /* Ask it a question */
    console.log(`Executing with input "${input}"...`);
    const response = await executor.call({ input });
    console.log("Result:", response);

    return res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
