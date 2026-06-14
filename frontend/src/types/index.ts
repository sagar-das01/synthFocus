export interface AgentMessage {
  id: string;
  type: "agent_message" | "stream_token" | "status" | "node_start" | "report" | "error";
  agent: string;
  content: string;
  node: string;
  timestamp: string;
}

export interface PersonaConfig {
  name: string;
  role: string;
  background: string;
  values: string[];
  pain_points: string[];
  communication_style: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface SessionState {
  sessionId: string | null;
  status: "idle" | "creating" | "running" | "complete" | "error";
  messages: AgentMessage[];
  currentNode: string | null;
  report: string | null;
  error: string | null;
  personas: PersonaConfig[];
  includeModerator: boolean;
  includeDevilAdvocate: boolean;
  includeAnalyst: boolean;
}

export interface SessionCreateRequest {
  concept: string;
  personas?: PersonaConfig[];
  include_moderator?: boolean;
  include_devil_advocate?: boolean;
  include_analyst?: boolean;
  max_rounds?: number;
}

export interface SessionCreateResponse {
  session_id: string;
  status: string;
  concept: string;
  persona_count: number;
}
