import { create } from "zustand";
import { AgentMessage, PersonaConfig, SessionState } from "../types";

interface SessionActions {
  setSessionId: (id: string) => void;
  setStatus: (status: SessionState["status"]) => void;
  addMessage: (message: AgentMessage) => void;
  setCurrentNode: (node: string | null) => void;
  setReport: (report: string) => void;
  setError: (error: string) => void;
  setPersonas: (personas: PersonaConfig[]) => void;
  addPersona: (persona: PersonaConfig) => void;
  removePersona: (index: number) => void;
  updatePersona: (index: number, persona: PersonaConfig) => void;
  setIncludeModerator: (v: boolean) => void;
  setIncludeDevilAdvocate: (v: boolean) => void;
  setIncludeAnalyst: (v: boolean) => void;
  reset: () => void;
}

const initialState: SessionState = {
  sessionId: null,
  status: "idle",
  messages: [],
  currentNode: null,
  report: null,
  error: null,
  personas: [],
  includeModerator: true,
  includeDevilAdvocate: true,
  includeAnalyst: true,
};

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  ...initialState,

  setSessionId: (id) => set({ sessionId: id }),
  setStatus: (status) => set({ status }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setCurrentNode: (node) => set({ currentNode: node }),
  setReport: (report) => set({ report, status: "complete" }),
  setError: (error) => set({ error, status: "error" }),
  setPersonas: (personas) => set({ personas }),
  addPersona: (persona) =>
    set((state) => ({ personas: [...state.personas, persona] })),
  removePersona: (index) =>
    set((state) => ({
      personas: state.personas.filter((_, i) => i !== index),
    })),
  updatePersona: (index, persona) =>
    set((state) => ({
      personas: state.personas.map((p, i) => (i === index ? persona : p)),
    })),
  setIncludeModerator: (v) => set({ includeModerator: v }),
  setIncludeDevilAdvocate: (v) => set({ includeDevilAdvocate: v }),
  setIncludeAnalyst: (v) => set({ includeAnalyst: v }),
  reset: () => set(initialState),
}));
