import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSessionStore } from "../stores/sessionStore";
import { AgentMessage } from "../types";

interface PastSession {
  session_id: string;
  concept: string;
  status: string;
  persona_count: number;
}

export function SessionsPage() {
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSession, setLoadingSession] = useState(false);
  const { session: authSession, signOut, user } = useAuthStore();
  const { setSessionId, setStatus, setReport, setMessages } = useSessionStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const token = authSession?.access_token;
    if (!token) return;

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    try {
      const resp = await fetch(`${backendUrl}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    const token = authSession?.access_token;
    if (!token) return;

    setLoadingSession(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";

    try {
      const [reportResp, messagesResp] = await Promise.all([
        fetch(`${backendUrl}/api/sessions/${sessionId}/report`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/sessions/${sessionId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSessionId(sessionId);

      if (messagesResp.ok) {
        const msgData = await messagesResp.json();
        const messages: AgentMessage[] = (msgData.messages || []).map(
          (m: { id: string; type: string; agent: string; content: string; node: string; created_at: string }) => ({
            id: m.id,
            type: m.type as AgentMessage["type"],
            agent: m.agent,
            content: m.content,
            node: m.node || "",
            timestamp: m.created_at,
          })
        );
        setMessages(messages);
      }

      if (reportResp.ok) {
        const reportData = await reportResp.json();
        if (reportData.report) {
          setReport(reportData.report);
        }
      }

      setStatus("complete");
      navigate("/");
    } catch {
      // ignore
    } finally {
      setLoadingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <header className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          &larr; Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border border-gray-300 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Past Sessions</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No past sessions found.</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start a Focus Group
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <button
                key={s.session_id}
                onClick={() => handleSelectSession(s.session_id)}
                disabled={loadingSession}
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[70%]">
                    {s.concept}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      s.status === "complete"
                        ? "bg-green-100 text-green-700"
                        : s.status === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {s.persona_count} personas
                </p>
              </button>
            ))}
          </div>
        )}

        {loadingSession && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading session...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
