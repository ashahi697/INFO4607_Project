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

from typing import Optional
from supabase_client import supabase_client
from dataTypes import ( get_budget_view,process_budget_summary,  get_remaining_budget_by_month, format_remaining_budget,)


def _get_user_name(userID: str) -> Optional[str]:
    res = (
        supabase_client
        .table("users")
        .select("Name")
        .eq("user_id", userID)
        .limit(1)
        .execute()
    )
    if not res.data:
        return None
    return res.data[0].get("Name")


def _get_latest_budget_row(userID: str):
    res = (
        supabase_client
        .table("budgets")
        .select("*")
        .eq("user_id", userID)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


def get_user_transactions(userID: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    query = (
        supabase_client
        .table("transactions")
        .select("*")
        .eq("user_id", userID)
        .order("txn_date", desc=False)
    )

    if start_date:
        query = query.gte("txn_date", start_date)
    if end_date:
        query = query.lte("txn_date", end_date)

    res = query.execute()
    return res.data or []


def get_user_budget(userID: str):
    return _get_latest_budget_row(userID)


def get_user_budget_periods(userID: str):
    """
    Only use this if you actually have a budget_periods table in Supabase.
    If not, leave it returning [] for now and use only day/month/year views.
    """
    try:
        res = (
            supabase_client
            .table("budget_periods")
            .select("*")
            .eq("user_id", userID)
            .order("start_date", desc=False)
            .execute()
        )
        return res.data or []
    except Exception:
        return []


def get_user_budget_view(userID: str, start_date: str, end_date: str, view_type: str = "month"):
    budget_row = _get_latest_budget_row(userID)
    if not budget_row:
        raise ValueError(f"No budget found for user {userID}")

    transactions = get_user_transactions(userID, start_date=start_date, end_date=end_date)
    budget_periods = get_user_budget_periods(userID) if view_type == "period" else None

    return get_budget_view(
        transactions=transactions,
        user_id=userID,
        planned_amount=budget_row["planned_amount"],
        start_date=start_date,
        end_date=end_date,
        view_type=view_type,
        budget_periods=budget_periods
    )


def get_user_remaining_budget(userID: str, start_date: str, end_date: str, view_type: str = "month"):
    budget_view = get_user_budget_view(
        userID=userID,
        start_date=start_date,
        end_date=end_date,
        view_type=view_type
    )

    if not budget_view:
        return {
            "bucket": None,
            "remaining": 0.0,
            "planned_amount": 0.0,
            "spent": 0.0,
            "income": 0.0,
            "net": 0.0,
            "over_budget": False
        }

    # return the most recent bucket in the range
    latest = budget_view[-1]
    return latest


def set_user_budget(userID: str, budget: float):
    existing = _get_latest_budget_row(userID)

    if existing:
        res = (
            supabase_client
            .table("budgets")
            .update({"planned_amount": budget})
            .eq("budget_id", existing["budget_id"])
            .execute()
        )
        return res.data[0] if res.data else {"user_id": userID, "planned_amount": budget}

    user_name = _get_user_name(userID)

    res = (
        supabase_client
        .table("budgets")
        .insert({
            "user_id": userID,
            "planned_amount": budget,
            "user_name": user_name
        })
        .execute()
    )
    return res.data[0] if res.data else {"user_id": userID, "planned_amount": budget}


def edit_user_budget(userID: str, budget: float):
    existing = _get_latest_budget_row(userID)
    if not existing:
        raise ValueError(f"No budget found for user {userID}")

    res = (
        supabase_client
        .table("budgets")
        .update({"planned_amount": budget})
        .eq("budget_id", existing["budget_id"])
        .execute()
    )
    return res.data[0] if res.data else {"user_id": userID, "planned_amount": budget}


def delete_user_budget(userID: str):
    existing = _get_latest_budget_row(userID)
    if not existing:
        raise ValueError(f"No budget found for user {userID}")

    res = (
        supabase_client
        .table("budgets")
        .delete()
        .eq("budget_id", existing["budget_id"])
        .execute()
    )
    return res.data