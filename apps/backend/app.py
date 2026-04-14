from uuid import UUID
from fastapi import FastAPI, HTTPException, Query
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


# Budget endpoints 


# Budget endpoints are structured below to what we are calling 
from db import (get_user_budget as db_get_user_budget,  get_user_remaining_budget as db_get_user_remaining_budget, get_user_budget_view as db_get_user_budget_view,
    set_user_budget as db_set_user_budget, edit_user_budget as db_edit_user_budget, delete_user_budget as db_delete_user_budget,)


class BudgetPayload(BaseModel):
    budget: float


@app.get("/users/{userID}/budget")
def get_budget_endpoint(userID: str):
    try:
        budget = db_get_user_budget(userID)
        return {"budget": budget}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/users/{userID}/budget/remaining")
def get_remaining_budget_endpoint(
    userID: str,
    start_date: str = Query(...),
    end_date: str = Query(...),
    view_type: str = Query("month")
):
    try:
        remaining_budget = db_get_user_remaining_budget(
            userID=userID,
            start_date=start_date,
            end_date=end_date,
            view_type=view_type
        )
        return {"remaining_budget": remaining_budget}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/users/{userID}/budget/view")
def get_budget_view_endpoint(
    userID: str,
    start_date: str = Query(...),
    end_date: str = Query(...),
    view_type: str = Query("month")
):
    try:
        budget_view = db_get_user_budget_view(
            userID=userID,
            start_date=start_date,
            end_date=end_date,
            view_type=view_type
        )
        return {"budget_view": budget_view}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/users/{userID}/budget")
def set_budget_endpoint(userID: str, payload: BudgetPayload):
    try:
        budget = db_set_user_budget(userID, payload.budget)
        return {"message": "budget set", "budget": budget}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/users/{userID}/budget")
def edit_budget_endpoint(userID: str, payload: BudgetPayload):
    try:
        budget = db_edit_user_budget(userID, payload.budget)
        return {"message": "budget updated", "budget": budget}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/users/{userID}/budget")
def delete_budget_endpoint(userID: str):
    try:
        deleted = db_delete_user_budget(userID)
        return {"message": "budget deleted", "deleted": deleted}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))