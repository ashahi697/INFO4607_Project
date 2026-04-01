from dataTypes import Calendar, get_remaining_budget_by_month
from supabase_client import supabase_client

def get_all_events(userID):
    res = (
        supabase_client
        .table("events")   
        .select("*")
        .eq("user_id", userID)
        .order("start_date", desc=False)
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

def create_new_event(userID, eventData):
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
            "recurrences": eventData.recurrences,
            "repeat_until": eventData.repeat_until
        })
        .execute()
    )
    return res.data

def delete_user_event(userID, event_id):
    res = (
        supabase_client
        .table("events")
        .delete()
        .eq("user_id", userID)
        .eq("event_id", event_id)
        .execute()
    )
    return res.data

def get_calendar_user_event(userID, event_id):
    res = (
        supabase_client
        .table("events")
        .select("*, recurrences(frequency)")
        .eq("user_id", userID)
        .eq("event_id", event_id)
        .execute()
    )
    return res.data

def edit_calendar_user_event(userID, event_id, eventData):
    res = (
        supabase_client
        .table("events")
        .update({
            "title": eventData.title,
            "description": eventData.description,
            "start_time": eventData.start_time,
            "end_time": eventData.end_time,
            "start_date": eventData.start_date,
            "end_date": eventData.end_date,
            "recurrences": eventData.recurrences,
            "repeat_until": eventData.repeat_until
        })
        .eq("user_id", userID)
        .eq("event_id", event_id)
        .execute()
    )
    return res.data

def get_user_transactions(userID):
    res = (
        supabase_client
        .table("transactions")
        .select("*")
        .eq("user_id", userID)
        .order("txn_date", desc=True)
        .execute()
    )
    return res.data

def create_user_transaction(userID, transactionData):
    res = (
        supabase_client
        .table("transactions")
        .insert({
            "user_id": userID,
            "amount": transactionData.amount,
            "txn_date": transactionData.txn_date,
            "merchant": transactionData.merchant,
            "note": transactionData.note,
            "account_id": transactionData.account_id,
            "positive": transactionData.positive
        })
        .execute()
    )
    return res.data

def delete_user_transaction(userID, txn_id):
    res = (
        supabase_client
        .table("transactions")
        .delete()
        .eq("user_id", userID)
        .eq("txn_id", txn_id)
        .execute()
    )
    return res.data

def edit_user_transaction(userID, txn_id, transactionData):
    res = (
        supabase_client
        .table("transactions")
        .update({
            "amount": transactionData.amount,
            "txn_date": transactionData.txn_date,
            "merchant": transactionData.merchant,
            "note": transactionData.note,
            "account_id": transactionData.account_id,
            "positive": transactionData.positive
        })
        .eq("user_id", userID)
        .eq("txn_id", txn_id)
        .execute()
    )
    return res.data

def get_user_budget(userID):
    res = (
        supabase_client
        .table("budgets")
        .select("*")
        .eq("user_id", userID)
        .execute()
    )
    return res.data

def get_user_remaining_budget(userID):
    res1 = (
        supabase_client
        .table("budgets")
        .select("*")
        .eq("user_id", userID)
        .execute()
    )
    res2 = (
        supabase_client
        .table("transactions")
        .select("*")
        .eq("user_id", userID)
        .order("txn_date", desc=False)
        .execute()
    )
    budget = res1.data[0]["amount"] if res1.data else 0
    transactions = res2.data
    return get_remaining_budget_by_month(transactions, budget)
    
