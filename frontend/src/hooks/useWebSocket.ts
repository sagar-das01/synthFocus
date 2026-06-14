import { useCallback, useRef } from "react";
import { useSessionStore } from "../stores/sessionStore";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { addMessage, setCurrentNode, setReport, setError, setStatus } =
    useSessionStore();

  const connect = useCallback(
    (sessionId: string) => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      let wsUrl: string;

      if (backendUrl) {
        const wsBase = backendUrl.replace(/^http/, "ws");
        wsUrl = `${wsBase}/ws/sessions/${sessionId}`;
      } else {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        wsUrl = `${protocol}//${window.location.host}/ws/sessions/${sessionId}`;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("running");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "agent_message":
            addMessage({
              id: crypto.randomUUID(),
              type: "agent_message",
              agent: data.agent,
              content: data.content,
              node: data.node,
              timestamp: data.timestamp,
            });
            break;

          case "node_start":
            setCurrentNode(data.node);
            break;

          case "status":
            if (data.content === "Focus group complete") {
              setStatus("complete");
            }
            addMessage({
              id: crypto.randomUUID(),
              type: "status",
              agent: "system",
              content: data.content,
              node: "",
              timestamp: data.timestamp,
            });
            break;

          case "report":
            setReport(data.content);
            break;

          case "error":
            setError(data.content);
            break;
        }
      };

      ws.onerror = () => {
        setError("WebSocket connection error");
      };

      ws.onclose = () => {
        wsRef.current = null;
      };
    },
    [addMessage, setCurrentNode, setReport, setError, setStatus]
  );

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { connect, disconnect };
}
