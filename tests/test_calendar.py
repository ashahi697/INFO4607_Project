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

test_user_id = "03d78572-f213-4584-b8b2-e1a34dd1c030"

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
    r = client.get("/calendar", params={"userID": test_user_id})
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
    r = client.get("/calendar", params={"userID": test_user_id})
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

def test_repeated_events_appear_in_correct_buckets():
    r = client.get("/calendar", params={"userID": test_user_id})
    assert r.status_code == 200

    payload = r.json()
    assert "Calendar" in payload
    months = payload["Calendar"]
    assert isinstance(months, list)

    for month in months:
        rep = month.get("repeated_events", {})
        assert isinstance(rep, dict)

        for bucket in REPEAT_BUCKETS:
            events = rep.get(bucket, [])
            assert isinstance(events, list)

            for event in events:
                frequency = event.get("recurrences", {}).get("frequency")
                if bucket == "daily":
                    assert frequency == "DAILY", f"Event {event.get('event_id')} in 'daily' bucket has frequency {frequency}"
                elif bucket == "monthly":
                    assert frequency == "MONTHLY", f"Event {event.get('event_id')} in 'monthly' bucket has frequency {frequency}"
                else:
                    expected_freq = bucket.upper()  # e.g. "mondays" -> "MONDAY"
                    assert frequency == expected_freq, f"Event {event.get('event_id')} in '{bucket}' bucket has frequency {frequency}"


def test_create_and_delete_event():
    new_event = {
        "title": "Test Event",
        "description": "This is a test event.",
        "start_time": "00:00-07:00",
        "end_time": "07:00-07:00",
        "start_date": "2026-03-01",
        "end_date": None,
        "recurrences": None,
        "repeat_until": None
    }

    r = client.post("/create_event", json=new_event, params={"userID": test_user_id})
    assert r.status_code == 200
    payload = r.json()
    assert "message" in payload

    # if message is a list of inserted rows:
    event_id = str(payload["message"][0]["event_id"])
    assert event_id is not None
    
    data = r.json()
    assert isinstance(data, dict)
    assert "message" in data
    assert data["message"] is not None

    print("event_id:", event_id, type(event_id))
    r2 = client.delete("/delete_event", params={"userID": test_user_id, "event_id": event_id})
    assert r2.status_code == 200
    data2 = r2.json()
    assert isinstance(data2, dict)
    r3 = client.get("/calendar_event", params={"userID": test_user_id, "event_id": event_id})
    assert r3.status_code == 404

def test_edit_event():
    # First, create a new event to edit
    new_event = {
        "title": "Event to Edit",
        "description": "This event will be edited.",
        "start_time": "00:00:00-07:00",
        "end_time": "07:00:00-07:00",
        "start_date": "2026-03-01",
        "end_date": None,
        "recurrences": None,
        "repeat_until": None
    }

    r = client.post("/create_event", json=new_event, params={"userID": test_user_id})
    assert r.status_code == 200
    payload = r.json()
    event_id = str(payload["message"][0]["event_id"])
    assert event_id is not None

    # Now edit the event
    updated_event = {
        "title": "Edited Event Title",
        "description": "The event description has been updated.",
        "start_time": "01:00:00-07:00",
        "end_time": "08:00:00-07:00",
        "start_date": "2026-03-02",
        "end_date": None,
        "recurrences": None,
        "repeat_until": None
    }

    r2 = client.put("/edit_event", json=updated_event, params={"userID": test_user_id, "event_id": event_id})
    assert r2.status_code == 200

    # Fetch the event and verify changes
    r3 = client.get("/calendar_event", params={"userID": test_user_id, "event_id": event_id})
    assert r3.status_code == 200
    data3 = r3.json()
    assert isinstance(data3, dict)
    event_row = data3["Calendar"][0]

    assert event_row["title"] == updated_event["title"]
    assert event_row["description"] == updated_event["description"]
    # times come back normalized w/ seconds
    assert event_row["start_time"].startswith("01:00")
    assert event_row["end_time"].startswith("08:00")
    assert event_row["start_date"] == updated_event["start_date"]
    
    r4 = client.delete("/delete_event", params={"userID": test_user_id, "event_id": event_id})
    assert r4.status_code == 200

