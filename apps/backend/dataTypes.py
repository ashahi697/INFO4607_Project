import calendar
from datetime import date, datetime


FREQUENCY_ALIASES = {
    "MONDAYS": "MONDAY",
    "TUESDAYS": "TUESDAY",
    "WEDNESDAYS": "WEDNESDAY",
    "THURSDAYS": "THURSDAY",
    "FRIDAYS": "FRIDAY",
    "SATURDAYS": "SATURDAY",
    "SUNDAYS": "SUNDAY",
}


def normalize_frequency(value):
    if not value:
        return None
    upper = str(value).strip().upper()
    return FREQUENCY_ALIASES.get(upper, upper)


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


def process_repeated_events_month(events):
    mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays, daily, monthly = [], [], [], [], [], [], [], [], []
    for event in events:
        recurrence = event.get("recurrences")
        frequency = normalize_frequency(recurrence.get("frequency") if recurrence else None)

        if frequency == "DAILY":
            daily.append(event)
        elif frequency == "MONTHLY":
            monthly.append(event)
        elif frequency == "MONDAY":
            mondays.append(event)
        elif frequency == "TUESDAY":
            tuesdays.append(event)
        elif frequency == "WEDNESDAY":
            wednesdays.append(event)
        elif frequency == "THURSDAY":
            thursdays.append(event)
        elif frequency == "FRIDAY":
            fridays.append(event)
        elif frequency == "SATURDAY":
            saturdays.append(event)
        elif frequency == "SUNDAY":
            sundays.append(event)
    return mondays, tuesdays, wednesdays, thursdays, fridays, saturdays, sundays, daily, monthly


class RepeatedEventsMonth:
    def __init__(self, events):
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
        ) = process_repeated_events_month(events)


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
        self.repeated_events = RepeatedEventsMonth(repeated_events)


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
