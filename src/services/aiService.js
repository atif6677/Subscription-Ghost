const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using stable model alias
const MODEL_NAME = "gemini-flash-latest"; 

const fetchSubscriptionDetails = async (serviceName) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
      You are a pricing expert for Indian SaaS services. 
      Task: Identify the correct official name (fix typos) and find the current "Standard Individual Monthly Subscription Price" (in INR) and "Free Trial Duration" (in days) for the service: "${serviceName}" in India.
      
      CRITICAL RULES:
      1. Correct the name (e.g. "netflx" -> "Netflix", "hotstar" -> "Disney+ Hotstar").
      2. If NO free trial (Netflix, Hotstar), return 0.
      3. Price: Monthly individual plan.
      4. Output JSON only: {"name": "Corrected Name", "price": Number, "trialDays": Number}
    `;

    const result = await model.generateContent(prompt);
    let cleanText = result.response.text()
        .replace(/\`\`\`json/g, '')
        .replace(/\`\`\`/g, '')
        .trim();
        
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Price Error:", error);
    // Fallback: return original name if AI fails
    return { name: serviceName, price: 0, trialDays: 0 };
  }
};

const fetchMarketNews = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
      Generate 3 important subscription news updates for India (Netflix, Spotify, YouTube, etc).
      
      OUTPUT FORMAT RULES:
      1. Return raw HTML only.
      2. Do NOT use Markdown (no **, no ---, no #).
      3. Do NOT use Emojis.
      4. Structure exactly like this for each item:
         <div class="news-item">
            <div class="news-header">TITLE HERE</div>
            <div class="news-body">Short description here (max 2 sentences).</div>
         </div>
      
      5. No introductory text. Just the 3 divs.
    `;
    
    const result = await model.generateContent(prompt);
    let cleanText = result.response.text()
        .replace(/\`\`\`html/g, '')
        .replace(/\`\`\`/g, '')
        .trim();

    return cleanText;
  } catch (error) {
    console.error("AI News Error:", error);
    return "<p>News temporarily unavailable.</p>";
  }
};

module.exports = { fetchSubscriptionDetails, fetchMarketNews };