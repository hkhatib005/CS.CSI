/**
 * Real CSI data, gathered from official public sources (June 2026):
 * - Faculty roster: cs.csi.cuny.edu/people.html
 * - Course catalog: cs.csi.cuny.edu/courses.html
 * - Degree-map terms: CSI Computer Science BS Sample Degree Map
 *
 * Reviews are intentionally EMPTY — they come from real students using the
 * app. Each professor links out to their RateMyProfessors search results
 * (school id 225 = CSI) instead of copying RMP content, which their terms
 * don't allow.
 *
 * Section meeting times below are PLACEHOLDERS assigned to "Staff (TBA)"
 * so the schedule builder demos well. Import the real semester schedule
 * from CUNY Global Search with: node scripts/import-schedule.js
 */

const rmp = (name) =>
  `https://www.ratemyprofessors.com/search/professors/225?q=${encodeURIComponent(name)}`;

export const PROFESSORS = [
  // Placeholder instructor for sample sections (id assigned first = 1)
  { name: "Staff (TBA)", dept: "CSC", title: "Placeholder", office: null, rmp_url: null },

  // Full-time faculty — cs.csi.cuny.edu/people.html
  { name: "Sos Agaian", dept: "CSC", title: "Distinguished Professor", office: "1N-203", rmp_url: rmp("Sos Agaian") },
  { name: "Tatiana Anderson", dept: "CSC", title: "Lecturer", office: "1N-210", rmp_url: rmp("Tatiana Anderson") },
  { name: "Cong Chen", dept: "CSC", title: "Doctoral Lecturer", office: "4N-206", rmp_url: rmp("Cong Chen") },
  { name: "Kennedy Edemacu", dept: "CSC", title: "Assistant Professor", office: "1N-208", rmp_url: rmp("Kennedy Edemacu") },
  { name: "Feng Gu", dept: "CSC", title: "Professor", office: "1N-201", rmp_url: rmp("Feng Gu") },
  { name: "Yumei Huo", dept: "CSC", title: "Professor", office: "1N-202", rmp_url: rmp("Yumei Huo") },
  { name: "Ali Mohamed", dept: "CSC", title: "Lecturer", office: "1N-210", rmp_url: rmp("Ali Mohamed") },
  { name: "Louis Petingi", dept: "CSC", title: "Professor", office: "1N-211", rmp_url: rmp("Louis Petingi") },
  { name: "Jun Rao", dept: "CSC", title: "Doctoral Lecturer", office: "5N-220", rmp_url: rmp("Jun Rao") },
  { name: "Ping Shi", dept: "CSC", title: "Lecturer", office: "1N-210", rmp_url: rmp("Ping Shi") },
  { name: "Sarah Zelikovitz", dept: "CSC", title: "Professor", office: "1N-212", rmp_url: rmp("Sarah Zelikovitz") },
  { name: "Shuqun Zhang", dept: "CSC", title: "Professor, Chairperson", office: "1N-204", rmp_url: rmp("Shuqun Zhang") },
  { name: "Tianxiao Zhang", dept: "CSC", title: "Assistant Professor", office: "1N-205", rmp_url: rmp("Tianxiao Zhang") },
  { name: "Xiaowen Zhang", dept: "CSC", title: "Professor", office: "1N-213", rmp_url: rmp("Xiaowen Zhang") },
  { name: "Zhanyang Zhang", dept: "CSC", title: "Professor", office: "1N-206", rmp_url: rmp("Zhanyang Zhang") },

  // Adjunct faculty — cs.csi.cuny.edu/people.html
  ...[
    "Daniel Agman", "Anthony Catalano", "Zaid Al-Mashhadani", "Dolores Hayes",
    "Safet Jahaj", "Amy Hills", "Louis Iacona", "Jonathan Wong",
    "Michael Kholodovsky", "Fatma Kausar", "Rich Weir", "Michael Deredita",
    "Roman Lavrov", "Philip Ciaccio", "Jonathan Parziale", "Luigi Kapaj",
    "Zhiqi Wang", "Kailie Yuan", "Jia Lu", "Joseph Tooker"
  ].map((name) => ({
    name, dept: "CSC", title: "Adjunct Lecturer", office: null, rmp_url: rmp(name)
  }))
];

/**
 * map_term = where the course sits on the official BS degree map.
 * Credits for electives follow the degree map's pattern (2xx elective = 3,
 * 400-level = 4); verify per course in the undergraduate catalog.
 */
export const COURSES = [
  // BS core, in degree-map order
  { code: "CSC 126", title: "Introduction to Computer Science", credits: 4, map_term: "Y1 Fall", description: "First programming course of the CS major." },
  { code: "CSC 211", title: "Intermediate Programming", credits: 4, map_term: "Y1 Spring", description: "Object-oriented programming in C++." },
  { code: "CSC 220", title: "Computer Organization", credits: 4, map_term: "Y1 Spring", description: "How computers work below the language level." },
  { code: "CSC 326", title: "Data Structures", credits: 4, map_term: "Y2 Fall", description: "Lists, stacks, queues, trees, hashing, and analysis." },
  { code: "CSC 330", title: "Object-Oriented Software Design", credits: 4, map_term: "Y2 Spring", description: "Design patterns and building larger OO systems." },
  { code: "CSC 228", title: "Discrete Mathematical Structures for Computer Science", credits: 4, map_term: "Y3 Fall", description: "Logic, sets, proofs, and combinatorics for CS." },
  { code: "CSC 305", title: "Operating Systems Programming Laboratory", credits: 1, map_term: "Y3 Fall", description: "Hands-on systems programming lab." },
  { code: "CSC 315", title: "Introduction to Database Systems", credits: 4, map_term: "Y3 Fall", description: "Relational model, SQL, and database design." },
  { code: "CSC 332", title: "Operating Systems I", credits: 3, map_term: "Y3 Fall", description: "Processes, memory, scheduling, and concurrency." },
  { code: "CSC 346", title: "Digital Systems Design", credits: 4, map_term: "Y3 Fall", description: "Combinational and sequential logic design." },
  { code: "CSC 347", title: "Digital Systems Design Laboratory", credits: 1, map_term: "Y3 Fall", description: "Lab companion to CSC 346." },
  { code: "CSC 382", title: "Analysis of Algorithms", credits: 4, map_term: "Y3 Spring", description: "Greedy, divide-and-conquer, DP, NP-completeness." },
  { code: "CSC 430", title: "Software Engineering", credits: 4, map_term: "Y3 Spring", description: "Team development, process, testing, delivery." },
  { code: "CSC 446", title: "Computer Architecture", credits: 4, map_term: "Y4 Fall", description: "Processor design, pipelines, and memory hierarchy." },
  { code: "CSC 490", title: "Seminar in Computer Science", credits: 4, map_term: "Y4 Spring", description: "Capstone seminar for graduating majors." },

  // Popular electives — cs.csi.cuny.edu/courses.html
  { code: "CSC 221", title: "Networking and Security", credits: 3, map_term: "Elective", description: "" },
  { code: "CSC 223", title: "Cybersecurity Fundamentals", credits: 3, map_term: "Elective", description: "" },
  { code: "CSC 225", title: "Introduction to Web Development and the Internet", credits: 3, map_term: "Elective", description: "" },
  { code: "CSC 245", title: "Introduction to Data Science", credits: 3, map_term: "Elective", description: "" },
  { code: "CSC 412", title: "Machine Learning and Knowledge Discovery", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 420", title: "Concepts of Programming Languages", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 424", title: "Advanced Database Management Systems", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 426", title: "Applied Cryptography", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 435", title: "Advanced Data Communications", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 436", title: "Modern Web Development", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 438", title: "Mobile Application Development", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 470", title: "Introductory Computer Graphics", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 480", title: "Artificial Intelligence", credits: 4, map_term: "Elective", description: "" },
  { code: "CSC 484", title: "Theory of Computation", credits: 4, map_term: "Elective", description: "" }
];

/**
 * Placeholder sections (instructor = "Staff (TBA)") so the schedule builder
 * works out of the box. Replace with the real semester via the import script.
 * Times use minutes-from-midnight.
 */
const h = (hh, mm = 0) => hh * 60 + mm;

export const SAMPLE_SECTIONS = [
  { course: "CSC 126", section: "0001", days: "Mon,Wed", start: h(10, 10), end: h(12, 5), room: "TBA" },
  { course: "CSC 126", section: "0002", days: "Tue,Thu", start: h(14, 30), end: h(16, 25), room: "TBA" },
  { course: "CSC 211", section: "0001", days: "Tue,Thu", start: h(10, 10), end: h(12, 5), room: "TBA" },
  { course: "CSC 220", section: "0001", days: "Mon,Wed", start: h(12, 20), end: h(14, 15), room: "TBA" },
  { course: "CSC 326", section: "0001", days: "Mon,Wed", start: h(10, 10), end: h(12, 5), room: "TBA" },
  { course: "CSC 326", section: "0002", days: "Tue,Thu", start: h(17, 0), end: h(18, 55), room: "TBA" },
  { course: "CSC 330", section: "0001", days: "Mon,Wed", start: h(14, 30), end: h(16, 25), room: "TBA" },
  { course: "CSC 315", section: "0001", days: "Tue,Thu", start: h(12, 20), end: h(14, 15), room: "TBA" },
  { course: "CSC 332", section: "0001", days: "Fri", start: h(10, 10), end: h(13, 10), room: "TBA" },
  { course: "CSC 382", section: "0001", days: "Tue,Thu", start: h(14, 30), end: h(16, 25), room: "TBA" },
  { course: "CSC 430", section: "0001", days: "Mon,Wed", start: h(17, 0), end: h(18, 55), room: "TBA" },
  { course: "CSC 480", section: "0001", days: "Tue,Thu", start: h(18, 30), end: h(20, 25), room: "TBA" }
];
