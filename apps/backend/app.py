from uuid import UUID
from fastapi import FastAPI, HTTPException
from db import get_all_events, get_calendar_events
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

class EventData(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    start_date: datetime
    end_date: datetime
    recurrence: UUID
    repeat_until: datetime

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
        return {"Calendar": get_calendar_events(userID="03d78572-f213-4584-b8b2-e1a34dd1c030").get_months()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create_event")
def create_event(event: EventData):
    try:
        return {"message": create_event(userID="03d78572-f213-4584-b8b2-e1a34dd1c030", event=event)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
