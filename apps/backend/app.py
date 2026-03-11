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

class TransactionData(BaseModel): #Still needs to be completed
    amount: float
    date: str
    description: Optional[str] = None

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
    
    
## Transaction endpoints (placeholders for now, need to be implemented in db.py) ##

@app.get("/get_transactions")
def get_transactions(userID: str):
    try:
        return {"transactions": "user transactions"}#get_user_transactions(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create_transaction")
def create_transaction(userID: str, transactionData: TransactionData):
    try:
        return {"message": "transaction created"}#create_transaction(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/delete_transaction")
def delete_transaction(userID: str, transaction_id: str):
    try:
        return {"message": "transaction deleted"}#delete_transaction(userID=userID, transaction_id=transaction_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/edit_transaction")
def edit_transaction(userID: str, transaction_id: str, transactionData: TransactionData):
    try:
        return {"message": "transaction edited"}#edit_transaction(userID=userID, transaction_id=transaction_id, transactionData=transactionData)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

## Budget endpoints (placeholders for now, need to be implemented in db.py) ##

@app.get("/user_budget")
def get_user_budget(userID: str):
    try:
        return {"budget": "user budget"}#get_user_budget(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/user_remaining_budget")
def get_user_remaining_budget(userID: str):
    try:
        return {"remaining_budget": "user remaining budget"}#get_user_remaining_budget(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/set_user_budget")
def set_user_budget(userID: str, budget: float):
    try:
        return {"message": "user budget set"}#set_user_budget(userID=userID, budget=budget)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/delete_user_budget")
def delete_user_budget(userID: str):
    try:
        return {"message": "user budget deleted"}#delete_user_budget(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/edit_user_budget")
def edit_user_budget(userID: str, budget: float):
    try:
        return {"message": "user budget edited"}#edit_user_budget(userID=userID, budget=budget)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))