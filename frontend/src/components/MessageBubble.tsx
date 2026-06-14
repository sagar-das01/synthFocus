import { AgentMessage } from "../types";

const AGENT_COLORS: Record<string, string> = {
  Moderator: "bg-blue-100 border-blue-300 text-blue-900",
  Jordan: "bg-green-100 border-green-300 text-green-900",
  Maria: "bg-yellow-100 border-yellow-300 text-yellow-900",
  Derek: "bg-purple-100 border-purple-300 text-purple-900",
  Priya: "bg-pink-100 border-pink-300 text-pink-900",
  Marcus: "bg-orange-100 border-orange-300 text-orange-900",
  "Devil's Advocate": "bg-red-100 border-red-300 text-red-900",
  Analyst: "bg-indigo-100 border-indigo-300 text-indigo-900",
  system: "bg-gray-100 border-gray-300 text-gray-700",
};

const AGENT_BADGES: Record<string, string> = {
  Moderator: "Moderator",
  Jordan: "Gen-Z Student",
  Maria: "Working Parent",
  Derek: "Industry Veteran",
  Priya: "UX Designer",
  Marcus: "Entrepreneur",
  "Devil's Advocate": "Challenger",
  Analyst: "Analyst",
  system: "System",
};

interface Props {
  message: AgentMessage;
}

export function MessageBubble({ message }: Props) {
  const colorClass = AGENT_COLORS[message.agent] || AGENT_COLORS.system;
  const badge = AGENT_BADGES[message.agent] || message.agent;

  if (message.type === "status") {
    return (
      <div className="flex justify-center my-3">
        <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${colorClass} mb-3`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-sm">{message.agent}</span>
        <span className="text-xs opacity-70 px-2 py-0.5 rounded-full bg-white/50">
          {badge}
        </span>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>
    </div>
  );
}
