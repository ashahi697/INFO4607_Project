import { useEffect, useState } from "react";
import { userID } from "../../App";
import { fetchUserName } from "../../lib/user-name";

export default function Topbar() {
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    let isActive = true;

    const loadUserName = async () => {
      const name = await fetchUserName(userID);
      if (isActive) setDisplayName(name);
    };

    loadUserName();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <header className="w-full h-16 border-b bg-white flex items-center justify-between px-6">
      <input
        className="border rounded px-3 py-2 w-[420px]"
        placeholder="Search transactions, tasks, events..."
      />

      <div className="flex items-center gap-4">
        <button aria-label="Notifications">🔔</button>
        <button aria-label="Messages">✉️</button>
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <div className="font-medium">{displayName}</div>
            <div className="text-gray-500 text-xs">Premium Plan</div>
          </div>
        </div>
      </div>
    </header>
  );
}
