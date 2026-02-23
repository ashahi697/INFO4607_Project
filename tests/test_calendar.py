# tests/test_calendar_builder.py
from datetime import date
from fastapi.testclient import TestClient
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "backend"))

from app import app          
from dataTypes import Calendar

client = TestClient(app)


def test_build_calendar_groups_events_by_day():
    events = [
        {
            "event_id": "e1",
            "title": "One-off",
            "start_date": "2026-02-03",
            "end_date": None,
            "start_time": "09:00:00-07",
            "end_time": "10:00:00-07",
            "recurrences": None,
        },
        {
            "event_id": "e2",
            "title": "Monthly thing",
            "start_date": "2026-02-10",
            "end_date": None,
            "start_time": None,
            "end_time": None,
            "recurrences": {"frequency": "MONTHLY"},
        },
    ]

    cal = Calendar(events)

    # basic shape
    assert cal is not None
    assert len(cal.months) == 1
    assert len(cal.months[0].repeated_events.monthly) == 1



def assert_month_shape(month: dict):
    for key in [
        "name",
        "number",
        "year",
        "one_time_events",
        "first_weekday",
        "first_weekday_name",
        "last_weekday",
        "last_weekday_name",
        "days_in_month",
        "repeated_events",
    ]:
        assert key in month, f"Missing key: {key}"

    assert isinstance(month["name"], str)
    assert isinstance(month["number"], int)
    assert 1 <= month["number"] <= 12
    assert isinstance(month["year"], int)

    assert isinstance(month["one_time_events"], list)

    assert isinstance(month["first_weekday"], int)
    assert 0 <= month["first_weekday"] <= 6
    assert isinstance(month["first_weekday_name"], str)

    assert isinstance(month["last_weekday"], int)
    assert 0 <= month["last_weekday"] <= 6
    assert isinstance(month["last_weekday_name"], str)

    assert isinstance(month["days_in_month"], int)
    assert 28 <= month["days_in_month"] <= 31

    rep = month["repeated_events"]
    assert isinstance(rep, dict)

    for bucket in [
        "mondays",
        "tuesdays",
        "wednesdays",
        "thursdays",
        "fridays",
        "saturdays",
        "sundays",
        "daily",
        "monthly",
    ]:
        assert bucket in rep, f"Missing repeated_events bucket: {bucket}"
        assert isinstance(rep[bucket], list)


def test_calendar_endpoint_returns_month_objects():
    r = client.get("/calendar")
    assert r.status_code == 200

    data = r.json()
    assert isinstance(data, dict)
    assert "Calendar" in data
    assert isinstance(data["Calendar"], list)
    assert len(data["Calendar"]) > 0

    # validate first month object shape
    first_month = data["Calendar"][0]
    assert_month_shape(first_month)


REPEAT_BUCKETS = [
    "mondays", "tuesdays", "wednesdays", "thursdays", "fridays", "saturdays", "sundays",
    "daily", "monthly",
]


def ym(d: date) -> tuple[int, int]:
    return (d.year, d.month)


def test_no_repeated_events_after_repeat_until_month():
    r = client.get("/calendar")
    assert r.status_code == 200

    payload = r.json()
    assert "Calendar" in payload
    months = payload["Calendar"]
    assert isinstance(months, list)

    for month in months:
        month_year = month["year"]
        month_num = month["number"]
        month_ym = (month_year, month_num)

        rep = month.get("repeated_events", {})
        assert isinstance(rep, dict)

        for bucket in REPEAT_BUCKETS:
            events = rep.get(bucket, [])
            assert isinstance(events, list)

            for event in events:
                repeat_until = event.get("repeat_until")
                if not repeat_until:
                    continue  # open-ended or not using repeat_until

                until_date = date.fromisoformat(repeat_until)
                # Event may appear in the repeat_until month, but never after it
                assert month_ym <= ym(until_date), (
                    f"Event {event.get('event_id')} appears in {month_year}-{month_num:02d} "
                    f"but repeat_until is {repeat_until} (should not appear after that month)."
                )
