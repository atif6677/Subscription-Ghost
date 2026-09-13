const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-3.5-flash-lite";

exports.fetchSubscriptionDetails = async (serviceName) => {
  try {
    const prompt = `
You are a subscription assistant for India.

Identify this subscription service:

"${serviceName}"

Return:
1. Correct official name.
2. Monthly individual subscription price in INR.
3. Free trial duration in days.
4. Official website URL.
5. Category.

Rules:
- Fix spelling mistakes.
- If there is no free trial, return 0.
- Give the normal individual monthly price.
- If you do not know the price, return 0.
- Category must be one of:
  Entertainment, Productivity, Shopping, Utility, Other.

Return JSON only.
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,

          properties: {
            name: {
              type: Type.STRING,
            },

            price: {
              type: Type.NUMBER,
            },

            trialDays: {
              type: Type.NUMBER,
            },

            serviceLink: {
              type: Type.STRING,
            },

            category: {
              type: Type.STRING,
              enum: [
                "Entertainment",
                "Productivity",
                "Shopping",
                "Utility",
                "Other",
              ],
            },
          },

          required: [
            "name",
            "price",
            "trialDays",
            "serviceLink",
            "category",
          ],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Price Error:", error);

    return {
      name: serviceName,
      price: 0,
      trialDays: 0,
      serviceLink: "",
      category: "Other",
    };
  }
};

exports.fetchMarketNews = async () => {
  try {
    const prompt = `
Generate 5 subscription-related news updates for India.

Include services such as:
Netflix, Spotify, YouTube, Amazon Prime, Microsoft 365, Adobe.

Rules:
- Return raw HTML only.
- Do not use Markdown.
- Do not use emojis.
- Return exactly 5 items.

Structure:

<div class="news-item">
  <div class="news-header">TITLE HERE</div>
  <div class="news-body">Short description here.</div>
</div>
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (error) {
    console.error("AI News Error:", error);

    return "<p>News temporarily unavailable.</p>";
  }
};