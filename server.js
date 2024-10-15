import express from "express";
import { Mistral } from "@mistralai/mistralai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 8080;

const token = process.env["TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "Mistral-large-2407";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("index");
});

function formatText(text) {
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formattedText = formattedText.replace(/(\d+)\.\s+/g, "<li>");
  formattedText =
    "<ol>" + formattedText.replace(/<li>/g, "</li><li>") + "</li></ol>";
  formattedText = formattedText.replace(/\n/g, "<br>");

  return formattedText;
}

let message = [{ role: "system", content: "You are a helpful assistant." }];

app.post("/get-response", async (req, res) => {
  const userMessage = req.body.message;

  try {
    message.push({ role: "user", content: userMessage });
    const client = new Mistral({ apiKey: token, serverURL: endpoint });
    const response = await client.chat.complete({
      model: modelName,
      messages: message,
      temperature: 1.0,
      max_tokens: 1000,
      top_p: 1.0,
    });

    let botResponse = response.choices[0].message.content;

    botResponse = formatText(botResponse);
    message.push({
      role: "assistant",
      content: `History till now: ${botResponse}`,
    });

    res.send({ message: botResponse });
  } catch (err) {
    console.error("Error getting chatbot response:", err);
    res.send({ message: "Sorry, something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
