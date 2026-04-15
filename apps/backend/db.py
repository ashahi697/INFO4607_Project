from dataTypes import Calendar, get_remaining_budget_by_month, calculate_prod_score
from supabase_client import supabase_client
from productivity_heatmap import create_productivity_heatmap
from datetime import datetime, timedelta

def _to_date_only(date_str):
    if date_str is None:
        return None
    return str(date_str).split("T")[0].split(" ")[0]

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


def get_user_tasks(userID):
    res = (
        supabase_client
        .table("tasks")
        .select("*")
        .eq("uuid", userID)
        .order("created_at", desc=False)
        .execute()
    )
    return res.data

def create_user_task(userID, taskData):
    res = (
        supabase_client
        .table("tasks")
        .insert({
            "uuid": userID,
            "task_name": taskData.task_name,
            "priority_weight": taskData.priority_weight,
            "created_at": taskData.created_at,
            "completed_date": None,
            "name": taskData.name,
        })
        .execute()
    )
    return res.data

def delete_user_task(userID, task_id):
    res = (
        supabase_client
        .table("tasks")
        .delete()
        .eq("uuid", userID)
        .eq("id", task_id)
        .execute()
    )
    return res.data

def edit_user_task(userID, task_id, taskData):
    res = (
        supabase_client
        .table("tasks")
        .update({
            "task_name": taskData.task_name,
            "priority_weight": taskData.priority_weight,
            "created_at": taskData.created_at,
            "completed_date": _to_date_only(taskData.completed_date),
            "name": taskData.name,
        })
        .eq("uuid", userID)
        .eq("id", task_id)
        .execute()
    )
    return res.data

def complete_user_task(userID, task_id, completed_date):
    existing_task = (
        supabase_client
        .table("tasks")
        .select("completed_date")
        .eq("uuid", userID)
        .eq("id", task_id)
        .execute()
    )
    old_completed_date = existing_task.data[0]["completed_date"] if existing_task.data else None

    res = (
        supabase_client
        .table("tasks")
        .update({
            "completed_date": _to_date_only(completed_date),
        })
        .eq("uuid", userID)
        .eq("id", task_id)
        .execute()
    )

    sync_daily_productivity_score(userID, completed_date)
    if old_completed_date and _to_date_only(old_completed_date) != _to_date_only(completed_date):
        sync_daily_productivity_score(userID, old_completed_date)

    return res.data

def incomplete_user_task(userID, task_id):
    existing_task = (
        supabase_client
        .table("tasks")
        .select("completed_date")
        .eq("uuid", userID)
        .eq("id", task_id)
        .execute()
    )
    old_completed_date = existing_task.data[0]["completed_date"] if existing_task.data else None

    res = (
        supabase_client
        .table("tasks")
        .update({
            "completed_date": None,
        })
        .eq("uuid", userID)
        .eq("id", task_id)
        .execute()
    )

    sync_daily_productivity_score(userID, old_completed_date)

    return res.data


def get_user_productivity(userID):
    res = (
        supabase_client
        .table("productivity")
        .select("*")
        .eq("uuid", userID)
        .order("dates", desc=False)
        .execute()
    )
    return res.data

def get_user_productivity_date_range(userID, start_date, end_date):
    start_date_only = _to_date_only(start_date)
    end_date_only = _to_date_only(end_date)
    end_next_day = (datetime.fromisoformat(end_date_only) + timedelta(days=1)).strftime("%Y-%m-%d")
    print(f"[prod_range] userID={userID} start_date={start_date_only} end_date={end_date_only}")

    all_for_user = (
        supabase_client
        .table("productivity")
        .select("dates")
        .eq("uuid", userID)
        .execute()
    )
    print(f"[prod_range] all_rows_for_user={len(all_for_user.data or [])}")

    res = (
        supabase_client
        .table("productivity")
        .select("*")
        .eq("uuid", userID)
        .gte("dates", start_date_only)
        .lt("dates", end_next_day)
        .order("dates", desc=False)
        .execute()
    )
    print(f"[prod_range] raw_rows={len(res.data or [])}")

    scores_by_day = {}
    for row in res.data:
        day = _to_date_only(row["dates"])
        scores_by_day[day] = row["productivity_score"]
    print(f"[prod_range] unique_days={len(scores_by_day)}")

    current_day = datetime.fromisoformat(start_date_only).date()
    last_day = datetime.fromisoformat(end_date_only).date()
    while current_day <= last_day:
        day_str = current_day.strftime("%Y-%m-%d")
        if day_str not in scores_by_day:
            scores_by_day[day_str] = 0
        current_day += timedelta(days=1)

    formatted_scores = []
    for day in sorted(scores_by_day.keys()):
        formatted_scores.append({
            "dates": day,
            "productivity_score": scores_by_day[day]
        })
    print(f"[prod_range] sending_to_heatmap={len(formatted_scores)}")
    return create_productivity_heatmap(formatted_scores)

def get_daily_productivity_score(userID, prod_date):
    date_only = _to_date_only(prod_date)
    res = (
        supabase_client
        .table("tasks")
        .select("priority_weight")
        .eq("uuid", userID)
        .eq("completed_date", date_only)
        .execute()
    )
    return calculate_prod_score(res.data or [])

def sync_daily_productivity_score(userID, prod_date):
    date_only = _to_date_only(prod_date)
    if not date_only:
        return

    daily_score = get_daily_productivity_score(userID, date_only)

    existing = (
        supabase_client
        .table("productivity")
        .select("*")
        .eq("uuid", userID)
        .eq("dates", date_only)
        .execute()
    )

    if existing.data:
        (
            supabase_client
            .table("productivity")
            .update({
                "productivity_score": daily_score,
                "dates": date_only,
            })
            .eq("uuid", userID)
            .eq("dates", date_only)
            .execute()
        )
    else:
        (
            supabase_client
            .table("productivity")
            .insert({
                "uuid": userID,
                "dates": date_only,
                "task_weight": None,
                "focused_time": None,
                "tasks_completed": None,
                "productivity_score": daily_score,
            })
            .execute()
        )

def create_user_productivity(userID, productivityData):
    daily_score = get_daily_productivity_score(userID, productivityData.dates)
    res = (
        supabase_client
        .table("productivity")
        .insert({
            "uuid": userID,
            "dates": _to_date_only(productivityData.dates),
            "task_weight": productivityData.task_weight,
            "focused_time": productivityData.focused_time,
            "tasks_completed": productivityData.tasks_completed,
            "productivity_score": daily_score,
        })
        .execute()
    )
    return res.data

def delete_user_productivity(userID, productivity_date):
    res = (
        supabase_client
        .table("productivity")
        .delete()
        .eq("uuid", userID)
        .eq("dates", _to_date_only(productivity_date))
        .execute()
    )
    return res.data

def edit_user_productivity(userID, productivity_date, productivityData):
    daily_score = get_daily_productivity_score(userID, productivityData.dates)
    res = (
        supabase_client
        .table("productivity")
        .update({
            "dates": _to_date_only(productivityData.dates),
            "task_weight": productivityData.task_weight,
            "focused_time": productivityData.focused_time,
            "tasks_completed": productivityData.tasks_completed,
            "productivity_score": daily_score,
        })
        .eq("uuid", userID)
        .eq("dates", _to_date_only(productivity_date))
        .execute()
    )
    return res.data



#did in class 4/13/2026
def user_budgets(userID):
    res1 = (
        supabase_client
        .table("budgets")
        .select("*")
        .eq("user_id", userID)
        .execute()
    )

