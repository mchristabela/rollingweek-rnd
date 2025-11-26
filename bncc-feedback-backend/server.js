const express = require("express");
const cors = require("cors");
const feedbackRoutes = require("./routes/feedback");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/feedback", feedbackRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
