# HealthifyAI — Food Product Analyzer

> **ML Engineers:** The LLM finetuning, dataset preparation, and model training code lives here →  
> **[github.com/adarshkatare6/HeathifyAI-ML](https://github.com/adarshkatare6/HeathifyAI-ML)**

---

## What is HealthifyAI?

HealthifyAI is a full stack web application where users upload an image of a food ingrediants, the system extracts text via OCR and returns a simple, clear health review powered by a finetuned LLM — all behind a secure JWT-authenticated REST API.

---

## Live Demo

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | *[https://healthify-ai-zeta.vercel.app/](https://healthify-ai-zeta.vercel.app/)* |
| Auth + API Server | Render |
| ML Inference API | HuggingFace + ngrok |
| Model | HuggingFace Hub | [adarsh6/healthifyai-base-lora-merged](https://huggingface.co/adarsh6/healthifyai-base-lora-merged) |

---

## Architecture

```
User visits Vercel (React frontend)
        ↓
Login / Register page
        ↓
POST /login or /register → Render Auth Server
        ↓
Flask verifies credentials against MongoDB Atlas
        ↓
Returns JWT token (24hr expiry) to React
        ↓
React stores token in memory (not localStorage)
        ↓
User uploads image → React converts to base64
        ↓
POST /predict + Authorization: Bearer <token> → Render
        ↓
Render validates JWT → forwards image to Colab via ngrok
        ↓
Colab: OCR (Tesseract) → text cleaning → LLM inference
        ↓
Response returned → Render → React → displayed to user
```

---

## Project Structure

```
HealthifyAI/
├── frontend/                  → Deployed on Vercel
│   ├── src/
│   │   ├── App.jsx            → Main app, token state, conditional routing
│   │   ├── Login.jsx          → Login page with cold-start spinner
│   │   ├── Register.jsx       → Register page
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example           
│
└── backend/                   → Deployed on Render
    ├── app.py                 → Flask auth + proxy server
    ├── requirements.txt
    └── render.yaml
```

---

---

## Security

- Passwords hashed with **bcrypt** before storing in MongoDB — never stored in plaintext
- **JWT** used for stateless authentication with 24-hour expiry
- Colab ngrok URL is **only known to Render** — never exposed to frontend
- JWT validated on every `/predict` call as a backend security layer
- Token stored in **React state (memory)**, not localStorage — eliminates XSS-based token theft
- `401 Unauthorized` response automatically clears token and redirects to login
- All sensitive config (MONGO_URI, JWT_SECRET, COLAB_URL) stored as **environment variables** — never hardcoded

---

---

## How to Run Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
export MONGO_URI=your_mongo_uri
export JWT_SECRET=your_secret
export COLAB_URL
python app.py
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Set VITE_AUTH_SERVER_URL=http://localhost:5000
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Starting the ML Inference Backend (Colab)

> Do this before testing predictions.

1. Open the Colab notebook from the [ML repo](https://github.com/adarshkatare6/HeathifyAI-ML)
2. Runtime → Change runtime type → **T4 GPU**
3. Runtime → **Run All**
4. Connect to ngrok
5. Wait ~3-4 minutes for model to load
6. Backend is live 

---

## ML Side of the Project

All model training code, dataset preparation, LoRA finetuning, and evaluation is in a separate repo:

**[github.com/adarshkatare6/HeathifyAI-ML](https://github.com/adarshkatare6/HeathifyAI-ML)**

- Base model: Mistral-7B-v0.3
- Finetuning: LoRA (merged into base)
- Quantization: 4-bit (nf4, double quant, float16 compute) for T4 VRAM
- Hosted on HuggingFace: [adarsh6/healthifyai-base-lora-merged](https://huggingface.co/adarsh6/healthifyai-base-lora-merged)
