# GitHub Actions CI/CD Pipeline

## 🚀 Workflow Overview

The CI/CD pipeline runs on every push to `main` branch and includes:

### 1. **Frontend CI** (`frontend-ci`)
- ✅ TypeScript type checking (`tsc --noEmit`)
- ✅ ESLint linting (with max-warnings 0)
- ✅ Frontend build (`npm run build`)
- 📦 Uploads build artifacts

### 2. **Backend CI** (`backend-ci`)
- ✅ TypeScript type checking
- ✅ Prisma client generation
- ✅ Database migrations (with PostgreSQL service)
- ✅ Tests (placeholder)

### 3. **Docker Build Test** (`docker-build`)
- ✅ Builds frontend Docker image
- ✅ Builds backend Docker image
- ✅ Tests frontend container (health check)
- ✅ Tests backend container with PostgreSQL

### 4. **Deploy to Portainer** (`deploy`)
- ✅ Triggers Portainer stack redeploy via API
- ✅ Waits for deployment to complete
- ✅ Health checks the deployed application

## 🔐 Required GitHub Secrets

Add these secrets in GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `PORTAINER_API_KEY` | Portainer API key for stack redeploy | `ptr_xxxxx...` |
| `PORTAINER_WEBHOOK_URL` | (Optional) Legacy webhook URL | `https://cont.asb.web.tr/api/webhooks/...` |

## 🚀 How It Works

1. **Push to main** → Triggers workflow
2. **CI jobs run in parallel** (frontend-ci, backend-ci)
3. **Docker build test** runs after CI passes
4. **Deploy** runs only if all CI jobs pass
5. **Health check** verifies deployment

## 📊 Workflow Status Badges

Add to README.md:
```markdown
![CI/CD](https://github.com/asbajans/CR/workflows/CRDent%20CI%2FCD/badge.svg)
```

## 🔧 Local Development

Run CI checks locally before pushing:

```bash
# Frontend
cd frontend
npm run lint
npm run typecheck
npm run build

# Backend
cd backend
npm run lint
npx tsc --noEmit
```

## 📋 Workflow Triggers

| Event | Branch | Jobs |
|-------|--------|------|
| Push | main | All (CI + Deploy) |
| Pull Request | main | CI only (no deploy) |

## 🔍 Debugging Failed Builds

1. Check **Actions** tab in GitHub
2. Click failed job → View logs
3. Common issues:
   - TypeScript errors → Run `npm run typecheck` locally
   - ESLint errors → Run `npm run lint` locally
   - Build failures → Run `npm run build` locally
   - Docker build → Check Dockerfile syntax

## 📈 Benefits

- ✅ **Catch errors early** - Before deployment
- ✅ **Automated testing** - Every push
- ✅ **Docker validation** - Catches build issues
- ✅ **Health checks** - Verifies deployment
- ✅ **Zero-downtime deploy** - Rolling updates via Portainer