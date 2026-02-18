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
