import ReactMarkdown from "react-markdown";
import { useSessionStore } from "../stores/sessionStore";

export function ReportView() {
  const { report } = useSessionStore();

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Focus Group Report
          </h2>
          <button
            onClick={() => useSessionStore.getState().reset()}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            New Session
          </button>
        </div>

        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>

        <div className="mt-6 pt-4 border-t flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(report)}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Copy Report
          </button>
          <button
            onClick={() => useSessionStore.getState().reset()}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
