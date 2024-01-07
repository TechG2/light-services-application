const express = require("express");
const app = express();
const { connect, Schema, model } = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT;

// MongoDB
connect(process.env.MONGODB_URI);
const DocumentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});
const documentsCollection = new model("documents", DocumentSchema);

// Express
app.use(express.json());

// API
app.get("/api/document", async (req, res) => {
  const documents = await documentsCollection.find();
  res.status(200).json(documents);
});
app.get("/api/document/:id", async (req, res) => {
  const document = await documentsCollection.findOne({ name: req.params.id });
  if (!document)
    return res
      .status(404)
      .json({ code: 404, message: "No document found with that id/ name." });

  return res.status(200).json(document);
});

app.post("/api/document", async (req, res) => {
  if (!req.body.content || !req.body.name)
    return res.status(422).json({ code: 422, message: "Missing field(s)." });

  const documents = await documentsCollection.find();
  if (documents.find((document) => document.name === req.body.name))
    return res.status(403).json({
      code: 403,
      message: "The name of each document must be unique.",
    });

  const data = new documentsCollection({
    name: req.body.name,
    content: req.body.content,
  });
  documents.push(data);
  data.save();

  return res.status(200).json({ addedDocument: data, documents });
});

app.patch("/api/document/:id", async (req, res) => {
  if (req.body.content)
    await documentsCollection.updateOne(
      { name: req.params.id },
      { content: req.body.content }
    );
  const updatedDocument = await documentsCollection.findOne({
    name: req.params.id,
  });
  if (!updatedDocument)
    return res
      .status(404)
      .json({ code: 404, message: "No document found with that id/ name." });

  const documents = await documentsCollection.find();

  return res.status(200).json({ updatedDocument, documents });
});

app.delete("/api/document/:id", async (req, res) => {
  const deletedDocument = await documentsCollection.findOne({
    name: req.params.id,
  });
  if (!deletedDocument)
    return res
      .status(404)
      .json({ code: 404, message: "No document found with that id/ name." });

  await documentsCollection.deleteOne({ name: req.params.id });
  const documents = await documentsCollection.find();

  return res.status(200).json({ deletedDocument, documents });
});

// Start server
app.listen(PORT, () => console.log(`Running on port ${PORT}.`));
