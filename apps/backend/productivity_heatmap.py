import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from supabase import create_client

# 1. INITIALIZE CONNECTION
url = "https://nhurxywtrrajauwqnkut.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odXJ4eXd0cnJhamF1d3Fua3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTQ4MDgsImV4cCI6MjA4NTk3MDgwOH0.MGc0XNthuZt5r_H7vRS7N0m75sNuh7PX40HxkRpEMY0"
supabase_client = create_client(url, key)

# 2. GLOBAL STYLING
plt.close('all')
sns.reset_orig()
plt.style.use('dark_background')


def create_productivity_heatmap(target_name="Michael Vick"):
    # 3. DATA FETCH (FIXED: Changed user_id to uuid)
    # This matches your Supabase 'productivity' table schema
    response = supabase_client.table("productivity") \
        .select("dates, productivity_score, name, uuid") \
        .ilike("name", f"%{target_name}%") \
        .execute()

    if not response.data:
        print(f"❌ No ProLifIQ data found for {target_name}. Check the 'productivity' table.")
        return

    # 4. DATA PROCESSING
    df = pd.DataFrame(response.data)
    df['dates'] = pd.to_datetime(df['dates'])
    df['Week'] = df['dates'].dt.isocalendar().week
    df['Day'] = df['dates'].dt.day_name()

    # Aggregating scores by day/week
    pivot = df.pivot_table(
        index='Day',
        columns='Week',
        values='productivity_score',
        aggfunc='sum'
    ).fillna(0)

    # Standard Mon-Sun order
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    pivot = pivot.reindex([d for d in day_order if d in pivot.index])

    # 5. THE "PROLIFIQ" HEATMAP COLORS
    # This prevents the "Pink" glitch by anchoring 0 to a deep red.
    heat_colors = [
        '#4d0000',  # 0: Darkest Red
        '#cc0000',  # Low: True Red
        '#ff4d4d',  # Mid: Light Red
        '#ff8c00',  # High: Orange
        '#ffd700'  # Peak: Gold
    ]
    custom_cmap = LinearSegmentedColormap.from_list("prolifiq_fire", heat_colors)

    # 6. RENDER
    plt.figure(figsize=(15, 6))

    sns.heatmap(
        pivot,
        cmap=custom_cmap,
        annot=True,
        fmt=".0f",
        vmin=0,  # Forces Dark Red at zero
        vmax=100,  # Cap for Gold intensity
        linewidths=1.8,
        linecolor='#1a1a1a'
    )

    plt.title(f"PROLIFIQ PERFORMANCE: {target_name.upper()}", fontsize=18, fontweight='bold', pad=30)
    plt.ylabel("")
    plt.xlabel("Calendar Week Number", fontsize=12, labelpad=15)
    plt.xticks(rotation=0)

    plt.tight_layout()
    plt.show()


# 7. EXECUTION
if __name__ == "__main__":
    create_productivity_heatmap()