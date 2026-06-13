/**
 * Import the real semester schedule from a CSV you build off CUNY Global
 * Search (globalsearch.cuny.edu) — copy each CSC section's row into
 * data/schedule.csv, then run:
 *
 *   node scripts/import-schedule.js [path/to/file.csv] [--semester "Fall 2026"] [--replace]
 *
 * CSV columns (header required):
 *   course_code,section,days,start,end,room,professor
 *   CSC 326,6045,"Mon,Wed",10:10,12:05,1N-111,Sarah Zelikovitz
 *
 * --replace deletes existing sections for that semester first.
 * Unknown professors are created automatically; course codes must exist.
 */
import { readFileSync } from "node:fs";
import db from "../src/db.js";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--")) || "data/schedule.csv";
const semester = args.includes("--semester")
  ? args[args.indexOf("--semester") + 1]
  : "Fall 2026";
const replace = args.includes("--replace");

const toMin = (t) => {
  const [hh, mm] = t.trim().split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) throw new Error(`Bad time "${t}" (use HH:MM, 24h)`);
  return hh * 60 + mm;
};

// minimal CSV parse that respects quoted fields ("Mon,Wed")
const parseLine = (line) => {
  const out = [];
  let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === "," && !inQ) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
};

const lines = readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
const header = parseLine(lines.shift()).map((h) => h.toLowerCase());
const col = (row, name) => row[header.indexOf(name)];

if (replace) {
  db.prepare("DELETE FROM sections WHERE semester = ?").run(semester);
  console.log(`Cleared existing "${semester}" sections.`);
}

const getCourse = db.prepare("SELECT id FROM courses WHERE code = ?");
const getProf = db.prepare("SELECT id FROM professors WHERE name = ?");
const insProf = db.prepare(
  "INSERT INTO professors (name, dept, title, rmp_url) VALUES (?, 'CSC', 'Instructor', ?)"
);
const insSection = db.prepare(
  `INSERT INTO sections (course_id, professor_id, section_code, days, start_min, end_min, room, semester)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

let added = 0;
db.exec("BEGIN");
for (const line of lines) {
  const row = parseLine(line);
  const code = col(row, "course_code");
  const course = getCourse.get(code);
  if (!course) {
    console.warn(`Skipping unknown course "${code}" — add it to seed-data.js first.`);
    continue;
  }
  const name = col(row, "professor") || "Staff (TBA)";
  let prof = getProf.get(name);
  if (!prof) {
    const rmp = `https://www.ratemyprofessors.com/search/professors/225?q=${encodeURIComponent(name)}`;
    prof = { id: insProf.run(name, rmp).lastInsertRowid };
    console.log(`Added new instructor: ${name}`);
  }
  insSection.run(
    course.id, prof.id, col(row, "section"), col(row, "days"),
    toMin(col(row, "start")), toMin(col(row, "end")),
    col(row, "room") || "TBA", semester
  );
  added++;
}
db.exec("COMMIT");
console.log(`Imported ${added} sections for ${semester}.`);
