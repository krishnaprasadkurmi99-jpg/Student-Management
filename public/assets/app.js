const studentList = document.querySelector("#student-list");
const courseList = document.querySelector("#course-list");
const attendanceList = document.querySelector("#attendance-list");
const gradeList = document.querySelector("#grade-list");
const feeList = document.querySelector("#fee-list");
const studentModal = document.querySelector("#student-modal");
const studentForm = document.querySelector("#student-form");
const searchInput = document.querySelector("#student-search");
const statusFilter = document.querySelector("#status-filter");
const viewNames = ["overview", "students", "courses", "attendance", "grades", "fees", "reports"];
let students = [];
let courses = [];
let csrfToken = "";
let editingStudentId = null;
let editingCourseId = null;
let editingGradeId = null;
let searchTimer;
let globalSearchTimer;
let globalSearchRequest = 0;
let dashboardData = null;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

async function initializeSession() {
  const response = await fetch("/api/auth/me");
  if (!response.ok) {
    window.location.replace("/login");
    return;
  }
  const data = await response.json();
  csrfToken = data.csrf_token;
  document.querySelector("#profile-name").textContent = data.user.name;
  document.querySelector("#profile-email").textContent = data.user.email;
  document.querySelector("#welcome-name").textContent = data.user.name.split(/\s+/)[0];
  document.querySelectorAll(".avatar, .top-avatar").forEach((avatar) => {
    avatar.textContent = data.user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  });
}

const sessionReady = initializeSession();

async function api(url, options = {}) {
  await sessionReady;
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (["POST", "PUT", "PATCH", "DELETE"].includes(options.method)) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    window.location.replace("/login");
    throw new Error("Your session expired. Please sign in again.");
  }
  if (response.status === 204) return null;
  const body = await response.json();
  if (!response.ok) {
    const detail = Array.isArray(body.details)
      ? body.details.join(" ")
      : body.details ? Object.values(body.details).join(" ") : body.error;
    throw new Error(detail || "Something went wrong. Please try again.");
  }
  return body;
}

function initials(student) {
  return `${student.first_name[0] || ""}${student.last_name[0] || ""}`.toUpperCase();
}

function studentOptions(selectedId = "") {
  if (!students.length) return '<option value="">Add a student first</option>';
  return `<option value="">Choose a student</option>${students.map((student) =>
    `<option value="${student.id}" ${String(student.id) === String(selectedId) ? "selected" : ""}>${escapeHtml(student.full_name)}</option>`
  ).join("")}`;
}

async function refreshStudentOptions() {
  const result = await api("/api/students");
  students = result.students;
  for (const select of document.querySelectorAll('#grade-form select[name="student_id"], #fee-form select[name="student_id"]')) {
    const selected = select.value;
    select.innerHTML = studentOptions(selected);
  }
}

function renderStudents() {
  document.querySelector("#heading-count").textContent = students.length;
  document.querySelector("#nav-count").textContent = students.length;
  document.querySelector("#results-label").textContent =
    `Showing ${students.length} student${students.length === 1 ? "" : "s"}`;
  if (!students.length) {
    const filtered = searchInput.value || statusFilter.value;
    studentList.innerHTML = `<tr><td class="empty-cell" colspan="5"><span class="empty-icon">✳</span><strong>${filtered ? "No students found" : "Your directory is ready"}</strong><span>${filtered ? "Try a different search or filter." : "Add a course first, then enroll your first student."}</span>${filtered ? "" : '<button class="text-button" type="button" data-action="add">＋ Add your first student</button>'}</td></tr>`;
    return;
  }
  studentList.innerHTML = students.map((student, index) => `
    <tr>
      <td><div class="student-cell"><span class="student-avatar avatar-${index % 5}">${escapeHtml(initials(student))}</span><span class="student-copy"><strong>${escapeHtml(student.full_name)}</strong><small>${escapeHtml(student.email)}</small></span></div></td>
      <td><span class="course-name">${escapeHtml(student.course)}</span></td>
      <td><span class="enrollment-date">${new Date(`${student.enrollment_date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span></td>
      <td><span class="status-badge status-${student.status === "Active" ? "active" : student.status === "Graduated" ? "graduated" : "leave"}"><span></span>${escapeHtml(student.status)}</span></td>
      <td><div class="row-actions"><button class="row-action" type="button" data-action="profile" data-id="${student.id}" aria-label="View ${escapeHtml(student.full_name)} profile">Profile</button><button class="row-action" type="button" data-action="edit" data-id="${student.id}" aria-label="Edit ${escapeHtml(student.full_name)}">Edit</button><button class="row-action delete-action" type="button" data-action="delete" data-id="${student.id}" aria-label="Delete ${escapeHtml(student.full_name)}">Delete</button></div></td>
    </tr>`).join("");
}

async function loadStudents() {
  const query = new URLSearchParams();
  if (searchInput.value.trim()) query.set("search", searchInput.value.trim());
  if (statusFilter.value) query.set("status", statusFilter.value);
  try {
    const [studentData, stats] = await Promise.all([api(`/api/students?${query}`), api("/api/stats")]);
    students = studentData.students;
    renderStudents();
    document.querySelector("#stat-total").textContent = stats.total;
    document.querySelector("#stat-active").textContent = stats.active;
    document.querySelector("#stat-graduated").textContent = stats.graduated;
    document.querySelector("#stat-courses").textContent = stats.courses;
  } catch (error) {
    studentList.innerHTML = `<tr><td class="error-cell" colspan="5">${escapeHtml(error.message)} <button class="text-button" type="button" data-action="retry">Try again</button></td></tr>`;
    showToast(error.message, true);
  }
}

function renderEnrollmentChart(items) {
    const target = document.querySelector("#enrollment-chart");
    if (!items.length || items.every((item) => item.count === 0)) {
      target.innerHTML = '<div class="chart-empty">Enrollment history will appear when students are added.</div>';
      return;
    }
    const width = 560, height = 190, top = 18, bottom = 34;
    const maximum = Math.max(1, ...items.map((item) => item.count));
    const points = items.map((item, index) => ({
      x: 24 + index * (width - 48) / Math.max(1, items.length - 1),
      y: top + (height - top - bottom) * (1 - item.count / maximum),
      ...item,
    }));
    const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
    const fill = `${path} L ${points.at(-1).x} ${height - bottom} L ${points[0].x} ${height - bottom} Z`;
    target.innerHTML = `<svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly student enrollment counts">
      <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9585f5" stop-opacity=".3"/><stop offset="1" stop-color="#9585f5" stop-opacity="0"/></linearGradient></defs>
      ${[0, 1, 2].map((line) => `<line x1="20" x2="${width - 20}" y1="${top + line * (height - top - bottom) / 2}" y2="${top + line * (height - top - bottom) / 2}" class="chart-gridline"/>`).join("")}
      <path d="${fill}" fill="url(#chart-fill)"/><path d="${path}" class="chart-line"/>
      ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" class="chart-point"><title>${escapeHtml(point.month)}: ${point.count} enrollments</title></circle>`).join("")}
      ${points.map((point) => `<text x="${point.x}" y="${height - 8}" text-anchor="middle" class="chart-label">${escapeHtml(point.month)}</text>`).join("")}
    </svg>`;
  }

function renderAttendanceChart(items) {
    const target = document.querySelector("#attendance-chart");
    if (!items.some((item) => item.rate !== null)) {
      target.innerHTML = '<div class="chart-empty">Attendance analytics will appear after attendance is recorded.</div>';
      return;
    }
    target.innerHTML = `<div class="attendance-bars">${items.map((item) => {
      const height = item.rate === null ? 4 : Math.max(8, item.rate);
      return `<div class="attendance-bar-wrap" title="${escapeHtml(item.label)}: ${item.rate === null ? "No recorded data" : `${item.rate}%`}">
        <span class="attendance-bar-value">${item.rate === null ? "—" : `${item.rate}%`}</span>
        <div class="attendance-bar-track"><span class="attendance-bar" style="height:${height}%"></span></div>
        <span class="chart-label">${escapeHtml(item.label)}</span></div>`;
    }).join("")}</div>`;
  }

function renderDashboard(data) {
    dashboardData = data;
    const metric = data.metrics;
    document.querySelector("#stat-total").textContent = metric.total;
    document.querySelector("#stat-active").textContent = metric.active;
    document.querySelector("#stat-graduated").textContent = metric.graduated;
    document.querySelector("#stat-courses").textContent = metric.courses;
    document.querySelector("#stat-attendance").textContent = metric.attendance_rate === null ? "—" : `${metric.attendance_rate}%`;
    document.querySelector("#stat-fees").textContent = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(metric.pending_fees);
    document.querySelector("#stat-overdue").textContent = `${data.overdue_fee_count} overdue record${data.overdue_fee_count === 1 ? "" : "s"}`;
    document.querySelector("#insight-count").textContent = data.insights.length;
    renderEnrollmentChart(data.enrollment);
    renderAttendanceChart(data.attendance_trend);
    document.querySelector("#insight-list").innerHTML = data.insights.length
      ? data.insights.map((item) => `<button class="insight-item" type="button" data-action="profile" data-id="${item.student_id}">
          <span class="insight-symbol insight-${escapeHtml(item.type)}">${item.type === "attendance" ? "◷" : item.type === "grades" ? "↘" : "!"}</span>
          <span><strong>${escapeHtml(item.student_name)}</strong><small>${escapeHtml(item.message)}</small></span><span class="insight-arrow">→</span>
        </button>`).join("")
      : '<div class="dashboard-empty"><span class="empty-check">✓</span><strong>All clear for now</strong><span>No students currently meet the attention rules.</span></div>';
    document.querySelector("#activity-list").innerHTML = data.activity.length
      ? data.activity.map((item) => `<div class="activity-item"><span class="activity-marker activity-${escapeHtml(item.kind)}"></span><div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.detail)} · ${new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></div></div>`).join("")
      : '<div class="dashboard-empty"><strong>No recent records yet</strong><span>Student, attendance, and grade activity will appear here.</span></div>';
    document.querySelector("#attention-list").innerHTML = data.attention.length
      ? data.attention.map((item) => `<button class="attention-item" type="button" data-action="profile" data-id="${item.id}"><span class="student-avatar">${escapeHtml(item.full_name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2))}</span><span><strong>${escapeHtml(item.full_name)}</strong><small>${escapeHtml(item.course)}</small></span><span class="attention-link">View →</span></button>`).join("")
      : '<div class="dashboard-empty"><strong>No students flagged</strong><span>Profiles are flagged only when records meet the insight rules.</span></div>';
    document.querySelector("#events-list").innerHTML = data.events.length
      ? data.events.map((event) => `<div class="event-item"><span class="event-date"><strong>${new Date(`${event.event_date}T00:00:00`).getDate()}</strong><small>${new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { month: "short" })}</small></span><span class="event-copy"><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(event.description || "Academic event")} · ${new Date(`${event.event_date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</small></span><button class="event-remove" type="button" data-action="delete-event" data-id="${event.id}" aria-label="Remove ${escapeHtml(event.title)}">×</button></div>`).join("")
      : '<div class="dashboard-empty"><strong>Your calendar is clear</strong><span>Add upcoming academic dates to keep your team in sync.</span></div>';
    const notificationItems = [
      ...data.insights.map((item) => ({ title: item.student_name, message: item.message, kind: item.type })),
      ...data.events.slice(0, 3).map((event) => ({ title: event.title, message: `Upcoming · ${new Date(`${event.event_date}T00:00:00`).toLocaleDateString()}`, kind: "event" })),
    ];
    const notificationCount = notificationItems.length;
    const notificationBadge = document.querySelector("#notification-count");
    notificationBadge.hidden = notificationCount === 0;
    notificationBadge.textContent = notificationCount;
    document.querySelector("#notification-panel").innerHTML = `<div class="notification-heading"><strong>Notifications</strong><span>${notificationCount} item${notificationCount === 1 ? "" : "s"}</span></div>${notificationCount
      ? notificationItems.slice(0, 8).map((item) => `<div class="notification-item"><span class="notification-dot notification-${escapeHtml(item.kind)}"></span><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.message)}</small></span></div>`).join("")
      : '<div class="dashboard-empty"><strong>You’re all caught up</strong><span>No academic alerts right now.</span></div>'}`;
  }

async function loadDashboard() {
    try {
      renderDashboard(await api("/api/dashboard"));
    } catch (error) {
      const retry = `<div class="dashboard-error">${escapeHtml(error.message)} <button class="text-button" type="button" data-action="retry-dashboard">Try again</button></div>`;
      for (const selector of ["#enrollment-chart", "#attendance-chart", "#insight-list", "#activity-list", "#attention-list", "#events-list"]) {
        document.querySelector(selector).innerHTML = retry;
      }
      showToast(error.message, true);
    }
  }

async function openStudentProfile(studentId) {
    const content = document.querySelector("#profile-content");
    document.querySelector("#profile-title").textContent = "Student profile";
    content.innerHTML = '<div class="loading-cell"><span class="loading-spinner"></span> Loading student record...</div>';
    openModal("profile-modal");
    try {
      const { student, attendance, grades: profileGrades, fees: profileFees, achievements } = await api(`/api/students/${studentId}/profile`);
      document.querySelector("#profile-title").textContent = student.full_name;
      const statusClass = student.status === "Active" ? "active" : student.status === "Graduated" ? "graduated" : "leave";
      content.innerHTML = `<div class="profile-summary"><span class="student-avatar profile-avatar">${escapeHtml(initials(student))}</span><div><strong>${escapeHtml(student.full_name)}</strong><small>${escapeHtml(student.course)} · <span class="status-badge status-${statusClass}">${escapeHtml(student.status)}</span></small></div></div>
        <div class="profile-details"><div><small>Email</small><strong>${escapeHtml(student.email)}</strong></div><div><small>Phone</small><strong>${escapeHtml(student.phone || "Not provided")}</strong></div><div><small>Enrolled</small><strong>${new Date(`${student.enrollment_date}T00:00:00`).toLocaleDateString()}</strong></div><div><small>Date of birth</small><strong>${student.date_of_birth ? new Date(`${student.date_of_birth}T00:00:00`).toLocaleDateString() : "Not provided"}</strong></div><div class="profile-address"><small>Address</small><strong>${escapeHtml(student.address || "Not provided")}</strong></div></div>
        <div class="profile-metrics"><div><small>Attendance</small><strong>${attendance.rate === null ? "No records" : `${attendance.rate}%`}</strong></div><div><small>Assessments</small><strong>${profileGrades.length}</strong></div><div><small>Outstanding fees</small><strong>${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(profileFees.reduce((sum, fee) => sum + fee.balance, 0))}</strong></div></div>
        <div class="profile-section"><h3>Achievements</h3>${achievements.length ? `<div class="achievement-list">${achievements.map((item) => `<span class="achievement-badge">✦ ${escapeHtml(item.title)}<small>${escapeHtml(item.detail)}</small></span>`).join("")}</div>` : '<p class="profile-empty">Achievements appear when attendance or assessment records meet a milestone.</p>'}</div>
        <div class="profile-columns"><div class="profile-section"><h3>Academic history</h3>${profileGrades.length ? `<ul class="profile-record-list">${profileGrades.slice(0, 5).map((grade) => `<li><span><strong>${escapeHtml(grade.assessment)}</strong><small>${new Date(`${grade.grade_date}T00:00:00`).toLocaleDateString()}</small></span><b>${grade.score}/${grade.max_score}</b></li>`).join("")}</ul>` : '<p class="profile-empty">No grades recorded yet.</p>'}</div>
        <div class="profile-section"><h3>Attendance & fees</h3>${attendance.records.length ? `<ul class="profile-record-list">${attendance.records.slice(0, 4).map((record) => `<li><span><strong>${escapeHtml(record.status)}</strong><small>${new Date(`${record.date}T00:00:00`).toLocaleDateString()}</small></span></li>`).join("")}</ul>` : '<p class="profile-empty">No attendance recorded.</p>'}${profileFees.length ? `<h3 class="profile-subheading">Fee records</h3><ul class="profile-record-list">${profileFees.slice(0, 3).map((fee) => `<li><span><strong>${escapeHtml(fee.description)}</strong><small>${escapeHtml(fee.status)} · due ${new Date(`${fee.due_date}T00:00:00`).toLocaleDateString()}</small></span><b>${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(fee.balance)}</b></li>`).join("")}</ul>` : ""}</div></div>`;
    } catch (error) {
      content.innerHTML = `<div class="error-cell">${escapeHtml(error.message)}</div>`;
    }
  }

function parseCsv(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (quoted) {
        if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
        else if (character === '"') quoted = false;
        else field += character;
      } else if (character === '"' && field === "") quoted = true;
      else if (character === ",") { row.push(field.trim()); field = ""; }
      else if (character === "\n" || character === "\r") {
        if (character === "\r" && text[index + 1] === "\n") index += 1;
        row.push(field.trim()); field = "";
        if (row.some((cell) => cell !== "")) rows.push(row);
        row = [];
      } else field += character;
    }
    if (quoted) throw new Error("The CSV file contains an unclosed quoted field.");
    row.push(field.trim());
    if (row.some((cell) => cell !== "")) rows.push(row);
    return rows;
  }

async function importStudents(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) throw new Error("CSV files must be 2 MB or smaller.");
    const rows = parseCsv(await file.text());
    if (rows.length < 2) throw new Error("Add a header row and at least one student record.");
    const headers = rows[0].map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, "") : header).toLowerCase());
    const required = ["first_name", "last_name", "email", "course", "enrollment_date", "status"];
    const missing = required.filter((header) => !headers.includes(header));
    if (missing.length) throw new Error(`Missing required columns: ${missing.join(", ")}.`);
    if (rows.length > 501) throw new Error("Import up to 500 students at a time.");
    const failures = [];
    let imported = 0;
    for (const [index, cells] of rows.slice(1).entries()) {
      if (cells.length !== headers.length) { failures.push(`Row ${index + 2}: column count does not match the header.`); continue; }
      const record = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex]]));
      if (record.date_of_birth === "") record.date_of_birth = null;
      try { await api("/api/students", { method: "POST", body: JSON.stringify(record) }); imported += 1; }
      catch (error) { failures.push(`Row ${index + 2}: ${error.message}`); }
    }
    await Promise.all([loadStudents(), loadCourses(), loadDashboard()]);
    if (failures.length) {
      showToast(`Imported ${imported}; ${failures.length} row${failures.length === 1 ? "" : "s"} need attention.`, imported === 0);
      window.alert(failures.slice(0, 20).join("\n") + (failures.length > 20 ? `\n…and ${failures.length - 20} more.` : ""));
    } else showToast(`Imported ${imported} student${imported === 1 ? "" : "s"}.`);
  }

async function searchGlobally(term) {
    const results = document.querySelector("#global-search-results");
    const requestId = ++globalSearchRequest;
    if (!term.trim()) { results.hidden = true; results.innerHTML = ""; return; }
    try {
      const data = await api(`/api/search?q=${encodeURIComponent(term.trim())}`);
      if (requestId !== globalSearchRequest) return;
      const studentResults = data.students.map((student) => `<button type="button" class="global-result" data-action="profile" data-id="${student.id}"><span class="result-type">Student</span><span><strong>${escapeHtml(student.full_name)}</strong><small>${escapeHtml(student.course)} · ${escapeHtml(student.email)}</small></span></button>`).join("");
      const courseResults = data.courses.map((course) => `<button type="button" class="global-result" data-action="course-search" data-course="${escapeHtml(course.name)}"><span class="result-type">Course</span><span><strong>${escapeHtml(course.name)}</strong></span></button>`).join("");
      const gradeResults = data.grades.map((grade) => `<button type="button" class="global-result" data-action="profile" data-id="${grade.student_id}"><span class="result-type">Assessment</span><span><strong>${escapeHtml(grade.assessment)}</strong><small>${escapeHtml(grade.student_name)}</small></span></button>`).join("");
      const feeResults = data.fees.map((fee) => `<button type="button" class="global-result" data-action="profile" data-id="${fee.student_id}"><span class="result-type">Fee</span><span><strong>${escapeHtml(fee.description)}</strong><small>${escapeHtml(fee.student_name)}</small></span></button>`).join("");
      const eventResults = data.events.map((item) => `<button type="button" class="global-result" data-action="event-search"><span class="result-type">Event</span><span><strong>${escapeHtml(item.title)}</strong><small>${new Date(`${item.event_date}T00:00:00`).toLocaleDateString()}</small></span></button>`).join("");
      results.innerHTML = studentResults + courseResults + gradeResults + feeResults + eventResults || '<div class="global-no-results">No matching records found.</div>';
      results.hidden = false;
    } catch (error) { showToast(error.message, true); results.hidden = true; }
  }

async function loadCourses() {
  try {
    const data = await api("/api/courses");
    courses = data.courses;
    document.querySelector("#course-count").textContent = courses.length;
    document.querySelector("#courses-results-label").textContent =
      `Showing ${courses.length} course${courses.length === 1 ? "" : "s"}`;
    if (!courses.length) {
      courseList.innerHTML = '<tr><td class="empty-cell" colspan="5"><span class="empty-icon">✳</span><strong>No courses yet</strong><span>Create your course catalog before enrolling students.</span></td></tr>';
      return;
    }
    courseList.innerHTML = courses.map((course) => `
      <tr><td><span class="course-name">${escapeHtml(course.name)}</span><small class="course-description">${escapeHtml(course.description)}</small></td>
      <td>${course.students}</td><td>${course.active}</td><td>${course.graduated}</td>
      <td><div class="row-actions"><button class="row-action" type="button" data-action="view-course" data-course="${escapeHtml(course.name)}">Students</button><button class="row-action" type="button" data-action="edit-course" data-id="${course.id}">Edit</button><button class="row-action delete-action" type="button" data-action="delete-course" data-id="${course.id}">Delete</button></div></td></tr>`).join("");
  } catch (error) {
    courseList.innerHTML = `<tr><td class="error-cell" colspan="5">${escapeHtml(error.message)} <button class="text-button" type="button" data-action="retry">Try again</button></td></tr>`;
  }
}

async function loadAttendance() {
  const day = document.querySelector("#attendance-date").value;
  try {
    const result = await api(`/api/attendance?date=${encodeURIComponent(day)}`);
    attendanceList.innerHTML = result.records.length ? result.records.map((record) => `
      <tr><td><strong>${escapeHtml(record.student_name)}</strong></td><td>${escapeHtml(record.course)}</td>
      <td><select class="attendance-select" data-student-id="${record.student_id}" aria-label="Attendance for ${escapeHtml(record.student_name)}">
      <option value="" ${record.status ? "" : "selected"}>Not marked</option>
      ${["Present", "Absent", "Late", "Excused"].map((status) => `<option ${record.status === status ? "selected" : ""}>${status}</option>`).join("")}</select></td></tr>`).join("")
      : '<tr><td class="empty-cell" colspan="3"><strong>No students to mark</strong><span>Add students to the directory first.</span></td></tr>';
    document.querySelector("#attendance-results-label").textContent =
      `${result.records.length} student${result.records.length === 1 ? "" : "s"} · ${new Date(`${day}T00:00:00`).toLocaleDateString()}`;
  } catch (error) {
    attendanceList.innerHTML = `<tr><td class="error-cell" colspan="3">${escapeHtml(error.message)}</td></tr>`;
  }
}

async function loadGrades() {
  try {
    const result = await api("/api/grades");
    document.querySelector("#grade-count").textContent = result.grades.length;
    document.querySelector("#grade-results-label").textContent = `Showing ${result.grades.length} grade${result.grades.length === 1 ? "" : "s"}`;
    gradeList.innerHTML = result.grades.length ? result.grades.map((grade) => `
      <tr><td><strong>${escapeHtml(grade.student_name)}</strong></td><td>${escapeHtml(grade.assessment)}</td>
      <td><span class="grade-score">${grade.score} / ${grade.max_score}</span><small class="course-description">${Math.round(grade.score / grade.max_score * 100)}%</small></td>
      <td>${new Date(`${grade.grade_date}T00:00:00`).toLocaleDateString()}</td>
      <td><div class="row-actions"><button class="row-action" data-action="edit-grade" data-id="${grade.id}" type="button">Edit</button><button class="row-action delete-action" data-action="delete-grade" data-id="${grade.id}" type="button">Delete</button></div></td></tr>`).join("")
      : '<tr><td class="empty-cell" colspan="5"><strong>No grades recorded</strong><span>Record an assessment to see it here.</span></td></tr>';
  } catch (error) { gradeList.innerHTML = `<tr><td class="error-cell" colspan="5">${escapeHtml(error.message)}</td></tr>`; }
}

async function loadFees() {
  try {
    const result = await api("/api/fees");
    document.querySelector("#fee-count").textContent = result.fees.length;
    document.querySelector("#fee-results-label").textContent = `Showing ${result.fees.length} fee record${result.fees.length === 1 ? "" : "s"}`;
    feeList.innerHTML = result.fees.length ? result.fees.map((fee) => `
      <tr><td><strong>${escapeHtml(fee.student_name)}</strong></td><td>${escapeHtml(fee.description)}</td>
      <td>${fee.amount.toFixed(2)}</td><td>${fee.amount_paid.toFixed(2)}</td><td>${fee.balance.toFixed(2)}</td>
      <td>${new Date(`${fee.due_date}T00:00:00`).toLocaleDateString()}</td>
      <td><span class="status-badge status-${fee.status.toLowerCase()}"><span></span>${fee.status}</span></td>
      <td><div class="row-actions"><button class="row-action" type="button" data-action="payment" data-id="${fee.id}" data-paid="${fee.amount_paid}">Record payment</button><button class="row-action delete-action" type="button" data-action="delete-fee" data-id="${fee.id}">Delete</button></div></td></tr>`).join("")
      : '<tr><td class="empty-cell" colspan="8"><strong>No fees recorded</strong><span>Add a fee to begin tracking balances.</span></td></tr>';
  } catch (error) { feeList.innerHTML = `<tr><td class="error-cell" colspan="8">${escapeHtml(error.message)}</td></tr>`; }
}

function showView(view) {
  const activeView = viewNames.includes(view) ? view : "overview";
  for (const name of viewNames) {
    document.querySelector(`#${name}-view`).hidden = name !== activeView;
    const link = document.querySelector(`.nav-link[data-view="${name}"]`);
    link.classList.toggle("active", name === activeView);
    if (name === activeView) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  document.querySelector(".breadcrumbs strong").textContent = activeView.charAt(0).toUpperCase() + activeView.slice(1);
  document.title = `${activeView.charAt(0).toUpperCase() + activeView.slice(1)} | Campusly`;
  document.querySelector("#sidebar").classList.remove("sidebar-open");
  document.querySelector("#mobile-menu").setAttribute("aria-expanded", "false");
  if (activeView === "overview") loadDashboard();
  if (activeView === "courses") loadCourses();
  if (activeView === "attendance") loadAttendance();
  if (activeView === "grades") loadGrades();
  if (activeView === "fees") loadFees();
}

function openStudentModal(student = null) {
  editingStudentId = student?.id ?? null;
  studentForm.reset();
  document.querySelector("#form-error").textContent = "";
  document.querySelector("#modal-title").textContent = editingStudentId ? "Edit student" : "Add a student";
  document.querySelector("#save-student").textContent = editingStudentId ? "Save changes" : "Save student";
  const courseSelect = studentForm.elements.course;
  courseSelect.innerHTML = courses.map((course) => `<option value="${escapeHtml(course.name)}">${escapeHtml(course.name)}</option>`).join("");
  if (!courses.length) {
    showView("courses");
    location.hash = "courses";
    showToast("Create a course before enrolling a student.");
    return;
  }
  if (student) {
    for (const [key, value] of Object.entries(student)) {
      if (studentForm.elements.namedItem(key)) studentForm.elements.namedItem(key).value = value ?? "";
    }
  } else {
    studentForm.elements.enrollment_date.value = today();
  }
  studentModal.hidden = false;
  studentForm.elements.first_name.focus();
}

function openModal(id) {
  const modal = document.querySelector(`#${id}`);
  modal.hidden = false;
  const input = modal.querySelector("input, select");
  if (input) input.focus();
}

function closeModal(id) {
  document.querySelector(`#${id}`).hidden = true;
  if (id === "student-modal") editingStudentId = null;
  if (id === "course-modal") editingCourseId = null;
  if (id === "grade-modal") editingGradeId = null;
}

let toastTimer;
function showToast(message, isError = false) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.toggle("toast-error", isError);
  toast.classList.add("toast-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("toast-visible"), 3200);
}

async function submitForm(formElement, endpoint, method, errorId, onSuccess) {
  const button = formElement.querySelector('[type="submit"]');
  button.disabled = true;
  document.querySelector(`#${errorId}`).textContent = "";
  const values = Object.fromEntries(new FormData(formElement));
  try {
    await api(endpoint, { method, body: JSON.stringify(values) });
    await onSuccess();
  } catch (error) {
    document.querySelector(`#${errorId}`).textContent = error.message;
  } finally { button.disabled = false; }
}

document.querySelector("#add-student").addEventListener("click", () => openStudentModal());
document.querySelector("#overview-add-student").addEventListener("click", () => openStudentModal());
document.querySelector("#courses-add-student").addEventListener("click", () => openStudentModal());
document.querySelector("#add-course").addEventListener("click", () => {
  editingCourseId = null;
  document.querySelector("#course-form").reset();
  document.querySelector("#course-modal-title").textContent = "Add a course";
  openModal("course-modal");
});
document.querySelector("#add-grade").addEventListener("click", async () => {
  await refreshStudentOptions();
  editingGradeId = null;
  const form = document.querySelector("#grade-form");
  form.reset();
  form.elements.grade_date.value = today();
  document.querySelector("#grade-modal-title").textContent = "Record a grade";
  openModal("grade-modal");
});
document.querySelector("#add-fee").addEventListener("click", async () => {
  await refreshStudentOptions();
  const form = document.querySelector("#fee-form");
  form.reset();
  form.elements.amount_paid.value = "0";
  form.elements.due_date.value = today();
  openModal("fee-modal");
});
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeModal(button.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => {
  if (event.target === backdrop) closeModal(backdrop.id);
}));
document.querySelectorAll("[data-view]").forEach((link) => link.addEventListener("click", () => showView(link.dataset.view)));
window.addEventListener("hashchange", () => showView(location.hash.slice(1)));
showView(location.hash.slice(1) || "overview");
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") document.querySelectorAll(".modal-backdrop:not([hidden])").forEach((modal) => closeModal(modal.id));
});

document.querySelector("#close-modal").addEventListener("click", () => closeModal("student-modal"));
document.querySelector("#cancel-modal").addEventListener("click", () => closeModal("student-modal"));
studentModal.addEventListener("click", (event) => { if (event.target === studentModal) closeModal("student-modal"); });
searchInput.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadStudents, 220); });
statusFilter.addEventListener("change", loadStudents);
document.querySelector("#attendance-date").value = today();
document.querySelector("#attendance-date").addEventListener("change", loadAttendance);

studentList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "add") return openStudentModal();
  if (button.dataset.action === "retry") return loadStudents();
  const student = students.find((item) => item.id === Number(button.dataset.id));
  if (button.dataset.action === "profile") return openStudentProfile(button.dataset.id);
  if (button.dataset.action === "edit" && student) openStudentModal(student);
  if (button.dataset.action === "delete" && student && window.confirm(`Delete ${student.full_name}? Associated grades, fees, and attendance will also be deleted.`)) {
    try { await api(`/api/students/${student.id}`, { method: "DELETE" }); showToast(`${student.full_name} was removed.`); await Promise.all([loadStudents(), loadCourses(), loadDashboard()]); }
    catch (error) { showToast(error.message, true); }
  }
});

courseList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const course = courses.find((item) => item.id === Number(button.dataset.id));
  if (button.dataset.action === "retry") return loadCourses();
  if (button.dataset.action === "view-course") {
    searchInput.value = button.dataset.course; statusFilter.value = "";
    showView("students"); location.hash = "students"; return loadStudents();
  }
  if (!course) return;
  if (button.dataset.action === "edit-course") {
    editingCourseId = course.id;
    const form = document.querySelector("#course-form");
    form.elements.name.value = course.name; form.elements.description.value = course.description;
    document.querySelector("#course-modal-title").textContent = "Edit course";
    openModal("course-modal");
  }
  if (button.dataset.action === "delete-course" && window.confirm(`Delete ${course.name}?`)) {
    try { await api(`/api/courses/${course.id}`, { method: "DELETE" }); showToast("Course deleted."); await Promise.all([loadCourses(), loadStudents(), loadDashboard()]); }
    catch (error) { showToast(error.message, true); }
  }
});

for (const container of ["#insight-list", "#attention-list", "#global-search-results"]) {
  document.querySelector(container).addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "profile") {
      document.querySelector("#global-search-results").hidden = true;
      document.querySelector("#global-search-input").value = "";
      openStudentProfile(button.dataset.id);
    }
    if (button.dataset.action === "course-search") {
      searchInput.value = button.dataset.course;
      statusFilter.value = "";
      showView("students");
      location.hash = "students";
      loadStudents();
      document.querySelector("#global-search-results").hidden = true;
      document.querySelector("#global-search-input").value = "";
    }
    if (button.dataset.action === "event-search") {
      showView("overview");
      location.hash = "overview";
      document.querySelector("#global-search-results").hidden = true;
      document.querySelector("#global-search-input").value = "";
    }
    if (button.dataset.action === "retry-dashboard") loadDashboard();
  });
}

document.querySelector("#events-list").addEventListener("click", async (event) => {
  const button = event.target.closest('[data-action="delete-event"]');
  if (!button || !window.confirm("Remove this academic event?")) return;
  try {
    await api(`/api/events/${button.dataset.id}`, { method: "DELETE" });
    showToast("Event removed.");
    await loadDashboard();
  } catch (error) { showToast(error.message, true); }
});

gradeList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const result = await api("/api/grades");
  const grade = result.grades.find((item) => item.id === Number(button.dataset.id));
  if (button.dataset.action === "delete-grade" && window.confirm("Delete this grade record?")) {
    try { await api(`/api/grades/${button.dataset.id}`, { method: "DELETE" }); await Promise.all([loadGrades(), loadDashboard()]); showToast("Grade deleted."); }
    catch (error) { showToast(error.message, true); }
  }
  if (button.dataset.action === "edit-grade" && grade) {
    await refreshStudentOptions();
    editingGradeId = grade.id;
    const form = document.querySelector("#grade-form");
    form.elements.student_id.value = grade.student_id;
    form.elements.assessment.value = grade.assessment;
    form.elements.score.value = grade.score;
    form.elements.max_score.value = grade.max_score;
    form.elements.grade_date.value = grade.grade_date;
    document.querySelector("#grade-modal-title").textContent = "Edit grade";
    openModal("grade-modal");
  }
});

feeList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "payment") {
    const paid = window.prompt("Enter the total amount paid so far:", button.dataset.paid);
    if (paid === null) return;
    try { await api(`/api/fees/${button.dataset.id}`, { method: "PUT", body: JSON.stringify({ amount_paid: paid }) }); await Promise.all([loadFees(), loadDashboard()]); showToast("Payment record updated."); }
    catch (error) { showToast(error.message, true); }
  }
  if (button.dataset.action === "delete-fee" && window.confirm("Delete this fee record?")) {
    try { await api(`/api/fees/${button.dataset.id}`, { method: "DELETE" }); await Promise.all([loadFees(), loadDashboard()]); showToast("Fee record deleted."); }
    catch (error) { showToast(error.message, true); }
  }
});

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const wasEditing = editingStudentId !== null;
  const values = Object.fromEntries(new FormData(studentForm));
  values.date_of_birth = values.date_of_birth || null;
  try {
    await submitForm(studentForm, wasEditing ? `/api/students/${editingStudentId}` : "/api/students", wasEditing ? "PUT" : "POST", "form-error", async () => {
      closeModal("student-modal"); showToast(wasEditing ? "Student details updated." : "Student added successfully.");
      await Promise.all([loadStudents(), loadCourses(), loadDashboard()]);
    });
  } catch (error) { showToast(error.message, true); }
});

document.querySelector("#course-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitForm(event.currentTarget, editingCourseId ? `/api/courses/${editingCourseId}` : "/api/courses", editingCourseId ? "PUT" : "POST", "course-form-error", async () => {
    closeModal("course-modal"); showToast("Course saved."); await Promise.all([loadCourses(), loadStudents(), loadDashboard()]);
  });
});

document.querySelector("#grade-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const method = editingGradeId ? "PUT" : "POST";
  const endpoint = editingGradeId ? `/api/grades/${editingGradeId}` : "/api/grades";
  await submitForm(event.currentTarget, endpoint, method, "grade-form-error", async () => {
    closeModal("grade-modal"); showToast("Grade saved."); await Promise.all([loadGrades(), loadDashboard()]);
  });
});

document.querySelector("#fee-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitForm(event.currentTarget, "/api/fees", "POST", "fee-form-error", async () => {
    closeModal("fee-modal"); showToast("Fee record saved."); await Promise.all([loadFees(), loadDashboard()]);
  });
});

document.querySelector("#save-attendance").addEventListener("click", async () => {
  const records = [...attendanceList.querySelectorAll(".attendance-select")].map((select) => ({
    student_id: Number(select.dataset.studentId), status: select.value,
  }));
  try {
    await api("/api/attendance", { method: "PUT", body: JSON.stringify({ date: document.querySelector("#attendance-date").value, records }) });
    showToast(`Attendance saved for ${records.length} student${records.length === 1 ? "" : "s"}.`);
    await Promise.all([loadAttendance(), loadDashboard()]);
  } catch (error) { showToast(error.message, true); }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try { await api("/api/auth/logout", { method: "POST" }); window.location.replace("/login"); }
  catch (error) { showToast(error.message, true); }
});

document.querySelector("#today-label").textContent = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
document.querySelector("#greeting-period").textContent = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening";
document.querySelector("#mobile-menu").addEventListener("click", (event) => {
  const isOpen = document.querySelector("#sidebar").classList.toggle("sidebar-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("#add-event").addEventListener("click", () => {
  document.querySelector("#event-form").reset();
  document.querySelector("#event-form-error").textContent = "";
  document.querySelector('#event-form [name="event_date"]').value = today();
  openModal("event-modal");
});
document.querySelector("#events-add-inline").addEventListener("click", () => document.querySelector("#add-event").click());
document.querySelector("#event-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  document.querySelector("#event-form-error").textContent = "";
  try {
    await api("/api/events", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    closeModal("event-modal");
    showToast("Academic event added.");
    await loadDashboard();
  } catch (error) { document.querySelector("#event-form-error").textContent = error.message; }
  finally { button.disabled = false; }
});

document.querySelector("#import-students").addEventListener("click", () => document.querySelector("#student-import-file").click());
document.querySelector("#student-import-file").addEventListener("change", async (event) => {
  const input = event.currentTarget;
  try { await importStudents(input.files[0]); }
  catch (error) { showToast(error.message, true); }
  finally { input.value = ""; }
});

const globalSearchInput = document.querySelector("#global-search-input");
globalSearchInput.addEventListener("input", () => {
  clearTimeout(globalSearchTimer);
  globalSearchTimer = setTimeout(() => searchGlobally(globalSearchInput.value), 180);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".topbar-actions")) {
    document.querySelector("#notification-panel").hidden = true;
    document.querySelector("#notification-button").setAttribute("aria-expanded", "false");
    document.querySelector("#global-search-results").hidden = true;
  }
});
document.querySelector("#notification-button").addEventListener("click", () => {
  const panel = document.querySelector("#notification-panel");
  panel.hidden = !panel.hidden;
  document.querySelector("#notification-button").setAttribute("aria-expanded", String(!panel.hidden));
});
document.querySelector("#theme-toggle").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  localStorage.setItem("campusly-theme", dark ? "dark" : "light");
  document.querySelector("#theme-toggle").setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
});
try {
  const savedTheme = localStorage.getItem("campusly-theme");
  if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
} catch (error) { showToast("Theme preference could not be saved in this browser.", true); }
document.querySelector("#theme-toggle").setAttribute(
  "aria-label",
  document.documentElement.dataset.theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
);
document.querySelector("#print-reports").addEventListener("click", () => window.print());
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    globalSearchInput.focus();
  }
});
sessionReady.then(() => Promise.all([loadStudents(), loadCourses(), loadDashboard()])).catch((error) => showToast(error.message, true));
