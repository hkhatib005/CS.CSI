const json = (r) => {
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
};

export const searchCourses = (q) =>
  fetch(`/api/courses?q=${encodeURIComponent(q)}`).then(json);

export const getCourse = (id) => fetch(`/api/courses/${id}`).then(json);

export const getProfessor = (id) => fetch(`/api/professors/${id}`).then(json);

export const postReview = (body) =>
  fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(json);

export const checkSchedule = (sectionIds) =>
  fetch("/api/schedule/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sectionIds })
  }).then(json);

export const summarizeProfessor = (id) =>
  fetch(`/api/ai/summarize/${id}`, { method: "POST" }).then(json);
