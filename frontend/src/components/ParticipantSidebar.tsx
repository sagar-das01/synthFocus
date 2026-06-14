import { useSessionStore } from "../stores/sessionStore";

const COLORS = [
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-amber-500",
  "bg-rose-500",
];

const DEFAULT_PERSONA_NAMES = ["Jordan", "Maria", "Derek", "Priya", "Marcus"];

export function ParticipantSidebar() {
  const {
    currentNode,
    status,
    personas,
    includeModerator,
    includeDevilAdvocate,
    includeAnalyst,
  } = useSessionStore();

  const personaNames =
    personas.length > 0
      ? personas.map((p) => p.name)
      : DEFAULT_PERSONA_NAMES;

  const participants: { name: string; role: string; color: string }[] = [];

  if (includeModerator) {
    participants.push({ name: "Moderator", role: "Facilitator", color: "bg-blue-500" });
  }

  personaNames.forEach((name, i) => {
    const role =
      personas.length > 0
        ? personas[i]?.role || "Participant"
        : ["Gen-Z Student", "Working Parent", "Industry Veteran", "UX Designer", "Entrepreneur"][i];
    participants.push({ name, role, color: COLORS[i % COLORS.length] });
  });

  if (includeDevilAdvocate) {
    participants.push({ name: "Devil's Advocate", role: "Challenger", color: "bg-red-500" });
  }

  if (includeAnalyst) {
    participants.push({ name: "Analyst", role: "Observer", color: "bg-indigo-500" });
  }

  const activeAgents: Record<string, string[]> = {
    moderator: ["Moderator"],
    persona_round: personaNames,
    devil_advocate: ["Devil's Advocate"],
    analyst_check: ["Analyst"],
    analyst_report: ["Analyst"],
  };

  const active = currentNode ? activeAgents[currentNode] || [] : [];

  return (
    <div className="w-64 bg-white border-l p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Participants ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map((p) => (
          <div
            key={p.name}
            className={`flex items-center gap-2 px-2 py-1.5 rounded ${
              active.includes(p.name) ? "bg-gray-100 ring-1 ring-indigo-200" : ""
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.color} ${
                active.includes(p.name) ? "animate-pulse" : ""
              }`}
            ></span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {p.name}
              </div>
              <div className="text-xs text-gray-500 truncate">{p.role}</div>
            </div>
          </div>
        ))}
      </div>

      {status === "running" && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500">Status</div>
          <div className="text-sm font-medium text-indigo-600">In Progress</div>
        </div>
      )}

      {status === "complete" && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500">Status</div>
          <div className="text-sm font-medium text-green-600">Complete</div>
        </div>
      )}
    </div>
  );
}
