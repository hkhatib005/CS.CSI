import { useEffect, useMemo, useState } from "react";
import CourseSearch from "./components/CourseSearch.jsx";
import ScheduleGrid from "./components/ScheduleGrid.jsx";
import ProfessorPanel from "./components/ProfessorPanel.jsx";
import { checkSchedule } from "./api.js";

export default function App() {
  // selected sections, keyed by section id (each carries its course info)
  const [selected, setSelected] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [professorId, setProfessorId] = useState(null);

  const sections = useMemo(() => Object.values(selected), [selected]);

  // Re-check conflicts on the server every time the schedule changes
  useEffect(() => {
    const ids = sections.map((s) => s.id);
    checkSchedule(ids)
      .then(({ conflicts, totalCredits }) => {
        setConflicts(conflicts);
        setTotalCredits(totalCredits);
      })
      .catch(console.error);
  }, [sections]);

  const clashIds = useMemo(() => {
    const ids = new Set();
    conflicts.forEach((c) => {
      ids.add(c.a);
      ids.add(c.b);
    });
    return ids;
  }, [conflicts]);

  const addSection = (section, course) => {
    setSelected((prev) => {
      const next = { ...prev };
      // one section per course: replace any existing section of the same course
      for (const s of Object.values(next)) {
        if (s.courseId === course.id) delete next[s.id];
      }
      next[section.id] = {
        id: section.id,
        courseId: course.id,
        code: course.code,
        title: course.title,
        days: section.days,
        start_min: section.start_min,
        end_min: section.end_min,
        room: section.room,
        professor_name: section.professor_name
      };
      return next;
    });
  };

  const removeSection = (id) =>
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  return (
    <div className="app">
      <header className="topbar">
        <div className="wordmark">
          <span className="dot" aria-hidden="true" />
          <h1>Dolphin&nbsp;Planner</h1>
          <span className="campus">College of Staten Island</span>
        </div>
        <div className="meta">
          <span className="chip mono">{totalCredits} cr</span>
          {conflicts.length > 0 ? (
            <span className="chip clash-chip mono">
              {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}
            </span>
          ) : (
            sections.length > 0 && <span className="chip ok-chip mono">no conflicts</span>
          )}
        </div>
      </header>

      <main className="layout">
        <CourseSearch
          selected={selected}
          onAdd={addSection}
          onRemove={removeSection}
          onProfessor={setProfessorId}
        />
        <ScheduleGrid sections={sections} clashIds={clashIds} onRemove={removeSection} />
      </main>

      {professorId && (
        <ProfessorPanel professorId={professorId} onClose={() => setProfessorId(null)} />
      )}

      <footer className="foot">
        Built by a CSI student, for CSI students. Sample catalog data — reviews are
        community-submitted.
      </footer>
    </div>
  );
}
