# 🚀 DEPLOYMENT CHECKLIST

## ✅ Pre-Deployment (COMPLETED)

- [x] Fix all TypeScript errors in frontend
- [x] Add missing Python dependencies
- [x] Create railway.toml configuration
- [x] Verify /health endpoint exists in backend
- [x] Update requirements.txt with all dependencies
- [x] Push all changes to GitHub
- [x] Verify .gitignore files are secure

## 📦 Railway Backend Deployment

### Step 1: Connect Repository
1. Go to https://railway.app/
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `shiv669/TRINERA`
5. Railway will auto-detect Python

### Step 2: Configure Environment
Set these environment variables in Railway:
```
ENVIRONMENT=production
OLLAMA_BASE_URL=your_ollama_url_or_use_groq
GROQ_API_KEY=your_groq_api_key
HF_MODEL_ID=S1-1IVAM/trinera-pest-detector
OLLAMA_MODEL=llama3.2-vision
CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

### Step 3: Verify Deployment
- Railway will automatically build using `railway.toml`
- Health check will verify `/health` endpoint
- Backend will be available at: `https://your-app.railway.app`
- Check logs for: "✓ Configuration validated successfully"

## 🌐 Vercel Frontend Deployment

### Step 1: Connect Repository
1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js

### Step 2: Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./` (keep default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### Step 3: Set Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

### Step 4: Deploy
- Click "Deploy"
- Vercel will build and deploy automatically
- Frontend will be available at: `https://your-project.vercel.app`

## 🔄 Update Railway CORS

After Vercel deployment, update Railway environment:
```
CORS_ORIGINS=https://your-project.vercel.app,http://localhost:3000
```

Click "Redeploy" in Railway to apply changes.

## ✅ Post-Deployment Verification

### Test Backend (Railway)
```bash
# Health check
curl https://your-app.railway.app/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00",
  "version": "1.0.0",
  "model_id": "S1-1IVAM/trinera-pest-detector"
}
```

### Test Frontend (Vercel)
1. Visit `https://your-project.vercel.app`
2. Test homepage loads
3. Navigate to `/interbot`
4. Test chat functionality
5. Navigate to `/interbot/live`
6. Test camera/mic permissions
7. Verify WebSocket connection (check browser console)

### Test Full Integration
1. Open browser console on Vercel frontend
2. Look for: `🌐 Connecting to WebSocket: wss://your-app.railway.app/ws/live/...`
3. Should see: `✅ WebSocket connected successfully`
4. Test voice input → Should get AI response
5. Upload image → Should get analysis

## 🐛 Troubleshooting

### Railway Health Check Failing
- Check `/health` endpoint returns 200 OK
- Verify `PORT` environment variable is used
- Check logs: "1/1 replicas never became healthy!" means health check timeout

### Vercel Build Failing
- Check for TypeScript errors in build logs
- Verify all dependencies in `package.json`
- Check environment variables are set

### WebSocket Connection Issues
- Verify Railway backend is running (check health endpoint)
- Check CORS_ORIGINS includes your Vercel domain
- Ensure Railway URL is set in Vercel env vars

### No AI Responses
- Check Groq API key is valid
- Verify OLLAMA_BASE_URL is accessible (or use Groq)
- Check Railway logs for errors

## 📊 Monitoring

### Railway
- Check Metrics tab for CPU/Memory usage
- Monitor Deployment logs
- Set up alerts for failures

### Vercel
- Check Analytics tab
- Monitor Function logs
- Check build times

## 💰 Cost Optimization

### Railway
- Free tier: $5 credit/month
- Should be enough for development
- Upgrade if needed

### Vercel
- Hobby plan: Free
- Unlimited deployments
- 100GB bandwidth

## 🔐 Security Checklist

- [x] API keys in environment variables only
- [x] .env files in .gitignore
- [x] CORS properly configured
- [x] No secrets in code
- [x] Production docs disabled (/docs, /redoc)

## 📝 Next Steps (Optional)

1. **Deploy IP102 Model**
   - See `backend/README.md` → "IP102 Pest Detection Setup"
   - Deploy to HuggingFace Spaces
   - Update `HF_MODEL_ID` in Railway

2. **Enable Quick Vision**
   - Deploy DETR model
   - Update `USE_QUICK_VISION=true` in Railway
   - Faster pest detection response

3. **Custom Domain**
   - Add custom domain in Vercel
   - Update CORS in Railway
   - Configure DNS

4. **Database Integration**
   - Add PostgreSQL in Railway
   - Store user sessions
   - Track pest detections

## 🎉 Success Indicators

✅ Railway shows "Deployment successful"
✅ Health check passes
✅ Vercel deployment shows green checkmark
✅ Frontend loads without errors
✅ WebSocket connects successfully
✅ Can send messages and get AI responses
✅ Camera/mic work in live mode
✅ Pest detection returns results

---

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app/
- Vercel Docs: https://vercel.com/docs
- Check GitHub Issues
- Review backend logs in Railway
- Check browser console for frontend errors
