import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROFESSORS, COURSES, SAMPLE_SECTIONS } from "./seed-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(__dirname, "..", "planner.db"));
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS professors (
    id      INTEGER PRIMARY KEY,
    name    TEXT NOT NULL UNIQUE,
    dept    TEXT NOT NULL,
    title   TEXT NOT NULL DEFAULT 'Instructor',
    office  TEXT,
    rmp_url TEXT
  );

  CREATE TABLE IF NOT EXISTS courses (
    id          INTEGER PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,      -- e.g. "CSC 326"
    title       TEXT NOT NULL,
    dept        TEXT NOT NULL,
    credits     INTEGER NOT NULL DEFAULT 3,
    map_term    TEXT NOT NULL DEFAULT 'Elective',  -- degree-map slot, e.g. "Y2 Fall"
    description TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS sections (
    id           INTEGER PRIMARY KEY,
    course_id    INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    professor_id INTEGER NOT NULL REFERENCES professors(id),
    section_code TEXT NOT NULL,            -- e.g. "6045"
    days         TEXT NOT NULL,            -- comma list: "Mon,Wed"
    start_min    INTEGER NOT NULL,         -- minutes from midnight
    end_min      INTEGER NOT NULL,
    room         TEXT NOT NULL DEFAULT 'TBA',
    semester     TEXT NOT NULL DEFAULT 'Fall 2026',
    CHECK (end_min > start_min)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id           INTEGER PRIMARY KEY,
    professor_id INTEGER NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
    course_id    INTEGER REFERENCES courses(id),
    rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    difficulty   INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    body         TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_sections_course  ON sections(course_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_prof     ON reviews(professor_id);
`);

/* Seed from real CSI data (see seed-data.js for sources). Runs once. */
const isEmpty = db.prepare("SELECT COUNT(*) AS n FROM courses").get().n === 0;

if (isEmpty) {
  db.exec("BEGIN");

  const insProf = db.prepare(
    "INSERT INTO professors (name, dept, title, office, rmp_url) VALUES (?, ?, ?, ?, ?)"
  );
  const profIdByName = {};
  for (const p of PROFESSORS) {
    profIdByName[p.name] = insProf.run(p.name, p.dept, p.title, p.office, p.rmp_url).lastInsertRowid;
  }

  const insCourse = db.prepare(
    "INSERT INTO courses (code, title, dept, credits, map_term, description) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const courseIdByCode = {};
  for (const c of COURSES) {
    courseIdByCode[c.code] = insCourse.run(
      c.code, c.title, "CSC", c.credits, c.map_term, c.description
    ).lastInsertRowid;
  }

  const insSection = db.prepare(
    `INSERT INTO sections (course_id, professor_id, section_code, days, start_min, end_min, room)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const staffId = profIdByName["Staff (TBA)"];
  for (const s of SAMPLE_SECTIONS) {
    insSection.run(courseIdByCode[s.course], staffId, s.section, s.days, s.start, s.end, s.room);
  }

  db.exec("COMMIT");
  console.log(
    `Seeded ${COURSES.length} real CSI courses and ${PROFESSORS.length - 1} real faculty. ` +
    `Sections are placeholders — run scripts/import-schedule.js with the real semester.`
  );
}

export default db;
