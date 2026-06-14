import { useEffect, useRef } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { MessageBubble } from "./MessageBubble";

export function DiscussionPanel() {
  const { messages, currentNode, status } = useSessionStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const nodeLabel: Record<string, string> = {
    moderator: "Moderator is guiding the discussion...",
    persona_round: "Personas are responding...",
    devil_advocate: "Devil's Advocate is challenging...",
    analyst_check: "Analyst is evaluating coverage...",
    analyst_report: "Analyst is generating the report...",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {status === "running" && currentNode && (
        <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-500 flex items-center gap-2">
          <span className="animate-pulse w-2 h-2 rounded-full bg-indigo-500"></span>
          {nodeLabel[currentNode] || "Processing..."}
        </div>
      )}
    </div>
  );
}
