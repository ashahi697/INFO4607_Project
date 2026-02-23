from dataTypes import Calendar
from supabase_client import supabase_client

def get_all_events():
    res = (
        supabase_client
        .table("events")   # <-- make sure this matches your actual table name
        .select("*")
        .limit(10)
        .execute()
    )
    return res.data

def get_calendar_events(userID):
    res = (
        supabase_client
        .table("events")
        .select("*, recurrences(frequency)")
        .eq("user_id", userID)
        .order("start_date", desc=False)
        .execute()
    )
    return Calendar(res.data)

def create_event(userID, eventData):
    res = (
        supabase_client
        .table("events")
        .insert({
            "user_id": userID,
            "title": eventData.title,
            "description": eventData.description,
            "start_time": eventData.start_time,
            "end_time": eventData.end_time,
            "start_date": eventData.start_date,
            "end_date": eventData.end_date,
            "recurrences": eventData.recurrence,
            "repeat_until": eventData.repeat_until
        })
        .execute()
    )
    return res.data