## Running the Project (Frontend + Backend)

This repo has:
- `apps/frontend` (TypeScript/Node)
- `apps/backend` (Python/FastAPI) using a Conda environment

### Prerequisites
- Node.js (for frontend)
- Miniconda or Anaconda (for backend)


### Initial Set Up

If you havent installed nodejs you will need to before you can run npm commands

In your terminal do the following:

Navigate to /apps/frontend and run 
```bash
npm install
```

Navigate to /apps/backened
If anaconda is installed run, otherwise install and then run
``` bash
conda env create -f environment.yml
```

Navigate back to /apps and run
``` bash
npm install --save-dev concurrently
```

Create .env file in /apps/backend
``` bash
SUPABASE_URL=https://nhurxywtrrajauwqnkut.supabase.co
SUPABASE_SERVICE_ROLE_KEY= #get from supabase under project settings -> api keys -> legacy anon, service_role api keys -> reveal service_role
```
Once everything above is done you should be good to run it with the command below

### Run Frontend and Backend
From app folder
``` bash
npm run dev:all
```

### Backend Setup (first time only)
From the backend folder:

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
