require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/database");
const errorHandler = require('./middleware/errorMiddleware');
const { initJobs } = require('./jobs/index'); 

const app = express();

// This tells Express to trust the proxy (Render) so rateLimit works correctly
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false, 
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// 3. Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/", require("./routes/signupRoute"));
app.use("/", require("./routes/loginRoute"));
app.use("/password", require("./routes/passwordRoute"));
app.use("/subscriptions", require("./routes/subscriptionRoute"));

// Home & Fallback Logic
app.use("/", require("./routes/homeRoute"));

// Start Background Jobs
initJobs();

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`👻 Server running on http://localhost:${PORT}/login.html`));
});