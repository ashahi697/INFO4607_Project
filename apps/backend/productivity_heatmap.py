import pandas as pd
import seaborn as sns
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from pathlib import Path
import traceback

# 1. INITIALIZE CONNECTION
# url = "https://nhurxywtrrajauwqnkut.supabase.co"
# key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5odXJ4eXd0cnJhamF1d3Fua3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTQ4MDgsImV4cCI6MjA4NTk3MDgwOH0.MGc0XNthuZt5r_H7vRS7N0m75sNuh7PX40HxkRpEMY0"
# supabase_client = create_client(url, key)

# 2. GLOBAL STYLING


def create_productivity_heatmap(prod_scores):
    output_dir = Path(__file__).resolve().parent / "generated"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "heatmap.png"
    print(f"[heatmap] output_dir={output_dir}")
    print(f"[heatmap] output_path={output_path}")
    print(f"[heatmap] input_rows={len(prod_scores or [])}")

    if not prod_scores:
        plt.close('all')
        sns.reset_orig()
        plt.style.use('dark_background')
        fig = plt.figure(figsize=(10, 4))
        plt.text(0.5, 0.5, "No productivity data in selected range", ha="center", va="center", fontsize=14)
        plt.axis("off")
        plt.tight_layout()
        fig.savefig(output_path, dpi=200, bbox_inches="tight")
        plt.close(fig)
        print(f"[heatmap] no-data image written: {output_path.exists()} at {output_path}")
        return {
            "days": [],
            "weeks": [],
            "values": [],
            "image_path": str(output_path)
        }

    try:
        plt.close('all')
        sns.reset_orig()
        plt.style.use('dark_background')

        # 4. DATA PROCESSING
        df = pd.DataFrame(prod_scores)
        df['dates'] = pd.to_datetime(df['dates'])
        df['Week'] = df['dates'].dt.isocalendar().week
        df['Day'] = df['dates'].dt.day_name()
        print(f"[heatmap] dataframe_rows={len(df)}")

        # Aggregating scores by day/week
        pivot = df.pivot_table(
            index='Day',
            columns='Week',
            values='productivity_score',
            aggfunc='sum'
        ).fillna(0)
        print(f"[heatmap] pivot_shape={pivot.shape}")

        # Standard Mon-Sun order
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        pivot = pivot.reindex([d for d in day_order if d in pivot.index])

        # 5. THE "PROLIFIQ" HEATMAP COLORS
        heat_colors = [
            '#4d0000',
            '#cc0000',
            '#ff4d4d',
            '#ff8c00',
            '#ffd700'
        ]
        custom_cmap = LinearSegmentedColormap.from_list("prolifiq_fire", heat_colors)

        # 6. RENDER
        fig = plt.figure(figsize=(15, 6))
        sns.heatmap(
            pivot,
            cmap=custom_cmap,
            annot=True,
            fmt=".0f",
            vmin=0,
            vmax=100,
            linewidths=1.8,
            linecolor='#1a1a1a'
        )

        plt.title(f"PROLIFIQ PERFORMANCE", fontsize=18, fontweight='bold', pad=30)
        plt.ylabel("")
        plt.xlabel("Calendar Week Number", fontsize=12, labelpad=15)
        plt.xticks(rotation=0)
        plt.tight_layout()

        values = []
        for day in pivot.index:
            row = []
            for week in pivot.columns:
                row.append(float(pivot.loc[day, week]))
            values.append(row)

        fig.savefig(output_path, dpi=200, bbox_inches="tight")
        plt.close(fig)
        print(f"[heatmap] image written: {output_path.exists()} at {output_path}")

        return {
            "days": [str(day) for day in pivot.index],
            "weeks": [int(week) for week in pivot.columns],
            "values": values,
            "image_path": str(output_path)
        }
    except Exception as e:
        print(f"[heatmap] ERROR: {e}")
        print(traceback.format_exc())
        fig = plt.figure(figsize=(10, 4))
        plt.text(0.5, 0.5, f"Heatmap error: {e}", ha="center", va="center", fontsize=10)
        plt.axis("off")
        plt.tight_layout()
        fig.savefig(output_path, dpi=200, bbox_inches="tight")
        plt.close(fig)
        print(f"[heatmap] error image written: {output_path.exists()} at {output_path}")
        return {
            "days": [],
            "weeks": [],
            "values": [],
            "image_path": str(output_path),
            "error": str(e)
        }
