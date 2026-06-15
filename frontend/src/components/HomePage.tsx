import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useSessionStore } from "../stores/sessionStore";
import { ConceptUpload } from "./ConceptUpload";
import { DiscussionPanel } from "./DiscussionPanel";
import { ParticipantSidebar } from "./ParticipantSidebar";
import { SessionControls } from "./SessionControls";
import { ReportView } from "./ReportView";

export function HomePage() {
  const { signOut, user } = useAuthStore();
  const { status, report } = useSessionStore();
  const navigate = useNavigate();

  if (status === "idle" || status === "creating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <header className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/sessions")}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Past Sessions
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
        <div className="flex items-center justify-center p-8">
          <ConceptUpload />
        </div>
        {status === "creating" && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Setting up your focus group...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <SessionControls />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <DiscussionPanel />
        </div>
        <ParticipantSidebar />
      </div>
      {report && <ReportView />}
    </div>
  );
}
