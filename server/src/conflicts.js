/**
 * Schedule conflict detection.
 * A section looks like: { id, days: "Mon,Wed", start_min: 610, end_min: 725, ... }
 * Two sections conflict if they share at least one day AND their
 * time ranges overlap: startA < endB && startB < endA.
 */
export function sharedDays(a, b) {
  const setA = new Set(a.days.split(","));
  return b.days.split(",").filter((d) => setA.has(d));
}

export function timesOverlap(a, b) {
  return a.start_min < b.end_min && b.start_min < a.end_min;
}

export function findConflicts(sections) {
  const conflicts = [];
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const days = sharedDays(sections[i], sections[j]);
      if (days.length > 0 && timesOverlap(sections[i], sections[j])) {
        conflicts.push({
          a: sections[i].id,
          b: sections[j].id,
          days
        });
      }
    }
  }
  return conflicts;
}
