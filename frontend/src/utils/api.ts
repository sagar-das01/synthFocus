import { SessionCreateRequest, SessionCreateResponse } from "../types";
import { supabase } from "../lib/supabase";
import { jsPDF } from "jspdf";

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

export function downloadReportAsPdf(report: string, sessionId: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SynthFocus Report", margin, y);
  y += 12;

  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const lines = report.split("\n");

  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }

    if (line.startsWith("## ")) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(67, 56, 202);
      doc.text(line.slice(3), margin, y);
      y += 7;
      doc.setTextColor(0, 0, 0);
    } else if (line.startsWith("# ")) {
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(line.slice(2), margin, y);
      y += 9;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(`• ${line.slice(2)}`, maxWidth - 5);
      doc.text(wrapped, margin + 5, y);
      y += wrapped.length * 5;
    } else if (line.trim() === "") {
      y += 4;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const clean = line.replace(/\*\*/g, "");
      const wrapped = doc.splitTextToSize(clean, maxWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5;
    }
  }

  doc.save(`synthfocus-report-${sessionId.slice(0, 8)}.pdf`);
}
