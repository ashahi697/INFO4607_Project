## Running the Project (Frontend + Backend)

This repo has:
- `apps/frontend` (TypeScript/Node)
- `apps/backend` (Python/FastAPI) using a Conda environment

### Prerequisites
- Node.js (for frontend)
- Miniconda or Anaconda (for backend)

### Create .env file in backend
``` bash
SUPABASE_URL=https://nhurxywtrrajauwqnkut.supabase.co
SUPABASE_SERVICE_ROLE_KEY= #get from supabase
```

### Backend Setup (first time only)
From the repo root:

```bash
cd apps/backend
conda env create -f environment.yml
conda activate info4607-backend
```

### Adding Dependencies

```bash
cd apps/backend
conda activate info4607-backend
pip install <package-name>
conda env export --from-history > environment.yml
```

### Updating Dependencies

```bash
conda env update -f environment.yml
```

### Run Backend

```bash
cd apps/backend
conda activate info4607-backend
uvicorn app:app --reload --port 8000
```

### Frontend Setup (first time only)

```bash
cd apps/frontend
npm install
npm run dev
```
