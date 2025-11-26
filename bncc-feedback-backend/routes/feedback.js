const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data.json");

function readData() {
  const raw = fs.readFileSync(dataPath);
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

router.post("/", (req, res) => {
  const feedback = req.body;
  feedback.id = Date.now().toString(); 
  feedback.createdAt = new Date().toISOString();
  feedback.status = "open";

  const data = readData();
  data.push(feedback);
  writeData(data);

  res.status(201).json({ message: "Feedback created", feedback });
});

router.get("/", (req, res) => {
  const data = readData();
  res.json(data);
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const data = readData();
  const index = data.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Not found" });
  }

  data[index] = { ...data[index], ...updates };
  writeData(data);

  res.json({ message: "Updated", feedback: data[index] });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  let data = readData();
  const newData = data.filter(item => item.id !== id);

  writeData(newData);

  res.json({ message: "Deleted" });
});

module.exports = router;
