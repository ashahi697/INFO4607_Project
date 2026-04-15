import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from supabase import create_client


# --- HELPER 1: DATA CONNECTION ---
def get_supabase_client():
    url = "https://nhurxywtrrajauwqnkut.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odXJ4eXd0cnJhamF1d3Fua3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTQ4MDgsImV4cCI6MjA4NTk3MDgwOH0.MGc0XNthuZt5r_H7vRS7N0m75sNuh7PX40HxkRpEMY0"
    return create_client(url, key)

# 1. The Weighting Engine
# In a productivity part, not all tasks are equal. A helper function can calculate a "weighted score" based on priority and effort.
def calculate_task_value(priority, effort_level):
    """
    Logic: High Priority (3) + High Effort (3) = 9 points.
    Low Priority (1) + Low Effort (1) = 1 point.
    """
    # You can get fancy with the math here (e.g., exponential growth)
    multiplier = {"High": 3, "Medium": 2, "Low": 1}

    p_val = multiplier.get(priority, 1)
    e_val = multiplier.get(effort_level, 1)

    return p_val * e_val

# 2. The Score Aggregator
# This helper takes all the tasks a user finished in a day and turns them into that single 0–100 score we use for the heatmap.

def normalize_daily_score(task_list, daily_goal=50):
    """
    Takes a list of completed task values and caps the score at 100.
    Benefit: Prevents 'God Mode' scores from breaking the heatmap scale.
    """
    total_points = sum(task['value'] for task in task_list)

    # Calculate percentage of daily goal reached
    raw_score = (total_points / daily_goal) * 100

    return min(raw_score, 100)  # Caps at 100 for the 'Gold' zone

# 3. The Smart Scheduler
# This is where the "IQ" in ProLifIQ comes from. This helper looks at a list of tasks and sorts them by "ROI" (Return on Investment).

def get_priority_queue(tasks):
    """
    Sorts tasks so the user sees High Priority/Low Effort tasks first.
    (The 'Quick Wins' strategy).
    """
    # Sort by priority (descending) then effort (ascending)
    return sorted(tasks, key=lambda x: (-x['priority_val'], x['effort_val']))

# How these fit into your Backend
# When you combine these helpers, your main execution flow looks clean and professional:

def process_user_day(uuid, date):
    # 1. Fetch raw tasks from Supabase
    raw_tasks = supabase.table("tasks").select("*").eq("uuid", uuid).eq("created_at", date).execute()

    # 2. Helper: Calculate value for each task
    for task in raw_tasks.data:
        task['value'] = calculate_task_value(task['priority'], task['effort'])

    # 3. Helper: Get the final Heatmap-ready score
    daily_score = normalize_daily_score(raw_tasks.data)

    # 4. Upload to the 'productivity' table for the Heatmap to read
    supabase.table("productivity").insert({
        "uuid": uuid,
        "dates": date,
        "productivity_score": daily_score
    }).execute()