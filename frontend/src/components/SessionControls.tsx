import { useSessionStore } from "../stores/sessionStore";

export function SessionControls() {
  const { status, messages } = useSessionStore();

  const agentMessageCount = messages.filter(
    (m) => m.type === "agent_message"
  ).length;

  return (
    <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-gray-900">Focus Group Session</h2>
        {status === "running" && (
          <span className="flex items-center gap-1.5 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        )}
        {status === "complete" && (
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            Complete
          </span>
        )}
      </div>

      <div className="text-sm text-gray-500">
        {agentMessageCount} messages
      </div>
    </div>
  );
}
