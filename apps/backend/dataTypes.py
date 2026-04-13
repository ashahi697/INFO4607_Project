import calendar
from datetime import date, datetime

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
#########################################################





#########################################################
#########################################################
# Start Budget Helpers
#########################################################
#########################################################

def get_remaining_budget_by_month(transactions, budget):
    budget_by_month = {}
    for txn in transactions:
        txn_date = datetime.fromisoformat(txn["txn_date"])
        month_year = (txn_date.year, txn_date.month)
        if month_year not in budget_by_month:
            budget_by_month[month_year] = 0
        if not txn["positive"]:
            budget_by_month[month_year] += txn["amount"]
        else:
            budget_by_month[month_year] -= txn["amount"]
    for month_year in budget_by_month:
        budget_by_month[month_year] = budget - budget_by_month[month_year]
    return budget_by_month

def format_remaining_budget(remaining_budget_by_month):
    formatted = []

    for (year, month), remaining in sorted(remaining_budget_by_month.items()):
        formatted.append({
            "year": year,
            "month": month,
            "label": f"{year}-{month:02d}",  # optional but useful
            "remaining": remaining
        })

    return formatted

# returns the last budget row for a specific user
# if there are multiple budget rows that exist use the recent one
# return none if no budget exists

def get_user_budget(budgets, user_id):

    user_budgets = [b for b in budgets if b.get("user_id") == user_id]

    if not user_budgets:
        return None

    user_budgets.sort(key=lambda b: str(b.get("created_at", "")))
    return user_budgets[-1]

# All budget periods for a specfific user
# returns all budget periods for a user sorted by date

def get_budget_periods_for_user(budget_periods, user_id):

    user_periods = [
        p for p in budget_periods
        if p.get("user_id") == user_id
    ]

# transactions for the budget periods 
# returns all transactions for a user inside a date range 
# date range is inclsuive 

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

    # finds user planned budget
# users latest budget period 
# filtering the transactions to only budget periods 
# adding of the total spending amount'
# calculating the remaining budget 
# calcultaing the percenrtage of the budget used 
# checking wheter the user is over the budget 

def process_budget_summary(budgets_df, budget_periods_df, transactions_df, user_id):
    budget = get_user_budget(budgets_df, user_id)
    period = get_latest_budget_period(budget_periods_df, user_id)

    if budget is None or period is None:
        return None

    period_transactions = get_transactions_for_budget_period(
        transactions_df,
        user_id,
        period["start_date"],
        period["end_date"]
    )

    if period_transactions.empty:
        total_spent = 0.0
    else:
        # choose ONE rule and stay consistent across the file
        # Rule below assumes expenses are negative amounts
        
        expenses = period_transactions[period_transactions["amount"] < 0]
        total_spent = abs(expenses["amount"].sum())

        # If your CSV uses positive=False instead, use this instead:
        # expenses = period_transactions[period_transactions["positive"] == False]
        # total_spent = expenses["amount"].sum()

    planned_amount = float(budget["planned_amount"])
    remaining_budget = planned_amount - total_spent
    percent_used = 0 if planned_amount == 0 else (total_spent / planned_amount) * 100
    over_budget = total_spent > planned_amount

    return {
        "user_id": user_id,
        "period_name": period["period_name"],
        "planned_amount": planned_amount,
        "total_spent": total_spent,
        "remaining_budget": remaining_budget,
        "percent_used": percent_used,
        "over_budget": over_budget
    user_periods.sort(key=lambda p: _to_date(p.get("start_date")))
    return user_periods



#======================= Budget Helper Function to specificy a time period  ====================================================
# ======================                                                    ====================================================



from datetime import date, datetime
from decimal import Decimal
from collections import defaultdict


# Converting string/date/datetime into a date object 

def _to_date(value):
    
    if isinstance(value, date) and not isinstance(value, datetime):
        return value

    if isinstance(value, datetime):
        return value.date()

    value = str(value).strip()

    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return datetime.fromisoformat(value).date()


    # Converting numbers safely to decimals 
    
def _to_decimal(value):

    return Decimal(str(value if value is not None else 0))


# Return the group key based on the requested or needed veiw 

def _bucket_key(txn_date, view_type):
  
    if view_type == "day":
        return txn_date.isoformat()
    if view_type == "month":
        return f"{txn_date.year}-{txn_date.month:02d}"
    if view_type == "year":
        return f"{txn_date.year}"

    raise ValueError("view_type must be 'day', 'month', 'year', or 'period'")

    
    # readable label

def _bucket_label(key, view_type):
    
    return str(key)



# summarizing a specific users budget within a date range, grouped b day, month, year

def get_budget_summary_by_range(
    transactions,
    user_id,
    planned_amount,
    start_date,
    end_date,
    view_type="month"
):
   
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
        is_income = txn.get("positive") is True

        grouped[key]["transaction_count"] += 1

        if is_income:
            grouped[key]["income"] += amount
        else:
            grouped[key]["spent"] += amount

    results = []

    for key in sorted(grouped.keys()):
        income = grouped[key]["income"]
        spent = grouped[key]["spent"]
        net = income - spent
        remaining = planned_amount - spent

        results.append({
            "bucket": key,
            "label": _bucket_label(key, view_type),
            "planned_amount": float(planned_amount),
            "income": float(income),
            "spent": float(spent),
            "net": float(net),
            "remaining": float(remaining),
            "over_budget": spent > planned_amount,
            "transaction_count": grouped[key]["transaction_count"]
        })

    return results


# summarize a specific users budget by the defined budget periods given 

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
            is_income = txn.get("positive") is True
            count += 1

            if is_income:
                income += amount
            else:
                spent += amount

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


# budget tabels veiw wrapper is user for day, month, year, periods 

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
