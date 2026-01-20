require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { connectDB } = require("./config/database");
const errorHandler = require('./middleware/errorMiddleware');

// Job Imports
const { startCronJob } = require('./jobs/cronJob');
const { startNewsCron } = require('./jobs/newsCron'); 
const startWeeklyReport = require('./jobs/weeklyReport');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, "../public")));

// ✅ FIX: Explicitly serve home.html
app.get('/home.html', (req, res) => {
    const filePath = path.join(__dirname, '../public/home.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("❌ Error serving home.html:", err);
            res.status(404).send(`Error: Could not find home.html at ${filePath}`);
        }
    });
});

// Routes
app.use("/", require("./routes/signupRoute"));
app.use("/", require("./routes/loginRoute"));
app.use("/password", require("./routes/passwordRoute"));
app.use("/subscriptions", require("./routes/subscriptionRoute"));

// 🛡️ FALLBACK ROUTE
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Start Background Jobs
startCronJob();
// startWeeklyReport(); 
startNewsCron();

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`👻 Server running on http://localhost:${PORT}/login.html`));
}).catch(err => {
    console.error("❌ Database Connection Failed:", err.message);
});