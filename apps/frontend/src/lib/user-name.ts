export async function fetchUserName(userID: string): Promise<string> {
  try {
    const response = await fetch(`/api/users/${userID}/budget`);
    if (!response.ok) return "User";

    const data = await response.json();
    const budget = data?.budget;

    const nameCandidates = [
      budget?.user_name,
      budget?.userName,
      budget?.Name,
      budget?.name,
    ];

    const resolved = nameCandidates.find(
      (candidate) => typeof candidate === "string" && candidate.trim().length > 0
    );

    return resolved ? String(resolved).trim() : "User";
  } catch (error) {
    console.error("Failed to fetch user name:", error);
    return "User";
  }
}
