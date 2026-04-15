from uuid import UUID
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time
from pathlib import Path
from db import (edit_user_transaction, get_all_events, 
                get_calendar_events, create_new_event, delete_user_event,
                get_calendar_user_event, edit_calendar_user_event, get_user_transactions, 
                create_user_transaction, edit_user_transaction, delete_user_transaction, 
                delete_user_transaction, get_user_remaining_budget, get_user_budget, get_user_tasks,
                create_user_task, edit_user_task, delete_user_task, complete_user_task, incomplete_user_task,
                get_user_productivity, create_user_productivity, edit_user_productivity, delete_user_productivity, get_user_productivity_date_range)
# from typing import Optional
# from datetime import datetime, date, time
# from db import (edit_user_transaction, get_all_events, 
#                 get_calendar_events, create_new_event, delete_user_event,
#                 get_calendar_user_event, edit_calendar_user_event, get_user_transactions, 
#                 create_user_transaction, edit_user_transaction, delete_user_transaction, 
#                 delete_user_transaction, get_user_remaining_budget, get_user_budget)

app = FastAPI()

generated_dir = Path(__file__).resolve().parent / "generated"
generated_dir.mkdir(parents=True, exist_ok=True)
app.mount("/generated", StaticFiles(directory=generated_dir), name="generated")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventData(BaseModel):
    title: str
    description: str

    start_time: Optional[str] = None
    end_time: Optional[str] = None

    start_date: str
    end_date: Optional[str] = None

    recurrences: Optional[str] = None
    repeat_until: Optional[str] = None

class TransactionData(BaseModel):
    amount: float
    txn_date: str

    merchant: Optional[str] = None
    note: Optional[str] = None

    account_id: Optional[UUID] = None

    positive: bool = False

class TaskData(BaseModel):
    task_name: str
    priority_weight: int
    created_at: Optional[str] = None
    completed_date: Optional[str] = None
    name: Optional[str] = None

class ProductivityData(BaseModel):
    dates: str
    task_weight: Optional[int] = None
    focused_time: Optional[int] = None
    tasks_completed: Optional[int] = None

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/events")
def events(userID: str):
    try:
        return {"data": get_all_events(userID=userID)}
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
        return {"transactions": get_user_transactions(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create_transaction")
def create_transaction(userID: str, transactionData: TransactionData):
    try:
        return {"message": create_user_transaction(userID=userID, transactionData=transactionData)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/delete_transaction")
def delete_transaction(userID: str, transaction_id: str):
    try:
        return {"message": delete_user_transaction(userID=userID, txn_id=transaction_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/edit_transaction")
def edit_transaction(userID: str, transaction_id: str, transactionData: TransactionData):
    try:
        return {"message": edit_user_transaction(userID=userID, txn_id=transaction_id, transactionData=transactionData)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

## Budget endpoints (placeholders for now, need to be implemented in db.py) ##

@app.get("/user_budget")
def get_user_budget(userID: str):
    try:
        return {"budget": get_user_budget(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/user_remaining_budget")
def get_remaining_budget(userID: str):
    try:
        return {"remaining_budget": get_user_remaining_budget(userID= "03d78572-f213-4584-b8b2-e1a34dd1c030")}#userID)}
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
    

## Budget endpoints (placeholders for now, need to be implemented in db.py) ##

@app.get("/user_budget")
def get_user_budget(userID: str):
    try:
        return {"budget": get_user_budget(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/user_remaining_budget")
def get_user_remaining_budget(userID: str):
    try:
        return {"remaining_budget": get_user_remaining_budget(userID=userID)}
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
    


####### Task Endpoints #######


@app.get("/get_tasks")
def get_all_tasks(userID: str):
    try:
        return {"tasks": get_user_tasks(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create_task")
def create_task(userID: str, taskData: TaskData):
    try:
        return {"message": create_user_task(userID=userID, taskData=taskData)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/delete_task")
def delete_task(userID: str, task_id: int):
    try:
        return {"message": delete_user_task(userID=userID, task_id=task_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/edit_task")
def edit_task(userID: str, task_id: int, taskData: TaskData):
    try:
        return {"message": edit_user_task(userID=userID, task_id=task_id, taskData=taskData)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/complete_task")
def complete_task(userID: str, task_id: int, completed_date: str):
    try:
        return {"message": complete_user_task(userID=userID, task_id=task_id, completed_date=completed_date)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/incomplete_task")
def incomplete_task(userID: str, task_id: int):
    try:
        return {"message": incomplete_user_task(userID=userID, task_id=task_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


####### Productivity Endpoints #######


@app.get("/get_productivity")
def get_productivity(userID: str):
    try:
        return {"productivity": get_user_productivity(userID=userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/create_productivity")
def create_productivity(userID: str, productivityData: ProductivityData):
    try:
        return {"message": create_user_productivity(userID=userID, productivityData=productivityData)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/delete_productivity")
def delete_productivity(userID: str, productivity_date: str):
    try:
        return {"message": delete_user_productivity(userID=userID, productivity_date=productivity_date)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/edit_productivity")
def edit_productivity(userID: str, productivity_date: str, productivityData: ProductivityData):
    try:
        return {"message": edit_user_productivity(userID=userID, productivity_date=productivity_date, productivityData=productivityData)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/productivity_heatmap")
def productivity_heatmap(userID: str, start_date: str, end_date: str):
    try:
        return {"heatmap": get_user_productivity_date_range(userID=userID, start_date=start_date, end_date=end_date)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


  ## I tried this budget endpoint to test:


@app.get("/users/{userID}/budget")
def get_budget(userID: str):
    try:
        return {"budget": get_user_budget(userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/users/{userID}/budget/remaining")
def get_remaining_budget(userID: str):
    try:
        return {"remaining_budget": get_user_remaining_budget(userID)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/users/{userID}/budget")
def set_budget(userID: str, budget: float):
    try:
        set_user_budget(userID, budget)
        return {"message": "budget set"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/users/{userID}/budget")
def edit_budget(userID: str, budget: float):
    try:
        edit_user_budget(userID, budget)
        return {"message": "budget updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/users/{userID}/budget")
def delete_budget(userID: str):
    try:
        delete_user_budget(userID)
        return {"message": "budget deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
