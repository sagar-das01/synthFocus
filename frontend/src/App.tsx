import { useSessionStore } from "./stores/sessionStore";
import { ConceptUpload } from "./components/ConceptUpload";
import { DiscussionPanel } from "./components/DiscussionPanel";
import { ParticipantSidebar } from "./components/ParticipantSidebar";
import { SessionControls } from "./components/SessionControls";
import { ReportView } from "./components/ReportView";

function App() {
  const { status, report } = useSessionStore();

  if (status === "idle" || status === "creating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-8">
        <ConceptUpload />
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

export default App;
