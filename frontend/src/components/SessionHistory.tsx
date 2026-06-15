import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";

interface PastSession {
  session_id: string;
  concept: string;
  status: string;
  persona_count: number;
  created_at: string;
}

interface Props {
  onSelect: (sessionId: string) => void;
  onClose: () => void;
}

export function SessionHistory({ onSelect, onClose }: Props) {
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuthStore();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const token = session?.access_token;
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Past Sessions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No past sessions found.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <button
                key={s.session_id}
                onClick={() => onSelect(s.session_id)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors"
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
