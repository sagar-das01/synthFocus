import { SessionCreateRequest, SessionCreateResponse } from "../types";
import { supabase } from "../lib/supabase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createSession(
  data: SessionCreateRequest
): Promise<SessionCreateResponse> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/sessions`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create session: ${err}`);
  }

  return response.json();
}

export async function downloadReportPdf(sessionId: string): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/report/pdf`, {
    headers: { Authorization: `Bearer ${token || ""}` },
  });

  if (!response.ok) {
    throw new Error("Failed to download PDF");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `synthfocus-report-${sessionId.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
