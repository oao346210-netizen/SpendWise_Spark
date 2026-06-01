# SpendWise Spark

A colorful money-learning website with a budget planner, monthly bills checklist, spending tracker, and AI budget coach.

## Real AI coach setup

The browser calls `POST /api/coach`, which keeps the OpenAI API key on the server instead of exposing it in frontend JavaScript.

Deploy this repo on a host that supports serverless functions, such as Vercel, then add these environment variables:

- `OPENAI_API_KEY`: your OpenAI API key
- `OPENAI_MODEL`: optional model override. Defaults to `gpt-5.5`.

Do not put API keys in `script.js`, `index.html`, or any public frontend file.
