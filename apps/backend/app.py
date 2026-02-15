from fastapi import FastAPI, HTTPException
from db import get_all_events

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/events")
def events():
    try:
        return {"data": get_all_events()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


