import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSessionStore } from "../stores/sessionStore";

interface PastSession {
  session_id: string;
  concept: string;
  status: string;
  persona_count: number;
}

export function SessionsPage() {
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { session: authSession, signOut, user } = useAuthStore();
  const { setSessionId, setStatus, setReport } = useSessionStore();
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

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    try {
      const resp = await fetch(`${backendUrl}/api/sessions/${sessionId}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setSessionId(sessionId);
        if (data.report) {
          setReport(data.report);
        } else {
          setStatus("complete");
        }
        navigate("/");
      }
    } catch {
      // ignore
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
                className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm"
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
      </div>
    </div>
  );
}
