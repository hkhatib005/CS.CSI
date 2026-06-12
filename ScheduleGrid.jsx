const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_START = 8 * 60; // 8:00am
const DAY_END = 22 * 60; // 10:00pm
const SPAN = DAY_END - DAY_START;
const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60);

const BLOCK_HUES = ["harbor", "tide", "plum", "gold", "steel"];
const fmtHour = (m) => {
  const h = Math.floor(m / 60);
  return `${((h + 11) % 12) + 1}${h >= 12 ? "p" : "a"}`;
};

export default function ScheduleGrid({ sections, clashIds, onRemove }) {
  return (
    <section className="grid-pane" aria-label="Weekly schedule">
      <div className="grid">
        <div className="grid-corner" />
        {DAYS.map((d) => (
          <div key={d} className="grid-day mono">
            {d}
          </div>
        ))}

        <div className="grid-times">
          {HOURS.map((m) => (
            <span key={m} className="mono hour" style={{ top: `${((m - DAY_START) / SPAN) * 100}%` }}>
              {fmtHour(m)}
            </span>
          ))}
        </div>

        {DAYS.map((day) => (
          <div key={day} className="grid-col">
            {HOURS.slice(1).map((m) => (
              <div
                key={m}
                className="hour-line"
                style={{ top: `${((m - DAY_START) / SPAN) * 100}%` }}
              />
            ))}
            {sections
              .filter((s) => s.days.split(",").includes(day))
              .map((s, i) => {
                const top = ((s.start_min - DAY_START) / SPAN) * 100;
                const height = ((s.end_min - s.start_min) / SPAN) * 100;
                const hue = BLOCK_HUES[s.courseId % BLOCK_HUES.length];
                const clash = clashIds.has(s.id);
                return (
                  <button
                    key={s.id}
                    className={`block ${hue} ${clash ? "clash" : ""}`}
                    style={{ top: `${top}%`, height: `${height}%` }}
                    onClick={() => onRemove(s.id)}
                    title={`${s.code} · ${s.title} · ${s.room} — tap to remove`}
                  >
                    <span className="mono block-code">{s.code}</span>
                    <span className="block-room mono">{s.room}</span>
                  </button>
                );
              })}
          </div>
        ))}
      </div>
      {sections.length === 0 && (
        <p className="grid-empty">Your week is wide open. Add a section to start planning.</p>
      )}
    </section>
  );
}
