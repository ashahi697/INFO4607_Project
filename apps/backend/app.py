from fastapi import FastAPI, HTTPException
from db import get_all_events, get_calendar_events

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

@app.get("/calendar")
def get_calendar():
    try:
        return {"Calendar": get_calendar_events(userID="03d78572-f213-4584-b8b2-e1a34dd1c030")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

