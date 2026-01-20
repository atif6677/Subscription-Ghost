# 👻 Subscription Ghost

A smart backend application that helps users track their SaaS subscriptions (Netflix, Spotify, etc.) and sends automated email alerts before a free trial ends.

## 🚀 Key Features

* **🤖 AI-Powered Tracking:** Uses **Google Gemini AI** to automatically fetch pricing and trial details.
* **⏰ Smart Alerts:** Sends email reminders 3 days before a trial ends.
* **📰 Weekly Market Watch:** AI-generated weekly digest of subscription deals and news.
* **📊 Dashboard:** Visual breakdown of your monthly spending.
* **🔐 Secure Auth:** JWT Authentication with BCrypt password hashing.

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Atlas)
* **AI:** Google Gemini 1.5 Flash
* **Deployment:** Render (with Cron-Job.org automation)

## ⚙️ Installation

1.  **Clone & Install:**
    ```bash
    git clone <repo>
    cd Subscription-Ghost
    npm install
    ```

2.  **Environment Variables (.env):**
    ```env
    PORT=3000
    MONGO_URI=your_mongo_url
    GEMINI_API_KEY=your_gemini_key
    EMAIL_USER=your_email
    EMAIL_PASS=your_app_password
    JWT_SECRET=secure_secret
    CRON_SECRET=secure_cron_key
    ```

3.  **Run:**
    ```bash
    npm run dev
    ```