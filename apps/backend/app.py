from uuid import UUID
from fastapi import FastAPI, HTTPException
from db import get_all_events, get_calendar_events, create_new_event, delete_user_event, get_calendar_user_event, edit_calendar_user_event
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time

app = FastAPI()

class EventData(BaseModel):
    title: str
    description: str

    start_time: Optional[str] = None
    end_time: Optional[str] = None

    start_date: str
    end_date: Optional[str] = None

    recurrences: Optional[str] = None
    repeat_until: Optional[str] = None

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
def get_calendar(userID: str):
    try:
        return {"Calendar": get_calendar_events(userID=userID).get_months()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create_event")
def create_event(event: EventData, userID: str):
    try:
        return {"message": create_new_event(userID=userID, eventData=event)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/delete_event")
def delete_event(userID: str, event_id: str):
    try:
        return {"message": delete_user_event(userID=userID, event_id=event_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/calendar_event")
def get_calendar_event(userID: str, event_id: str):
    try:
        res = get_calendar_user_event(userID=userID, event_id=event_id)
        if not res:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"Calendar": res}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.put("/edit_event")
def edit_event(event: EventData, userID: str, event_id: str):
    try:
        existing_event = get_calendar_user_event(userID=userID, event_id=event_id)
        if not existing_event:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"message": edit_calendar_user_event(userID=userID, event_id=event_id, eventData=event)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
