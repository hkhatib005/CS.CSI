import { useEffect, useState } from "react";
import { getProfessor, postReview, summarizeProfessor } from "../api.js";

export default function ProfessorPanel({ professorId, onClose }) {
  const [prof, setProf] = useState(null);
  const [ai, setAi] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [form, setForm] = useState({ rating: 5, difficulty: 3, body: "" });
  const [error, setError] = useState("");

  const load = () => getProfessor(professorId).then(setProf).catch(console.error);

  useEffect(() => {
    setProf(null);
    setAi(null);
    load();
  }, [professorId]);

  const summarize = () => {
    setAiBusy(true);
    summarizeProfessor(professorId)
      .then(setAi)
      .catch(() => setAi({ source: "error", summary: "Summary unavailable right now." }))
      .finally(() => setAiBusy(false));
  };

  const submit = () => {
    setError("");
    postReview({ professor_id: professorId, ...form })
      .then(() => {
        setForm({ rating: 5, difficulty: 3, body: "" });
        setAi(null);
        load();
      })
      .catch(() => setError("Reviews need at least 10 characters."));
  };

  return (
    <div className="panel-backdrop" onClick={onClose}>
      <aside className="panel" onClick={(e) => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {!prof ? (
          <p className="panel-loading">Loading…</p>
        ) : (
          <>
            <h2 className="panel-name">{prof.name}</h2>
            <p className="panel-dept mono">
              {prof.title}
              {prof.office ? ` · ${prof.office}` : ""}
            </p>

            {prof.stats.count > 0 && (
              <div className="stat-row">
                <div className="stat">
                  <span className="stat-num mono">{prof.stats.avg_rating}</span>
                  <span className="stat-label">rating /5</span>
                </div>
                <div className="stat">
                  <span className="stat-num mono">{prof.stats.avg_difficulty}</span>
                  <span className="stat-label">difficulty /5</span>
                </div>
                <div className="stat">
                  <span className="stat-num mono">{prof.stats.count}</span>
                  <span className="stat-label">reviews</span>
                </div>
              </div>
            )}

            {prof.rmp_url && (
              <a className="rmp-link" href={prof.rmp_url} target="_blank" rel="noreferrer">
                View on RateMyProfessors ↗
              </a>
            )}

            <button className="ai-btn" onClick={summarize} disabled={aiBusy}>
              {aiBusy ? "Summarizing…" : "Summarize reviews with AI"}
            </button>
            {ai && (
              <p className={`ai-summary ${ai.source}`}>
                {ai.summary}
                {ai.source === "claude" && <span className="ai-tag mono"> · Claude</span>}
              </p>
            )}

            <ul className="reviews">
              {prof.reviews.map((rv) => (
                <li key={rv.id} className="review">
                  <div className="review-head mono">
                    ★{rv.rating} · diff {rv.difficulty}
                    {rv.course_code ? ` · ${rv.course_code}` : ""}
                  </div>
                  <p>{rv.body}</p>
                </li>
              ))}
              {prof.reviews.length === 0 && (
                <li className="empty">No reviews yet — add the first one below.</li>
              )}
            </ul>

            <div className="review-form">
              <h3>Add a review</h3>
              <div className="form-row">
                <label>
                  Rating
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Difficulty
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <textarea
                rows="3"
                placeholder="What should other students know?"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
              {error && <p className="form-error">{error}</p>}
              <button className="add-btn" onClick={submit}>
                Post review
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
