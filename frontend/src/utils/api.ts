import { SessionCreateRequest, SessionCreateResponse } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

export async function createSession(
  data: SessionCreateRequest
): Promise<SessionCreateResponse> {
  const response = await fetch(`${BACKEND_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  return response.json();
}
