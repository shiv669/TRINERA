# 🌱 Trinera – AI-Driven Pest Detection & Prevention System  
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)  
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi&logoColor=white)  
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?logo=next.js&logoColor=white)  
![License](https://img.shields.io/badge/License-MIT-yellow?logo=open-source-initiative&logoColor=white)  
![Contributions](https://img.shields.io/badge/Contributions-Welcome-orange?logo=github)  
![Status](https://img.shields.io/badge/Status-Active-success)  

Trinera is an **AI-powered real-time pest detection system** for farmers and agricultural experts. It processes **live video from mobile devices or drones** to identify harmful pests early and provides **eco-friendly, localized solutions** via **voice feedback** in the farmer’s language.

---

## 📌 Problem Statement
Farmers often fail to detect harmful pests early, especially across large fields or in remote areas, leading to severe crop damage and reduced yields.  

**Current methods:**  
❌ Slow and require manual inspection  
❌ Depend on expert intervention  
❌ Rely heavily on chemical pesticides  

**✅ Trinera** solves this by enabling **instant pest detection and actionable eco-friendly advice** directly from a farmer’s device.

---

## 🚀 Features
✨ **Real-time Pest Detection** – YOLOv5s custom-trained for agriculture  
📱 **Multi-device Support** – mobile cameras, drones, or uploaded images  
🗣️ **Voice Advice in Local Languages** – TTS (Coqui / Google Cloud)  
🌱 **Eco-friendly Recommendations** for pest control  
⚡ **Low-Latency Architecture** for instant responses  
📡 **Backend-Driven Scalability** for multiple farmers at once  

---

## 🏛️ High-Level Design (HLD)
flowchart LR  
    A[Farmer's Device] -->|Live Video / Images| B[YOLOv5s Detection]  
    B -->|Pest JSON| C[LLM Advice Engine]  
    C -->|Localized Text| D[TTS Engine]  
    D -->|Audio File| E[Farmer Hears Advice]  

**🔹 Components**  
**1. Frontend (Next.js)**  
- Captures live video or drone feed  
- Sends frames to backend  
- Plays voice advice and shows pest details  

**2. Backend (FastAPI)**  
- `/detect` – Runs YOLOv5s inference  
- `/advice` – Passes detection results to LLM for advice generation  
- `/tts` – Converts advice to speech in local language  

**3. Models**  
- YOLOv5s – Object detection  
- LLM – Mistral / Phi-3 (fine-tuned for agriculture)  
- TTS – Coqui TTS or Google TTS  

---

## 🔍 Low-Level Design (LLD)
**Flow:**  
1️⃣ **Frontend (Next.js)**  
- Capture video → send frames to `/detect`  
- Display pest info & stream audio from `/tts`  

2️⃣ **Backend (FastAPI)**  
- YOLOv5s detects pests from frames  
- Generates JSON:

{ "pest_name": "aphid", "confidence": 0.94, "crop_type": "cotton", "location": "Nashik, Maharashtra" }

- LLM creates contextual advice  
- TTS converts text to MP3/WAV and streams to frontend  

---

## ⚙️ Tech Stack
**🎨 Frontend** – Next.js, TailwindCSS, WebRTC / MediaRecorder API  
**🖥️ Backend** – FastAPI, PyTorch (YOLOv5s), Ollama / Local LLM, Coqui TTS / Google Cloud TTS  
**☁️ Infrastructure** – GPU-enabled server (AWS, RunPod, Hetzner), CDN caching  

---


## 🖥️ Installation & Setup
**1️⃣ Clone the Repo**

git clone https://github.com/shiv669/trinera.git 
cd trinera

**2️⃣ Backend Setup (FastAPI)**

cd backend 
python -m venv venv source venv/bin/activate   
# On Windows: venv\Scripts\activate 
pip install -r requirements.txt

Run backend

uvicorn main:app --reload

**3️⃣ Frontend Setup (Next.js)**

cd frontend npm install npm run dev

---

## 🛠️ API Endpoints
| Method | Endpoint  | Description                    |
|--------|-----------|-------------                   |
| POST   | /detect   | Runs YOLOv5s on input frame(s) |
| POST   | /advice   | Generates pest control advice  |
| POST   | /tts      | Converts advice to speech      |

---

## 🚀 Deployment Plan
- **Backend:** Deploy FastAPI on GPU-enabled server (AWS EC2, RunPod)  
- **Frontend:** Host on Vercel / Netlify  
- **Models:** Store in S3/GCS and load on startup  
- **Caching:** Cache TTS outputs for repeated advice to save cost & latency  

---

## 📊 Future Improvements
🚁 Drone integration for large-scale scanning  
🌦️ Predictive pest outbreak warnings via weather data  
📜 Farmer history tracking & personalized recommendations  
📴 Full offline mode for low-connectivity regions  

---

## 🏆 Contributors
👤 **Shivam Gawali** – Founder & AI Engineer  
🤝 Open to collaborators!  

---

## 📜 License
MIT License – Free to use and modify.

