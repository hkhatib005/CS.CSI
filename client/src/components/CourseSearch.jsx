import { useEffect, useState } from "react";
import { searchCourses, getCourse } from "../api.js";

const fmt = (m) => {
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  const ampm = h >= 12 ? "pm" : "am";
  return `${((h + 11) % 12) + 1}:${mm}${ampm}`;
};
const shortDays = (d) => d.split(",").map((x) => x.slice(0, 2)).join("/");

export default function CourseSearch({ selected, onAdd, onRemove, onProfessor }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      searchCourses(query)
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const open = (id) =>
    course?.id === id ? setCourse(null) : getCourse(id).then(setCourse).catch(console.error);

  return (
    <section className="search-pane">
      <label className="search-label" htmlFor="q">
        Find a course
      </label>
      <input
        id="q"
        className="search-input"
        placeholder='Try "data structures" or "CSC 326"'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      <ul className="results">
        {results.map((c) => (
          <li key={c.id} className={`course ${course?.id === c.id ? "open" : ""}`}>
            <button className="course-row" onClick={() => open(c.id)}>
              <span className="mono code">{c.code}</span>
              <span className="title">
                {c.title}
                {c.map_term && c.map_term !== "Elective" && (
                  <span className="mono term">{c.map_term}</span>
                )}
              </span>
              <span className="mono credits">{c.credits}cr</span>
            </button>

            {course?.id === c.id && (
              <div className="sections">
                {course.sections.map((s) => {
                  const isAdded = Boolean(selected[s.id]);
                  return (
                    <div key={s.id} className="section-row">
                      <div className="section-when">
                        <span className="mono">{shortDays(s.days)}</span>
                        <span className="mono">
                          {fmt(s.start_min)}–{fmt(s.end_min)}
                        </span>
                        <span className="mono room">{s.room}</span>
                      </div>
                      <button className="prof-link" onClick={() => onProfessor(s.professor_id)}>
                        {s.professor_name}
                        {s.professor_rating != null && (
                          <span className="mono rating"> ★{s.professor_rating}</span>
                        )}
                      </button>
                      <button
                        className={`add-btn ${isAdded ? "added" : ""}`}
                        onClick={() => (isAdded ? onRemove(s.id) : onAdd(s, course))}
                      >
                        {isAdded ? "Remove" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </li>
        ))}
        {!loading && results.length === 0 && (
          <li className="empty">No courses match "{query}". Try a department code like CSC.</li>
        )}
      </ul>
    </section>
  );
}
