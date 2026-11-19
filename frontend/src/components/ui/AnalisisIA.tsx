import { useEffect, useState, type FormEvent } from "react";
import { Sparkles, Play } from "lucide-react";

import AlertaError from "@/components/ui/AlertaError";
import { obtenerMensajeError } from "@/api/partidos";
import type {
  AIAnalysisAction,
  AIAnalysisRequest,
  AIAnalysisResponse,
} from "@/types";

interface Props {
  request: AIAnalysisRequest;
  analysis?: AIAnalysisResponse;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onAsk: (payload: AIAnalysisRequest) => void;
}

const SOURCE_LABELS: Record<AIAnalysisResponse["source"], string> = {
  gemini: "IA Gemini",
  fallback: "Respaldo estadístico",
  guardrail: "Filtro de alcance",
};

const QUICK_ACTIONS: {
  action: AIAnalysisAction;
  label: string;
  hint: string;
}[] = [
  {
    action: "summary",
    label: "Ejecutar análisis completo",
    hint: "Pronóstico, factores clave y alcance del cruce",
  },
  {
    action: "executive_brief",
    label: "Generar resumen ejecutivo",
    hint: "Lectura breve y directa para revisar rápido",
  },
  {
    action: "model_limits",
    label: "Consultar alcance y límites",
    hint: "Qué evalúa el modelo y qué queda fuera",
  },
];

const SUGGESTED_QUESTIONS = [
  "¿Cómo influyen los días de descanso y la racha goleadora en este cruce?",
  "¿Qué pasaría si el local llegara con mejor racha que el visitante?",
  "¿Qué pesa más aquí: las probabilidades del modelo o el historial H2H?",
];

export default function AnalisisIA({
  request,
  analysis,
  isLoading,
  isError,
  error,
  onAsk,
}: Props) {
  const [question, setQuestion] = useState("");
  const [lastTriggeredLabel, setLastTriggeredLabel] = useState<string>(
    "Ejecutar análisis completo",
  );

  useEffect(() => {
    setQuestion("");
    setLastTriggeredLabel("Ejecutar análisis completo");
  }, [request.home, request.away]);

  function runQuickAction(action: AIAnalysisAction, label: string) {
    setLastTriggeredLabel(label);
    onAsk({
      ...request,
      action,
      question: "",
    });
  }

  function handleQuestionSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    setLastTriggeredLabel(`Pregunta: "${trimmed}"`);
    onAsk({
      ...request,
      action: "question",
      question: trimmed,
    });
  }

  return (
    <section
      className="dashboard-panel ai-panel"
      aria-labelledby="ai-analyst-title"
      aria-busy={isLoading}
    >
      <div className="ai-header">
        <h2 id="ai-analyst-title">
          <Sparkles size={20} aria-hidden="true" />
          Analista IA · {request.home} vs. {request.away}
        </h2>

        {analysis && (
          <div className="ai-badges">
            <span className={`ai-badge source-${analysis.source}`}>
              {SOURCE_LABELS[analysis.source]}
            </span>
            {analysis.cached && (
              <span className="ai-badge ai-badge-cached">Caché</span>
            )}
            {analysis.model_used && analysis.source === "gemini" && (
              <span className="ai-badge ai-badge-model">
                {analysis.model_used}
              </span>
            )}
          </div>
        )}
      </div>

      <p className="ai-subtitle">
        Dispara una acción rápida o escribe una pregunta acotada sobre las
        probabilidades, descanso, racha o historial directo de este partido.
      </p>

      <div className="ai-actions-block">
        <span className="ai-block-label">Acciones rápidas</span>
        <div
          className="ai-actions"
          role="group"
          aria-label="Acciones rápidas de análisis"
        >
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.action}
              type="button"
              className="ai-action-btn"
              title={item.hint}
              disabled={isLoading}
              onClick={() => runQuickAction(item.action, item.label)}
            >
              <Play size={13} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ai-question-block">
        <span className="ai-block-label">
          Consulta puntual / escenario hipotético
        </span>

        <div className="ai-suggestions" aria-label="Preguntas sugeridas">
          {SUGGESTED_QUESTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              className="ai-suggestion-pill"
              disabled={isLoading}
              onClick={() => setQuestion(sample)}
            >
              {sample}
            </button>
          ))}
        </div>

        <form className="ai-question-form" onSubmit={handleQuestionSubmit}>
          <label htmlFor="ai-question-input" className="sr-only">
            Pregunta sobre el partido
          </label>
          <input
            id="ai-question-input"
            type="text"
            className="ai-input"
            placeholder="Escribe una duda o supuesto sobre descanso, racha, H2H o límites…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            maxLength={220}
          />
          <button
            type="submit"
            className="calculate-button ai-ask-button"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? "Consultando…" : "Preguntar"}
          </button>
        </form>
      </div>

      {isLoading && (
        <p className="empty-message mt-4" role="status">
          Ejecutando {lastTriggeredLabel}…
        </p>
      )}

      {isError && (
        <div className="mt-4">
          <AlertaError
            title="No se pudo obtener el análisis de IA"
            message={obtenerMensajeError(error)}
          />
        </div>
      )}

      {!isLoading && !isError && analysis && (
        <div className="ai-content">
          <div className="ai-meta-bar">
            <span>
              Última ejecución: <strong>{lastTriggeredLabel}</strong>
            </span>
            <span>
              Modo: <strong>{analysis.action}</strong>
            </span>
          </div>

          <div className="ai-answer-box">
            <strong>Respuesta</strong>
            <p>{analysis.answer}</p>
          </div>

          <div className="ai-sections-grid">
            <article className="ai-section-card">
              <h3>Pronóstico</h3>
              <p>{analysis.sections.pronostico}</p>
            </article>
            <article className="ai-section-card">
              <h3>Factores clave</h3>
              <p>{analysis.sections.factores}</p>
            </article>
            <article className="ai-section-card">
              <h3>Alcance del modelo</h3>
              <p>{analysis.sections.alcance}</p>
            </article>
          </div>
        </div>
      )}
    </section>
  );
}