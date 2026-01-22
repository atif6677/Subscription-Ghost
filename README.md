# 👻 Subscription Ghost

A smart financial firewall that helps users track their SaaS subscriptions (Netflix, Spotify, etc.) and sends automated email alerts before a free trial ends so you never overpay.

## 🚀 Key Features

* **🤖 AI-Powered Discovery:** Uses **Google Gemini AI** to automatically fetch real-time pricing and trial durations for any service.
* **⏰ Smart Trial Protection:** Sends email alerts (via **Brevo**) 3 days before a free trial converts to a paid plan.
* **📊 Deep Analytics:** Dedicated **Bills Page** with a doughnut chart breakdown of expenses and monthly spending history.
* **📰 Market Watch:** AI-curated weekly news digest of the latest subscription price hikes and deals.
* **🔐 Secure Architecture:** JWT Authentication, BCrypt hashing, and Environment Variable protection.

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Atlas)
* **AI Engine:** Google Gemini 1.5 Flash
* **Email Service:** Brevo (formerly Sendinblue)
* **Frontend:** HTML5, CSS3, Vanilla JS (Multi-Page Architecture)

## ⚙️ Installation

1.  **Clone & Install:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/Subscription-Ghost.git](https://github.com/YOUR_USERNAME/Subscription-Ghost.git)
    cd Subscription-Ghost
    npm install
    ```

2.  **Environment Variables (.env):**
    Create a `.env` file in the root directory and add:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_google_gemini_key
    BREVO_API_KEY=your_brevo_api_key
    EMAIL_USER=your_sender_email@example.com
    JWT_SECRET=your_secure_random_string
    ```

3.  **Run Locally:**
    ```bash
    npm start
    ```