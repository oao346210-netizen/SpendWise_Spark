const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.5";

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function extractText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  return output
    .flatMap((item) => item.content || [])
    .map((part) => part.text || part.output_text || "")
    .join(" ")
    .trim();
}

function compactContext(context) {
  return {
    budget: context?.budget || {},
    bills: Array.isArray(context?.bills) ? context.bills.slice(0, 20) : [],
    expenses: Array.isArray(context?.expenses) ? context.expenses.slice(-20) : []
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, 405, { error: "Use POST for budget coach questions." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(response, 500, { error: "OPENAI_API_KEY is not configured." });
  }

  const { question, context } = request.body || {};
  const cleanQuestion = String(question || "").trim().slice(0, 500);

  if (!cleanQuestion) {
    return sendJson(response, 400, { error: "Question is required." });
  }

  try {
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
        input: [
          {
            role: "developer",
            content:
              "You are SpendWise Coach, a warm, concise budget assistant for a teen-friendly money website. Help users spend wisely using the provided budget, bills, and expenses. Do not give legal, tax, investment, or credit advice. Keep replies under 90 words, give one practical next step, and mention when a bill is due if relevant."
          },
          {
            role: "user",
            content: JSON.stringify({
              question: cleanQuestion,
              context: compactContext(context)
            })
          }
        ]
      })
    });

    const payload = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return sendJson(response, openaiResponse.status, {
        error: payload.error?.message || "OpenAI request failed."
      });
    }

    return sendJson(response, 200, {
      reply: extractText(payload) || "I could not form a reply. Try asking again with a little more detail."
    });
  } catch (error) {
    return sendJson(response, 500, {
      error: "The AI coach could not be reached right now."
    });
  }
};
