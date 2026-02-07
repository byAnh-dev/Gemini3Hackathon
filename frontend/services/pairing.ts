import { API_BASE } from "../constants";

export async function confirmPair(pairCode: string, idToken: string) {
  const res = await fetch(`${API_BASE}/pair/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ pairCode }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Pair confirm failed");
  return data;
}
