import calendar
from datetime import date, datetime
# from db import get_user_productivity_date_range
from productivity_heatmap import create_productivity_heatmap

#########################################################
#########################################################

# Start Calendar classes and helper functions

#########################################################
#########################################################

def get_month_info(year: int, month: int):
    # Monday = 0, Sunday = 6 (default behavior)
    first_weekday, days_in_month = calendar.monthrange(year, month)

    first_date = date(year, month, 1)
    last_date = date(year, month, days_in_month)

    return (
        first_weekday,
        first_date.strftime("%A"),
        last_date.weekday(),
        last_date.strftime("%A"),
        days_in_month,
    )


def process_events_month(events):
    processed = []
    for event in events:
        if event["recurrences"] is None:
            processed.append(event)
    return processed


def process_repeated_events_month(events, month, year):
    mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays, daily, monthly = [], [], [], [], [], [], [], [], []
    for event in events:
        recurrence = event.get("recurrences")
        frequency = recurrence.get("frequency") if recurrence else None
        if event.get("repeat_until") is None or datetime.fromisoformat(event["repeat_until"]) >= datetime(year, month, 1):
            if frequency == "DAILY":
                daily.append(event)
            elif frequency == "MONTHLY":
                monthly.append(event)
            elif frequency == "MONDAYS":
                mondays.append(event)
            elif frequency == "TUESDAYS":
                tuesdays.append(event)
            elif frequency == "WEDNESDAYS":
                wednesdays.append(event)
            elif frequency == "THURSDAYS":
                thursdays.append(event)
            elif frequency == "FRIDAYS":
                fridays.append(event)
            elif frequency == "SATURDAYS":
                saturdays.append(event)
            elif frequency == "SUNDAYS":
                sundays.append(event)
    return mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays, daily, monthly


class RepeatedEventsMonth:
    def __init__(self, events, month, year):
        (
            self.mondays,
            self.tuesdays,
            self.wednesdays,
            self.thursdays,
            self.fridays,
            self.saturdays,
            self.sundays,
            self.daily,
            self.monthly,
        ) = process_repeated_events_month(events, month, year)


def process_events_calendar(events):
    repeated_events = []
    calendar_events = []
    for event in events:
        if event["recurrences"] is not None:
            repeated_events.append(event)
        else:
            calendar_events.append(event)
    return repeated_events, calendar_events


class Month:
    def __init__(self, number, year, events, repeated_events):
        self.name = calendar.month_name[number]
        self.number = number
        self.year = year
        self.one_time_events = process_events_month(events)
        (
            self.first_weekday,
            self.first_weekday_name,
            self.last_weekday,
            self.last_weekday_name,
            self.days_in_month,
        ) = get_month_info(year, number)
        self.repeated_events = RepeatedEventsMonth(repeated_events, number, year)


def get_unique_months(events):
    months = set()

    for e in events:
        if e.get("start_date"):
            d = datetime.fromisoformat(e["start_date"])
            months.add((d.year, d.month))
    return sorted(months)


def get_events_for_month(events, year, month):
    return [
        e
        for e in events
        if e.get("start_date")
        and (lambda d: d.year == year and d.month == month)(datetime.fromisoformat(e["start_date"]))
    ]


def event_overlaps_month(event, year, month_num):
    start_str = event["start_date"]
    if not start_str:
        return False

    start = date.fromisoformat(start_str)

    month_start = date(year, month_num, 1)
    month_end = date(year, month_num, calendar.monthrange(year, month_num)[1])

    end_str = event.get("end_date")

    # end_date = null => repeats forever (open-ended)
    if not end_str:
        return start <= month_end

    end = date.fromisoformat(end_str)
    return start <= month_end and end >= month_start


def process_months(calendar_events, repeated_events):
    months = []
    month_count = get_unique_months(calendar_events + repeated_events)
    for month in month_count:
        month_events = get_events_for_month(calendar_events, month[0], month[1])
        month_repeated_events = []
        for event in repeated_events:
            if event_overlaps_month(event, month[0], month[1]):
                month_repeated_events.append(event)
        months.append(Month(month[1], month[0], month_events, month_repeated_events))
    return months


class Calendar:
    def __init__(self, events):
        self.repeated_events, self.calendar_events = process_events_calendar(events)
        self.months = process_months(self.calendar_events, self.repeated_events)
    
    def get_months(self):
        return self.months

#########################################################
#########################################################

# End Calendar classes and helper functions

#########################################################
#########################################################s



############################################################
############################################################

# Start Budget helper functions 

#############################################################
#############################################################

# Budget helper functions for backend API use


# General rules:
# positive == True  -> income
# positive == False -> expense
# remaining budget = planned_amount - spent
# functions accept plain list[dict] rows from Supabase
# to outputs are JSON safe where appropriate


from datetime import date, datetime
from decimal import Decimal
from collections import defaultdict


##############################################################
# Shared helpers
##############################################################

# converting string/date/datetime into a date object

def _to_date(value):
    
    if value is None:
        raise ValueError("Date value cannot be None")

    if isinstance(value, date) and not isinstance(value, datetime):
        return value

    if isinstance(value, datetime):
        return value.date()

    value = str(value).strip()

    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return datetime.fromisoformat(value).date()

# converting numvers safely to Decimal points if needed

def _to_decimal(value):
  
    return Decimal(str(value if value is not None else 0))


# normalizing the trasaction to 'positive' flag 
# returns True for income False for expense and none for invalid of missing data

def _normalize_positive(value):
 

    if value is True or value in ("true", "True", 1, "1"):
        return True
    if value is False or value in ("false", "False", 0, "0"):
        return False
    return None


###############################################################
#############################################################

# Core budget helpers

##############################################################
##############################################################




# reutrn one users budget row, If multiple rows do exist, create a perfed on the latest created at row 
# returns none if no budget exists

def get_user_budget(budgets, user_id):

    user_budgets = [b for b in budgets if b.get("user_id") == user_id]

    if not user_budgets:
        return None

    if all("created_at" in b for b in user_budgets):
        user_budgets.sort(key=lambda b: str(b.get("created_at", "")))
        return user_budgets[-1]

    return user_budgets[0]


# return all budget periods for a user sorted by start_date

def get_budget_periods_for_user(budget_periods, user_id):

    user_periods = [
        p for p in budget_periods
        if p.get("user_id") == user_id
    ]

    user_periods.sort(key=lambda p: _to_date(p.get("start_date")))
    return user_periods


# return the latest budget periods for a user 

def get_latest_budget_period(budget_periods, user_id):

    user_periods = get_budget_periods_for_user(budget_periods, user_id)

    if not user_periods:
        return None

    return user_periods[-1]


# Return a users transactions inside an inclusive and choosen date range

def get_transactions_for_budget_period(transactions, user_id, start_date, end_date):

    start_date = _to_date(start_date)
    end_date = _to_date(end_date)

    filtered = []

    for txn in transactions:
        if txn.get("user_id") != user_id:
            continue

        txn_date = _to_date(txn.get("txn_date"))
        if start_date <= txn_date <= end_date:
            filtered.append(txn)

    return filtered


# Return summary for a users latest budget period 
#  Expected output: user_id: str, period name: str | None, planned amount: float, total spent: float
# remaining budget: float, percent used: float, over_budget: bool
# Output: {}

def process_budget_summary(budgets, budget_periods, transactions, user_id):

    budget = get_user_budget(budgets, user_id)
    period = get_latest_budget_period(budget_periods, user_id)

    if budget is None or period is None:
        return None

    period_transactions = get_transactions_for_budget_period(
        transactions,
        user_id,
        period.get("start_date"),
        period.get("end_date")
    )

    total_spent = Decimal("0")

    for txn in period_transactions:
        positive = _normalize_positive(txn.get("positive"))
        if positive is False:
            total_spent += _to_decimal(txn.get("amount"))

    planned_amount = _to_decimal(budget.get("planned_amount"))
    remaining_budget = planned_amount - total_spent
    percent_used = Decimal("0")

    if planned_amount != 0:
        percent_used = (total_spent / planned_amount) * Decimal("100")

    return {
        "user_id": user_id,
        "period_name": period.get("period_name"),
        "planned_amount": float(planned_amount),
        "total_spent": float(total_spent),
        "remaining_budget": float(remaining_budget),
        "percent_used": float(percent_used),
        "over_budget": total_spent > planned_amount
    }


################################################################
################################################################

# Time based budget view helpers

################################################################
################################################################

# Return grouping keys based on the requested view

def _bucket_key(txn_date, view_type):
   
    if view_type == "day":
        return txn_date.isoformat()
    if view_type == "month":
        return f"{txn_date.year}-{txn_date.month:02d}"
    if view_type == "year":
        return f"{txn_date.year}"

    raise ValueError("view_type must be 'day', 'month', 'year', or 'period'")


# readable label specifcally once the helper functions connect to the front end

def _bucket_label(key):
   
    return str(key)


# summarize a specific users budget within a date range grouped by day, month, and year

def get_budget_summary_by_range(
    transactions,
    user_id,
    planned_amount,
    start_date,
    end_date,
    view_type="month"
):
    """
    Summarize a user's budget within a date range grouped by:
    - day
    - month
    - year

    Output row:
    {
        "bucket": str,
        "label": str,
        "planned_amount": float,
        "income": float,
        "spent": float,
        "net": float,
        "remaining": float,
        "over_budget": bool,
        "transaction_count": int
    }
    """
    if view_type not in {"day", "month", "year"}:
        raise ValueError("view_type must be 'day', 'month', or 'year'")

    start_date = _to_date(start_date)
    end_date = _to_date(end_date)
    planned_amount = _to_decimal(planned_amount)

    grouped = defaultdict(lambda: {
        "income": Decimal("0"),
        "spent": Decimal("0"),
        "transaction_count": 0
    })

    for txn in transactions:
        if txn.get("user_id") != user_id:
            continue

        txn_date = _to_date(txn.get("txn_date"))
        if not (start_date <= txn_date <= end_date):
            continue

        key = _bucket_key(txn_date, view_type)
        amount = _to_decimal(txn.get("amount"))
        positive = _normalize_positive(txn.get("positive"))

        if positive is True:
            grouped[key]["income"] += amount
        elif positive is False:
            grouped[key]["spent"] += amount
        else:
            continue

        grouped[key]["transaction_count"] += 1

    results = []

    for key in sorted(grouped.keys()):
        income = grouped[key]["income"]
        spent = grouped[key]["spent"]
        net = income - spent
        remaining = planned_amount - spent

        results.append({
            "bucket": key,
            "label": _bucket_label(key),
            "planned_amount": float(planned_amount),
            "income": float(income),
            "spent": float(spent),
            "net": float(net),
            "remaining": float(remaining),
            "over_budget": spent > planned_amount,
            "transaction_count": grouped[key]["transaction_count"]
        })

    return results


# summarize a users budget by defined budget periods 
# budget period rows must include user_id, period_name, start_date, and end_date

def get_budget_summary_by_periods(
    transactions,
    budget_periods,
    user_id,
    planned_amount,
    start_date=None,
    end_date=None
):

    planned_amount = _to_decimal(planned_amount)

    if start_date is not None:
        start_date = _to_date(start_date)

    if end_date is not None:
        end_date = _to_date(end_date)

    user_periods = []

    for period in budget_periods:
        if period.get("user_id") != user_id:
            continue

        period_start = _to_date(period.get("start_date"))
        period_end = _to_date(period.get("end_date"))

        if start_date is not None and period_end < start_date:
            continue

        if end_date is not None and period_start > end_date:
            continue

        user_periods.append({
            "period_name": period.get("period_name"),
            "start_date": period_start,
            "end_date": period_end
        })

    user_periods.sort(key=lambda p: p["start_date"])

    results = []

    for period in user_periods:
        income = Decimal("0")
        spent = Decimal("0")
        count = 0

        for txn in transactions:
            if txn.get("user_id") != user_id:
                continue

            txn_date = _to_date(txn.get("txn_date"))
            if not (period["start_date"] <= txn_date <= period["end_date"]):
                continue

            amount = _to_decimal(txn.get("amount"))
            positive = _normalize_positive(txn.get("positive"))

            if positive is True:
                income += amount
            elif positive is False:
                spent += amount
            else:
                continue

            count += 1

        net = income - spent
        remaining = planned_amount - spent

        results.append({
            "bucket": period["period_name"],
            "label": period["period_name"],
            "start_date": period["start_date"].isoformat(),
            "end_date": period["end_date"].isoformat(),
            "planned_amount": float(planned_amount),
            "income": float(income),
            "spent": float(spent),
            "net": float(net),
            "remaining": float(remaining),
            "over_budget": spent > planned_amount,
            "transaction_count": count
        })

    return results


# wrapper for day, month, year, and period 

def get_budget_view(
    transactions,
    user_id,
    planned_amount,
    start_date,
    end_date,
    view_type="month",
    budget_periods=None
):

    if view_type == "period":
        if budget_periods is None:
            raise ValueError("budget_periods is required when view_type='period'")

        return get_budget_summary_by_periods(
            transactions=transactions,
            budget_periods=budget_periods,
            user_id=user_id,
            planned_amount=planned_amount,
            start_date=start_date,
            end_date=end_date
        )

    return get_budget_summary_by_range(
        transactions=transactions,
        user_id=user_id,
        planned_amount=planned_amount,
        start_date=start_date,
        end_date=end_date,
        view_type=view_type
    )


################################################################
################################################################

# Remaining budget by month helpers

################################################################
################################################################


def get_remaining_budget_by_month(transactions, budget, user_id=None):
    """
    Return {(year, month): Decimal(...)} for internal backend use.

    For API/frontend use, pass the result into format_remaining_budget().
    """
    budget = _to_decimal(budget)
    budget_by_month = {}

    for txn in transactions:
        if user_id is not None and txn.get("user_id") != user_id:
            continue

        txn_date = _to_date(txn.get("txn_date"))
        month_year = (txn_date.year, txn_date.month)

        if month_year not in budget_by_month:
            budget_by_month[month_year] = Decimal("0")

        amount = _to_decimal(txn.get("amount"))
        positive = _normalize_positive(txn.get("positive"))

        if positive is False:
            budget_by_month[month_year] += amount
        elif positive is True:
            continue
        else:
            continue

    for month_year in budget_by_month:
        budget_by_month[month_year] = budget - budget_by_month[month_year]

    return budget_by_month

# convert Convert {(year, month): Decimal(...)} into JSON-safe rows.

def format_remaining_budget(remaining_budget_by_month):

    formatted = []

    for (year, month), remaining in sorted(remaining_budget_by_month.items()):
        formatted.append({
            "year": year,
            "month": month,
            "label": f"{year}-{month:02d}",
            "remaining": float(remaining)
        })

    return formatted


################################################################################
################################################################################

# End Budget Helper functions 

################################################################################
################################################################################

def calculate_prod_score(tasks):
    score = sum(task["priority_weight"] for task in tasks) * 5
    return score

def get_user_productivity_map(userID, prod_scores):
    return create_productivity_heatmap(prod_scores)
