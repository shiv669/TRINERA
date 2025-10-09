# Trinera Pest Detection - FastAPI Backend

A secure, production-ready FastAPI backend for pest detection using Hugging Face models.

## 🚀 Features

- **Pest Detection**: Upload images to detect and identify agricultural pests
- **Hugging Face Integration**: Uses the `S1-1IVAM/trinera-pest-detector` model
- **Multilingual Support**: Responses in English and Hindi
- **Comprehensive Pest Database**: Detailed information about common pests
- **Security**: CORS protection, file validation, API key management
- **Testing**: Unit and integration tests included
- **Production Ready**: Error handling, logging, and monitoring

## 📋 Prerequisites

- Python 3.8 or higher
- Hugging Face account and API token
- pip (Python package manager)

## 🛠️ Installation

### 1. Navigate to the backend directory

```powershell
cd backend
```

### 2. Create a virtual environment (recommended)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure environment variables

Copy the `.env.example` file to `.env`:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and add your Hugging Face token:

```env
HF_TOKEN=your_actual_hugging_face_token_here
```

**Get your Hugging Face token:**
1. Go to https://huggingface.co/settings/tokens
2. Create a new token or copy an existing one
3. Paste it in the `.env` file

## 🚀 Running the Server

### Development Mode

```powershell
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:

```powershell
python app/main.py
```

### Production Mode

```powershell
$env:ENVIRONMENT="production"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc (Alternative docs)

## 📚 API Endpoints

### Health Check
```http
GET /health
```

### Detect Pest
```http
POST /api/detect-pest
Content-Type: multipart/form-data

Parameters:
- file: Image file (JPEG, PNG, WebP)
- language: "english" or "hindi" (optional, default: "english")
```

### Model Status
```http
GET /api/model-status
```

## 🧪 Testing

Run the test suite:

```powershell
pytest
```

Run with coverage:

```powershell
pytest --cov=app tests/
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── models.py            # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   └── huggingface.py   # HF API integration
│   ├── routes/
│   │   ├── __init__.py
│   │   └── pest_detection.py # API routes
│   └── utils/
│       ├── __init__.py
│       ├── pest_info.py     # Pest database
│       └── validators.py    # Input validation
├── tests/
│   ├── __init__.py
│   └── test_pest_detection.py
├── requirements.txt
├── .env.example
└── README.md
```

## 🔒 Security

- **CORS**: Configured to allow specific origins
- **File Validation**: Size and type checking
- **API Keys**: Secure token management via environment variables
- **Input Sanitization**: Filename and content validation
- **Error Handling**: Safe error messages without exposing internals

## 🌐 Frontend Integration

The frontend (Next.js) should send POST requests to `/api/detect-pest`:

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('language', 'english'); // or 'hindi'

const response = await fetch('http://localhost:8000/api/detect-pest', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

## 🐛 Troubleshooting

### "HF_TOKEN is not set" error
- Make sure you've created a `.env` file
- Add your Hugging Face token to the `.env` file
- Restart the server

### "Model is currently loading" error
- The Hugging Face model needs time to load (first request)
- Wait 20-30 seconds and try again
- Subsequent requests will be faster

### CORS errors
- Check that your frontend URL is in `CORS_ORIGINS` in `.env`
- Default allows `http://localhost:3000` and `http://localhost:3001`

### File upload errors
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, WebP
- Check file is a valid image

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HF_TOKEN` | Hugging Face API token | **Required** |
| `HF_MODEL_ID` | Hugging Face model ID | `S1-1IVAM/trinera-pest-detector` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000,http://localhost:3001` |
| `PORT` | Server port | `8000` |
| `HOST` | Server host | `0.0.0.0` |
| `ENVIRONMENT` | Environment (development/production) | `development` |

## 🚀 Deployment

### Deploy to Railway

1. Install Railway CLI
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables in Railway dashboard
5. Deploy: `railway up`

### Deploy to Render

1. Create a new Web Service
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

## 📄 License

This project is part of the Trinera Pest Detection System.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues or questions, please create an issue in the repository.
