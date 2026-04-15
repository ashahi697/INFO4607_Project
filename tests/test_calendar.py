# tests/test_calendar_builder.py
from datetime import date
from fastapi.testclient import TestClient
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "backend"))

# from apps.backend.app import app
# from apps.backend.dataTypes import Calendar

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


#### Transaction Tests ####

def test_create_edit_delete_transaction():
    new_txn = {
        "amount": 19.99,
        "txn_date": "2026-03-01",
        "merchant": "Test Merchant",
        "note": "This is a test transaction.",
        "account_id": None,
        "category_id": None,
        "positive": False
    }

    r = client.post("/create_transaction", json=new_txn, params={"userID": test_user_id})
    assert r.status_code == 200
    payload = r.json()
    assert "message" in payload
    txn_id = str(payload["message"][0]["txn_id"])
    assert txn_id is not None

    updated_txn = {
        "amount": 29.99,
        "txn_date": "2026-03-02",
        "merchant": "Updated Merchant",
        "note": "This transaction has been updated.",
        "account_id": None,
        "category_id": None,
        "positive": False
    }
    r2 = client.put("/edit_transaction", json=updated_txn, params={"userID": test_user_id, "transaction_id": txn_id})
    assert r2.status_code == 200
    assert r2.json().get("message") is not None
    data = r2.json()
    assert isinstance(data, dict)
    transaction = data["message"][0]
    assert transaction["amount"] == updated_txn["amount"]
    assert transaction["txn_date"] == updated_txn["txn_date"]
    assert transaction["merchant"] == updated_txn["merchant"]
    assert transaction["note"] == updated_txn["note"]

    r3 = client.delete("/delete_transaction", params={"userID": test_user_id, "transaction_id": txn_id})   
    assert r3.status_code == 200
    assert r3.json().get("message") is not None

    r4 = client.get("/get_transactions", params={"userID": test_user_id})
    assert r4.status_code == 200
    transactions = r4.json().get("transactions", [])
    assert all(txn["txn_id"] != txn_id for txn in transactions), "Deleted transaction still appears in transaction list"


def test_create_edit_delete_task():
    new_task = {
        "task_name": "Test Task",
        "priority_weight": 3,
        "created_at": "2026-04-07",
        "completed_date": "2026-04-07",
        "name": "Test User",
    }

    r = client.post("/create_task", json=new_task, params={"userID": test_user_id})
    assert r.status_code == 200
    payload = r.json()
    assert "message" in payload
    task_id = int(payload["message"][0]["id"])
    assert task_id is not None

    created_task = payload["message"][0]
    assert created_task["task_name"] == new_task["task_name"]
    assert created_task["priority_weight"] == new_task["priority_weight"]
    assert created_task["created_at"] == new_task["created_at"]
    assert created_task["completed_date"] is None
    assert created_task["name"] == new_task["name"]

    updated_task = {
        "task_name": "Updated Test Task",
        "priority_weight": 5,
        "created_at": "2026-04-07",
        "completed_date": "2026-04-08",
        "name": "Updated User",
    }

    r2 = client.put("/edit_task", json=updated_task, params={"userID": test_user_id, "task_id": task_id})
    assert r2.status_code == 200
    assert r2.json().get("message") is not None
    data = r2.json()
    assert isinstance(data, dict)
    task = data["message"][0]
    assert task["task_name"] == updated_task["task_name"]
    assert task["priority_weight"] == updated_task["priority_weight"]
    assert task["created_at"] == updated_task["created_at"]
    assert task["completed_date"] == updated_task["completed_date"]
    assert task["name"] == updated_task["name"]

    r3 = client.delete("/delete_task", params={"userID": test_user_id, "task_id": task_id})
    assert r3.status_code == 200
    assert r3.json().get("message") is not None

    r4 = client.get("/get_tasks", params={"userID": test_user_id})
    assert r4.status_code == 200
    tasks = r4.json().get("tasks", [])
    assert all(int(task["id"]) != task_id for task in tasks), "Deleted task still appears in task list"


def test_productivity_score_updates_when_tasks_completed():
    target_date = date.fromordinal(date.today().toordinal() + 4000).isoformat()
    created_task_ids = []
    priorities = [1, 2, 3, 4]

    def get_score_for_date() -> int:
        r_prod = client.get("/get_productivity", params={"userID": test_user_id})
        assert r_prod.status_code == 200
        rows = r_prod.json().get("productivity", [])
        matching = [row for row in rows if str(row.get("dates", "")).startswith(target_date)]
        if not matching:
            return 0
        return int(matching[0]["productivity_score"])

    baseline_score = get_score_for_date()

    try:
        # Create several tasks on the same day
        for i, priority in enumerate(priorities):
            new_task = {
                "task_name": f"Prod Test Task {i+1}",
                "priority_weight": priority,
                "created_at": target_date,
                "completed_date": None,
                "name": "Prod Test User",
            }
            r = client.post("/create_task", json=new_task, params={"userID": test_user_id})
            assert r.status_code == 200
            payload = r.json()
            task_id = int(payload["message"][0]["id"])
            created_task_ids.append(task_id)

        # Complete all but one
        for task_id in created_task_ids[:-1]:
            r = client.put("/complete_task", params={"userID": test_user_id, "task_id": task_id, "completed_date": target_date})
            assert r.status_code == 200

        score_after_partial = get_score_for_date()
        assert score_after_partial - baseline_score == (priorities[0] + priorities[1] + priorities[2]) * 5

        # Complete final task and verify score changes and increases
        final_task_id = created_task_ids[-1]
        r2 = client.put("/complete_task", params={"userID": test_user_id, "task_id": final_task_id, "completed_date": target_date})
        assert r2.status_code == 200

        score_after_full = get_score_for_date()
        assert score_after_full - baseline_score == (priorities[0] + priorities[1] + priorities[2] + priorities[3]) * 5
        assert score_after_full > score_after_partial

        # Mark one completed task as incomplete and verify score goes down
        task_to_revert = created_task_ids[0]
        reverted_priority = priorities[0]
        r3 = client.put("/incomplete_task", params={"userID": test_user_id, "task_id": task_to_revert})
        assert r3.status_code == 200

        score_after_revert = get_score_for_date()
        assert score_after_revert == score_after_full - (reverted_priority * 5)
        assert score_after_revert < score_after_full
    finally:
        for task_id in created_task_ids:
            client.delete("/delete_task", params={"userID": test_user_id, "task_id": task_id})
        client.delete(
            "/delete_productivity",
            params={"userID": test_user_id, "productivity_date": target_date}
        )


def test_create_edit_delete_productivity():
    new_prod = {
        "dates": "2099-12-31T00:00:00",
        "task_weight": 10,
        "focused_time": 25,
        "tasks_completed": 2
    }

    r = client.post("/create_productivity", json=new_prod, params={"userID": test_user_id})
    assert r.status_code == 200
    payload = r.json()
    assert "message" in payload
    created_row = payload["message"][0]
    assert created_row["dates"].startswith("2099-12-31")
    assert created_row["task_weight"] == new_prod["task_weight"]
    assert created_row["focused_time"] == new_prod["focused_time"]
    assert created_row["tasks_completed"] == new_prod["tasks_completed"]
    assert created_row["productivity_score"] == 0

    updated_prod = {
        "dates": "2100-01-01T00:00:00",
        "task_weight": 15,
        "focused_time": 40,
        "tasks_completed": 3
    }
    r2 = client.put(
        "/edit_productivity",
        json=updated_prod,
        params={"userID": test_user_id, "productivity_date": new_prod["dates"]}
    )
    assert r2.status_code == 200
    data = r2.json()
    assert isinstance(data, dict)
    prod_row = data["message"][0]
    assert prod_row["dates"].startswith("2100-01-01")
    assert prod_row["task_weight"] == updated_prod["task_weight"]
    assert prod_row["focused_time"] == updated_prod["focused_time"]
    assert prod_row["tasks_completed"] == updated_prod["tasks_completed"]
    assert prod_row["productivity_score"] == 0

    r3 = client.delete(
        "/delete_productivity",
        params={"userID": test_user_id, "productivity_date": updated_prod["dates"]}
    )
    assert r3.status_code == 200
    assert r3.json().get("message") is not None

    r4 = client.get("/get_productivity", params={"userID": test_user_id})
    assert r4.status_code == 200
    productivity_rows = r4.json().get("productivity", [])
    assert all(not str(row["dates"]).startswith("2100-01-01") for row in productivity_rows), "Deleted productivity row still appears"


def test_productivity_heatmap_pipeline_basic(capsys):
    r = client.get(
        "/productivity_heatmap",
        params={
            "userID": "03d78572-f213-4584-b8b2-a1a34dd1c030",
            "start_date": "2026-03-16",
            "end_date": "2026-03-22",
        }
    )

    captured = capsys.readouterr()
    with capsys.disabled():
        print("\n--- Heatmap Pipeline Logs ---")
        print(captured.out)
        print("--- End Heatmap Pipeline Logs ---\n")
        if r.status_code != 200:
            print("--- Heatmap Endpoint Error Payload ---")
            print(r.json())
            print("--- End Heatmap Endpoint Error Payload ---")

    assert r.status_code == 200

    data = r.json()
    assert isinstance(data, dict)
    assert "heatmap" in data

    heatmap = data["heatmap"]
    assert isinstance(heatmap, dict)
    assert "days" in heatmap
    assert "weeks" in heatmap
    assert "values" in heatmap
    assert isinstance(heatmap["days"], list)
    assert isinstance(heatmap["weeks"], list)
    assert isinstance(heatmap["values"], list)
