import { Router } from "express";
import db from "./db.js";
import { findConflicts } from "./conflicts.js";
import { summarizeReviews } from "./ai.js";

const r = Router();

/* GET /api/courses?q=data — search by code or title */
r.get("/courses", (req, res) => {
  const q = `%${(req.query.q || "").trim()}%`;
  const rows = db
    .prepare(
      `SELECT id, code, title, dept, credits, map_term
         FROM courses
        WHERE code LIKE ? OR title LIKE ?
        ORDER BY code
        LIMIT 25`
    )
    .all(q, q);
  res.json(rows);
});

/* GET /api/courses/:id — course + its sections (joined with professor) */
r.get("/courses/:id", (req, res) => {
  const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const sections = db
    .prepare(
      `SELECT s.id, s.section_code, s.days, s.start_min, s.end_min, s.room, s.semester,
              p.id AS professor_id, p.name AS professor_name,
              ROUND(AVG(rv.rating), 1) AS professor_rating,
              COUNT(rv.id) AS review_count
         FROM sections s
         JOIN professors p ON p.id = s.professor_id
         LEFT JOIN reviews rv ON rv.professor_id = p.id
        WHERE s.course_id = ?
        GROUP BY s.id
        ORDER BY s.section_code`
    )
    .all(req.params.id);

  res.json({ ...course, sections });
});

/* GET /api/professors/:id — professor + reviews + averages */
r.get("/professors/:id", (req, res) => {
  const professor = db.prepare("SELECT * FROM professors WHERE id = ?").get(req.params.id);
  if (!professor) return res.status(404).json({ error: "Professor not found" });

  const reviews = db
    .prepare(
      `SELECT rv.id, rv.rating, rv.difficulty, rv.body, rv.created_at,
              c.code AS course_code
         FROM reviews rv
         LEFT JOIN courses c ON c.id = rv.course_id
        WHERE rv.professor_id = ?
        ORDER BY rv.created_at DESC`
    )
    .all(req.params.id);

  const stats = db
    .prepare(
      `SELECT ROUND(AVG(rating), 1) AS avg_rating,
              ROUND(AVG(difficulty), 1) AS avg_difficulty,
              COUNT(*) AS count
         FROM reviews WHERE professor_id = ?`
    )
    .get(req.params.id);

  res.json({ ...professor, stats, reviews });
});

/* POST /api/reviews — { professor_id, course_id?, rating, difficulty, body } */
r.post("/reviews", (req, res) => {
  const { professor_id, course_id = null, rating, difficulty, body } = req.body || {};
  if (!professor_id || !rating || !difficulty || !body?.trim()) {
    return res.status(400).json({ error: "professor_id, rating, difficulty, and body are required" });
  }
  if (body.trim().length < 10) {
    return res.status(400).json({ error: "Review must be at least 10 characters" });
  }
  try {
    const info = db
      .prepare(
        "INSERT INTO reviews (professor_id, course_id, rating, difficulty, body) VALUES (?, ?, ?, ?, ?)"
      )
      .run(professor_id, course_id, Number(rating), Number(difficulty), body.trim());
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* POST /api/schedule/check — { sectionIds: [1, 5, 9] } → conflicts between them */
r.post("/schedule/check", (req, res) => {
  const ids = (req.body?.sectionIds || []).map(Number).filter(Boolean);
  if (ids.length === 0) return res.json({ conflicts: [], totalCredits: 0 });

  const placeholders = ids.map(() => "?").join(",");
  const sections = db
    .prepare(
      `SELECT s.id, s.days, s.start_min, s.end_min, c.credits
         FROM sections s JOIN courses c ON c.id = s.course_id
        WHERE s.id IN (${placeholders})`
    )
    .all(...ids);

  res.json({
    conflicts: findConflicts(sections),
    totalCredits: sections.reduce((sum, s) => sum + s.credits, 0)
  });
});

/* POST /api/ai/summarize/:professorId — Claude summary of a professor's reviews */
r.post("/ai/summarize/:professorId", async (req, res, next) => {
  try {
    const professor = db
      .prepare("SELECT * FROM professors WHERE id = ?")
      .get(req.params.professorId);
    if (!professor) return res.status(404).json({ error: "Professor not found" });

    const reviews = db
      .prepare("SELECT rating, difficulty, body FROM reviews WHERE professor_id = ?")
      .all(req.params.professorId);
    if (reviews.length === 0) {
      return res.json({ source: "none", summary: "No reviews yet — be the first to add one." });
    }

    res.json(await summarizeReviews(professor, reviews));
  } catch (e) {
    next(e);
  }
});

export default r;
