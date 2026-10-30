import pytest

from backend.app import create_app, db


@pytest.fixture
def app(tmp_path):
    database_path = tmp_path / "test.sqlite"
    application = create_app(
        {
            "TESTING": True,
            "SECRET_KEY": "test-key-not-for-production",
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{database_path.as_posix()}",
        }
    )
    yield application
    with application.app_context():
        db.drop_all()


@pytest.fixture
def client(app):
    test_client = app.test_client()
    status = test_client.get("/api/auth/status").json
    setup = test_client.post(
        "/api/auth/setup",
        json={
            "name": "Test Admin",
            "email": "admin@example.com",
            "password": "a-very-secure-password",
        },
        headers={"X-CSRF-Token": status["csrf_token"]},
    )
    assert setup.status_code == 201
    test_client.environ_base["HTTP_X_CSRF_TOKEN"] = setup.json["csrf_token"]
    return test_client


def student_payload(email="alex@example.com"):
    return {
        "first_name": "Alex",
        "last_name": "Morgan",
        "email": email,
        "course": "Computer Science",
        "enrollment_date": "2025-09-01",
        "status": "Active",
    }


def create_course(client, name="Computer Science"):
    response = client.post("/api/courses", json={"name": name, "description": "A test course"})
    assert response.status_code == 201
    return response.json["course"]


def create_student(client, email="alex@example.com"):
    response = client.post("/api/students", json=student_payload(email))
    assert response.status_code == 201
    return response.json["student"]


def test_authentication_and_csrf(app):
    anonymous = app.test_client()
    assert anonymous.get("/").status_code == 302
    assert anonymous.get("/api/students").status_code == 401
    status = anonymous.get("/api/auth/status")
    assert status.json["setup_required"] is True
    assert anonymous.post(
        "/api/auth/setup",
        json={"name": "First Admin", "email": "first@example.com", "password": "short"},
        headers={"X-CSRF-Token": status.json["csrf_token"]},
    ).status_code == 400
    setup = anonymous.post(
        "/api/auth/setup",
        json={"name": "First Admin", "email": "first@example.com", "password": "a-very-secure-password"},
        headers={"X-CSRF-Token": status.json["csrf_token"]},
    )
    assert setup.status_code == 201
    assert anonymous.get("/").status_code == 200
    assert anonymous.get("/api/students").status_code == 200
    assert anonymous.post("/api/auth/setup", json={}).status_code == 400

    anonymous.post("/api/auth/logout", headers={"X-CSRF-Token": setup.json["csrf_token"]})
    login_status = anonymous.get("/api/auth/status").json
    bad_login = anonymous.post(
        "/api/auth/login",
        json={"email": "first@example.com", "password": "incorrect-password"},
        headers={"X-CSRF-Token": login_status["csrf_token"]},
    )
    assert bad_login.status_code == 401
    login = anonymous.post(
        "/api/auth/login",
        json={"email": "first@example.com", "password": "a-very-secure-password"},
        headers={"X-CSRF-Token": login_status["csrf_token"]},
    )
    assert login.status_code == 200
    assert login.json["user"]["name"] == "First Admin"
    assert anonymous.post("/api/courses", json={"name": "No token"}).status_code == 400


def test_vercel_requires_a_stable_session_secret(monkeypatch):
    monkeypatch.setenv("VERCEL", "1")
    monkeypatch.delenv("SECRET_KEY", raising=False)
    with pytest.raises(RuntimeError, match="stable SECRET_KEY"):
        create_app()


def test_database_initialization_is_deferred_until_api_use(tmp_path):
    database_path = tmp_path / "deferred.sqlite"
    application = create_app(
        {
            "TESTING": True,
            "SECRET_KEY": "test-key-not-for-production",
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{database_path.as_posix()}",
        }
    )
    assert not database_path.exists()

    client = application.test_client()
    assert client.get("/api/health").status_code == 200
    assert not database_path.exists()
    assert client.get("/api/auth/status").status_code == 200
    assert database_path.exists()

    with application.app_context():
        db.drop_all()


def test_student_and_course_management(client):
    page = client.get("/")
    assert page.status_code == 200
    assert b"Attendance" in page.data
    assert client.get("/login").status_code == 200
    assert client.get("/assets/app.js").status_code == 200
    assert client.get("/assets/auth.js").status_code == 200
    assert client.get("/assets/styles.css").status_code == 200
    assert client.get("/api/health").json == {"status": "ok"}

    course = create_course(client)
    student_response = client.post("/api/students", json=student_payload())
    assert student_response.status_code == 201
    student = student_response.json["student"]
    assert student["full_name"] == "Alex Morgan"
    assert client.get("/api/stats").json == {
        "total": 1, "active": 1, "graduated": 0, "courses": 1,
    }
    assert client.get("/api/courses").json["courses"] == [
        {"id": course["id"], "name": "Computer Science", "description": "A test course",
         "students": 1, "active": 1, "graduated": 0}
    ]
    assert len(client.get("/api/students?search=alex").json["students"]) == 1
    assert client.put(
        f"/api/students/{student['id']}", json={"status": "Graduated"}
    ).json["student"]["status"] == "Graduated"
    assert client.put(
        f"/api/courses/{course['id']}", json={"name": "Software Engineering"}
    ).status_code == 200
    assert client.get("/api/students").json["students"][0]["course"] == "Software Engineering"
    assert client.delete(f"/api/courses/{course['id']}").status_code == 409
    assert client.delete(f"/api/students/{student['id']}").status_code == 204
    assert client.delete(f"/api/courses/{course['id']}").status_code == 204
    assert client.get(f"/api/students/{student['id']}").status_code == 404


def test_attendance_grades_fees_and_csv_exports(client):
    create_course(client)
    student = create_student(client)
    student_id = student["id"]

    attendance = client.get("/api/attendance?date=2026-10-30")
    assert attendance.status_code == 200
    assert attendance.json["records"][0]["status"] is None
    saved_attendance = client.put(
        "/api/attendance",
        json={"date": "2026-10-30", "records": [{"student_id": student_id, "status": "Present"}]},
    )
    assert saved_attendance.json["saved"] == 1
    assert client.get("/api/attendance?date=2026-10-30").json["records"][0]["status"] == "Present"
    assert client.put(
        "/api/attendance",
        json={"date": "2026-10-30", "records": [{"student_id": student_id, "status": "Invalid"}]},
    ).status_code == 400
    assert client.put(
        "/api/attendance",
        json={"date": "2026-10-30", "records": [{"student_id": student_id, "status": ""}]},
    ).json["saved"] == 1
    assert client.get("/api/attendance?date=2026-10-30").json["records"][0]["status"] is None

    grade = client.post(
        "/api/grades",
        json={"student_id": str(student_id), "assessment": "Midterm", "score": 88, "max_score": 100, "grade_date": "2026-10-20"},
    )
    assert grade.status_code == 201
    grade_id = grade.json["grade"]["id"]
    assert grade.json["grade"]["score"] == 88
    assert client.put(
        f"/api/grades/{grade_id}", json={"score": 92}
    ).json["grade"]["score"] == 92
    assert client.post(
        "/api/grades",
        json={"student_id": student_id, "assessment": "Invalid", "score": 101, "max_score": 100, "grade_date": "2026-10-20"},
    ).status_code == 400

    fee = client.post(
        "/api/fees",
        json={"student_id": str(student_id), "description": "Semester tuition", "amount": 1000, "amount_paid": 250, "due_date": "2026-11-15"},
    )
    assert fee.status_code == 201
    fee_id = fee.json["fee"]["id"]
    assert fee.json["fee"]["status"] == "Partial"
    assert fee.json["fee"]["balance"] == 750
    assert client.put(
        f"/api/fees/{fee_id}", json={"amount_paid": 1000}
    ).json["fee"]["status"] == "Paid"
    assert client.put(f"/api/fees/{fee_id}", json={"amount_paid": 1001}).status_code == 400

    for report in ("students", "courses", "attendance", "grades", "fees"):
        response = client.get(f"/api/reports/{report}.csv")
        assert response.status_code == 200
        assert response.mimetype == "text/csv"
        assert "attachment;" in response.headers["Content-Disposition"]
        assert response.data.count(b"\n") >= 1
    assert client.delete(f"/api/students/{student_id}").status_code == 204
    assert client.get("/api/grades").json["grades"] == []
    assert client.get("/api/fees").json["fees"] == []


def test_validation_and_duplicate_email(client):
    assert client.post("/api/students", json={}).status_code == 400
    assert client.post("/api/students", json=[]).status_code == 400
    assert client.post("/api/courses", json=[]).status_code == 400
    assert client.post("/api/grades", json=[]).status_code == 400
    assert client.post("/api/fees", json=[]).status_code == 400
    assert client.put("/api/attendance", json=[]).status_code == 400
    create_course(client)
    assert client.post("/api/students", json=student_payload()).status_code == 201
    assert client.post("/api/students", json=student_payload()).status_code == 409
    assert client.post("/api/courses", json={"name": "Computer Science"}).status_code == 409
    assert client.delete("/api/courses/1").status_code == 409
