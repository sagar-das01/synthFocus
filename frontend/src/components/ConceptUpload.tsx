import { useState } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { createSession } from "../utils/api";
import { PersonaConfig } from "../types";
import { SessionHistory } from "./SessionHistory";

const EMPTY_PERSONA: PersonaConfig = {
  name: "",
  role: "",
  background: "",
  values: [],
  pain_points: [],
  communication_style: "",
};

export function ConceptUpload() {
  const [concept, setConcept] = useState("");
  const [maxRounds, setMaxRounds] = useState(5);
  const [showPersonaBuilder, setShowPersonaBuilder] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingPersona, setEditingPersona] = useState<PersonaConfig>(EMPTY_PERSONA);
  const [valuesInput, setValuesInput] = useState("");
  const [painPointsInput, setPainPointsInput] = useState("");

  const {
    personas,
    includeModerator,
    includeDevilAdvocate,
    includeAnalyst,
    addPersona,
    removePersona,
    setIncludeModerator,
    setIncludeDevilAdvocate,
    setIncludeAnalyst,
    setSessionId,
    setStatus,
  } = useSessionStore();
  const { connect } = useWebSocket();

  const handleAddPersona = () => {
    if (!editingPersona.name.trim() || !editingPersona.role.trim()) return;

    addPersona({
      ...editingPersona,
      values: valuesInput
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      pain_points: painPointsInput
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    });
    setEditingPersona(EMPTY_PERSONA);
    setValuesInput("");
    setPainPointsInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setStatus("creating");

    try {
      const session = await createSession({
        concept,
        personas: personas.length > 0 ? personas : undefined,
        include_moderator: includeModerator,
        include_devil_advocate: includeDevilAdvocate,
        include_analyst: includeAnalyst,
        max_rounds: maxRounds,
      });
      setSessionId(session.session_id);
      await connect(session.session_id);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">SynthFocus</h1>
        <p className="text-lg text-gray-600">
          AI-powered synthetic focus groups. Configure your agent panel and get
          instant market feedback.
        </p>
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          View Past Sessions
        </button>
      </div>

      {showHistory && (
        <SessionHistory
          onSelect={(id) => {
            setShowHistory(false);
            setSessionId(id);
            setStatus("complete");
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Concept */}
        <div>
          <label
            htmlFor="concept"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Product Concept
          </label>
          <textarea
            id="concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Describe your product idea, pitch, or concept. Be as specific as possible — include target audience, key features, pricing model, etc."
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* System Agents Toggle */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            System Agents
          </h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeModerator}
                onChange={(e) => setIncludeModerator(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">Moderator</span>
              <span className="text-xs text-gray-400">(guides discussion)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDevilAdvocate}
                onChange={(e) => setIncludeDevilAdvocate(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">Devil's Advocate</span>
              <span className="text-xs text-gray-400">(challenges ideas)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnalyst}
                onChange={(e) => setIncludeAnalyst(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">Analyst</span>
              <span className="text-xs text-gray-400">
                (generates report)
              </span>
            </label>
          </div>
        </div>

        {/* Persona Builder */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Focus Group Personas ({personas.length || "5 default"})
            </h3>
            <button
              type="button"
              onClick={() => setShowPersonaBuilder(!showPersonaBuilder)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {showPersonaBuilder ? "Hide Builder" : "+ Add Custom Personas"}
            </button>
          </div>

          {/* Existing personas list */}
          {personas.length > 0 && (
            <div className="space-y-2 mb-4">
              {personas.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-indigo-50 rounded-lg"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {p.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {p.role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePersona(i)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {personas.length === 0 && !showPersonaBuilder && (
            <p className="text-xs text-gray-500 mb-2">
              Using 5 default personas (Gen-Z Student, Working Parent, Industry
              Veteran, UX Designer, Entrepreneur). Add custom personas to
              override.
            </p>
          )}

          {/* Persona builder form */}
          {showPersonaBuilder && (
            <div className="border-t pt-4 mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editingPersona.name}
                    onChange={(e) =>
                      setEditingPersona({ ...editingPersona, name: e.target.value })
                    }
                    placeholder="e.g. Sarah"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Role / Archetype *
                  </label>
                  <input
                    type="text"
                    value={editingPersona.role}
                    onChange={(e) =>
                      setEditingPersona({ ...editingPersona, role: e.target.value })
                    }
                    placeholder="e.g. Healthcare Professional"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Background
                </label>
                <input
                  type="text"
                  value={editingPersona.background}
                  onChange={(e) =>
                    setEditingPersona({
                      ...editingPersona,
                      background: e.target.value,
                    })
                  }
                  placeholder="e.g. 10 years in hospital administration, tech-averse, manages 50-person team"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Values (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={valuesInput}
                    onChange={(e) => setValuesInput(e.target.value)}
                    placeholder="e.g. reliability, compliance, ease of use"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Pain Points (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={painPointsInput}
                    onChange={(e) => setPainPointsInput(e.target.value)}
                    placeholder="e.g. complex software, long onboarding"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Communication Style
                </label>
                <input
                  type="text"
                  value={editingPersona.communication_style}
                  onChange={(e) =>
                    setEditingPersona({
                      ...editingPersona,
                      communication_style: e.target.value,
                    })
                  }
                  placeholder="e.g. Formal, asks about compliance, risk-averse"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPersona}
                disabled={!editingPersona.name.trim() || !editingPersona.role.trim()}
                className="w-full py-2 px-4 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Persona to Group
              </button>
            </div>
          )}
        </div>

        {/* Rounds */}
        <div>
          <label
            htmlFor="rounds"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Discussion Rounds: {maxRounds}
          </label>
          <input
            id="rounds"
            type="range"
            min={2}
            max={8}
            value={maxRounds}
            onChange={(e) => setMaxRounds(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Quick (2)</span>
            <span>Deep (8)</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!concept.trim()}
          className="w-full py-3 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Start Focus Group
        </button>
      </form>
    </div>
  );
}
