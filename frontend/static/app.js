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
      <td><div class="row-actions"><button class="row-action" type="button" data-action="edit" data-id="${student.id}" aria-label="Edit ${escapeHtml(student.full_name)}">Edit</button><button class="row-action delete-action" type="button" data-action="delete" data-id="${student.id}" aria-label="Delete ${escapeHtml(student.full_name)}">Delete</button></div></td>
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
  const activeView = viewNames.includes(view) ? view : "students";
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
showView(location.hash.slice(1));
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
  if (button.dataset.action === "edit" && student) openStudentModal(student);
  if (button.dataset.action === "delete" && student && window.confirm(`Delete ${student.full_name}? Associated grades, fees, and attendance will also be deleted.`)) {
    try { await api(`/api/students/${student.id}`, { method: "DELETE" }); showToast(`${student.full_name} was removed.`); await Promise.all([loadStudents(), loadCourses()]); }
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
    try { await api(`/api/courses/${course.id}`, { method: "DELETE" }); showToast("Course deleted."); await Promise.all([loadCourses(), loadStudents()]); }
    catch (error) { showToast(error.message, true); }
  }
});

gradeList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const result = await api("/api/grades");
  const grade = result.grades.find((item) => item.id === Number(button.dataset.id));
  if (button.dataset.action === "delete-grade" && window.confirm("Delete this grade record?")) {
    try { await api(`/api/grades/${button.dataset.id}`, { method: "DELETE" }); await loadGrades(); showToast("Grade deleted."); }
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
    try { await api(`/api/fees/${button.dataset.id}`, { method: "PUT", body: JSON.stringify({ amount_paid: paid }) }); await loadFees(); showToast("Payment record updated."); }
    catch (error) { showToast(error.message, true); }
  }
  if (button.dataset.action === "delete-fee" && window.confirm("Delete this fee record?")) {
    try { await api(`/api/fees/${button.dataset.id}`, { method: "DELETE" }); await loadFees(); showToast("Fee record deleted."); }
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
      await Promise.all([loadStudents(), loadCourses()]);
    });
  } catch (error) { showToast(error.message, true); }
});

document.querySelector("#course-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitForm(event.currentTarget, editingCourseId ? `/api/courses/${editingCourseId}` : "/api/courses", editingCourseId ? "PUT" : "POST", "course-form-error", async () => {
    closeModal("course-modal"); showToast("Course saved."); await Promise.all([loadCourses(), loadStudents()]);
  });
});

document.querySelector("#grade-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const method = editingGradeId ? "PUT" : "POST";
  const endpoint = editingGradeId ? `/api/grades/${editingGradeId}` : "/api/grades";
  await submitForm(event.currentTarget, endpoint, method, "grade-form-error", async () => {
    closeModal("grade-modal"); showToast("Grade saved."); await loadGrades();
  });
});

document.querySelector("#fee-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  await submitForm(event.currentTarget, "/api/fees", "POST", "fee-form-error", async () => {
    closeModal("fee-modal"); showToast("Fee record saved."); await loadFees();
  });
});

document.querySelector("#save-attendance").addEventListener("click", async () => {
  const records = [...attendanceList.querySelectorAll(".attendance-select")].map((select) => ({
    student_id: Number(select.dataset.studentId), status: select.value,
  }));
  try {
    await api("/api/attendance", { method: "PUT", body: JSON.stringify({ date: document.querySelector("#attendance-date").value, records }) });
    showToast(`Attendance saved for ${records.length} student${records.length === 1 ? "" : "s"}.`);
    await loadAttendance();
  } catch (error) { showToast(error.message, true); }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try { await api("/api/auth/logout", { method: "POST" }); window.location.replace("/login"); }
  catch (error) { showToast(error.message, true); }
});

document.querySelector("#today-label").textContent = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
document.querySelector("#mobile-menu").addEventListener("click", () => document.querySelector("#sidebar").classList.toggle("sidebar-open"));
sessionReady.then(() => Promise.all([loadStudents(), loadCourses()])).catch((error) => showToast(error.message, true));
