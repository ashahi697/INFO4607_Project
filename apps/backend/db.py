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

