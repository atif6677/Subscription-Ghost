require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { connectDB } = require("./config/database");
const errorHandler = require('./middleware/errorMiddleware');
const { initJobs } = require('./jobs/index'); // ✅ One line for all jobs

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Routes (Clean & Organized)
app.use("/", require("./routes/signupRoute"));
app.use("/", require("./routes/loginRoute"));
app.use("/password", require("./routes/passwordRoute"));
app.use("/subscriptions", require("./routes/subscriptionRoute"));

// ✅ Home & Fallback Logic (Now hidden in this file)
app.use("/", require("./routes/homeRoute"));

// Start Background Jobs
initJobs();

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`👻 Server running on http://localhost:${PORT}/login.html`));
});