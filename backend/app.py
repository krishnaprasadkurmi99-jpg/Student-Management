import csv
import io
import os
import re
import tempfile
import secrets
from threading import Lock
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path

import click
from dotenv import load_dotenv
from flask import Flask, Response, jsonify, redirect, render_template, request, send_from_directory, session, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import URL, UniqueConstraint, case, func, or_
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

db = SQLAlchemy()

STUDENT_STATUSES = {"Active", "Graduated", "On leave"}
ATTENDANCE_STATUSES = {"Present", "Absent", "Late", "Excused"}
FEE_STATUSES = {"Pending", "Partial", "Paid"}
STUDENT_FIELDS = (
    "first_name", "last_name", "email", "phone", "course", "date_of_birth",
    "enrollment_date", "status", "address",
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(254), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False, default="")
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        counts = db.session.query(
            func.count(Student.id),
            func.sum(case((Student.status == "Active", 1), else_=0)),
            func.sum(case((Student.status == "Graduated", 1), else_=0)),
        ).filter(Student.course == self.name).one()
        return {
            "id": self.id, "name": self.name, "description": self.description,
            "students": counts[0], "active": counts[1] or 0, "graduated": counts[2] or 0,
        }


class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(254), nullable=False, unique=True, index=True)
    phone = db.Column(db.String(30), nullable=False, default="")
    course = db.Column(db.String(120), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=True)
    enrollment_date = db.Column(db.Date, nullable=False, default=date.today)
    status = db.Column(db.String(20), nullable=False, default="Active")
    address = db.Column(db.Text, nullable=False, default="")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        created_at = self.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        return {
            "id": self.id, "first_name": self.first_name, "last_name": self.last_name,
            "full_name": f"{self.first_name} {self.last_name}", "email": self.email,
            "phone": self.phone, "course": self.course,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "enrollment_date": self.enrollment_date.isoformat(), "status": self.status,
            "address": self.address, "created_at": created_at.isoformat().replace("+00:00", "Z"),
        }


class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_date = db.Column(db.Date, nullable=False, index=True)
    status = db.Column(db.String(12), nullable=False)
    __table_args__ = (UniqueConstraint("student_id", "attendance_date", name="uq_attendance_student_date"),)


class Grade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment = db.Column(db.String(120), nullable=False)
    score = db.Column(db.Numeric(10, 2), nullable=False)
    max_score = db.Column(db.Numeric(10, 2), nullable=False)
    grade_date = db.Column(db.Date, nullable=False, default=date.today)

    def to_dict(self):
        student = db.session.get(Student, self.student_id)
        return {
            "id": self.id, "student_id": self.student_id,
            "student_name": f"{student.first_name} {student.last_name}",
            "assessment": self.assessment, "score": float(self.score),
            "max_score": float(self.max_score), "grade_date": self.grade_date.isoformat(),
        }


class Fee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id", ondelete="CASCADE"), nullable=False, index=True)
    description = db.Column(db.String(160), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    amount_paid = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    due_date = db.Column(db.Date, nullable=False)

    def to_dict(self):
        student = db.session.get(Student, self.student_id)
        status = "Paid" if self.amount_paid >= self.amount else "Partial" if self.amount_paid > 0 else "Pending"
        return {
            "id": self.id, "student_id": self.student_id,
            "student_name": f"{student.first_name} {student.last_name}",
            "description": self.description, "amount": float(self.amount),
            "amount_paid": float(self.amount_paid), "balance": float(self.amount - self.amount_paid),
            "due_date": self.due_date.isoformat(), "status": status,
        }


class AcademicEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    event_date = db.Column(db.Date, nullable=False, index=True)
    description = db.Column(db.String(500), nullable=False, default="")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id, "title": self.title,
            "event_date": self.event_date.isoformat(), "description": self.description,
        }


def _database_url():
    local_database = os.environ.get("CAMPUSLY_DB_NAME", "").strip()
    if local_database:
        username = os.environ.get("CAMPUSLY_DB_USER", "").strip()
        password = os.environ.get("CAMPUSLY_DB_PASSWORD", "")
        host = os.environ.get("CAMPUSLY_DB_HOST", "").strip()
        port = os.environ.get("CAMPUSLY_DB_PORT", "").strip()
        missing = [
            name for name, value in (
                ("CAMPUSLY_DB_USER", username),
                ("CAMPUSLY_DB_PASSWORD", password),
                ("CAMPUSLY_DB_HOST", host),
                ("CAMPUSLY_DB_PORT", port),
            ) if not value
        ]
        if missing:
            raise RuntimeError(f"Local PostgreSQL configuration is incomplete: {', '.join(missing)}.")
        try:
            port_number = int(port)
        except ValueError as error:
            raise RuntimeError("CAMPUSLY_DB_PORT must be a valid port number.") from error
        return URL.create(
            "postgresql+psycopg",
            username=username,
            password=password,
            host=host,
            port=port_number,
            database=local_database,
        )

    url = os.environ.get("DATABASE_URL", "").strip()
    if url:
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg://", 1)
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    return "sqlite:///student_management.db"

def _parse_date(value, field, required=True):
    if not value and not required:
        return None, None
    if not isinstance(value, str):
        return None, f"{field} must use YYYY-MM-DD format."
    try:
        return date.fromisoformat(value), None
    except ValueError:
        return None, f"{field} must be a valid YYYY-MM-DD date."


def _validate_student(data, partial=False):
    if not isinstance(data, dict):
        return {}, {"body": "Request body must be a JSON object."}
    values, errors = {}, {}
    required = set() if partial else {"first_name", "last_name", "email", "course", "enrollment_date", "status"}
    for field in STUDENT_FIELDS:
        if field not in data:
            if field in required:
                errors[field] = "This field is required."
            continue
        value = data[field]
        if field in ("date_of_birth", "enrollment_date"):
            parsed, error = _parse_date(value, field, field != "date_of_birth")
            if error:
                errors[field] = error
            else:
                values[field] = parsed
            continue
        value = str(value).strip() if value is not None else ""
        if field in required and not value:
            errors[field] = "This field cannot be empty."
        elif field == "email" and value and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            errors[field] = "Enter a valid email address."
        elif field == "status" and value not in STUDENT_STATUSES:
            errors[field] = "Choose Active, Graduated, or On leave."
        else:
            values[field] = value
    return values, errors


def _csrf_token():
    token = session.get("csrf_token")
    if not token:
        token = secrets.token_urlsafe(32)
        session["csrf_token"] = token
    return token


def _json_object_body():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return None
    return body


def _json_error(message, status):
    return jsonify({"error": message}), status


def _parse_money(value, field, allow_zero=True):
    if isinstance(value, bool):
        return None, f"{field} must be a valid amount."
    try:
        amount = Decimal(str(value)).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError, TypeError):
        return None, f"{field} must be a valid amount."
    if not amount.is_finite() or amount < 0 or (not allow_zero and amount == 0):
        return None, f"{field} must be {'greater than' if not allow_zero else 'at least'} zero."
    return amount, None


def _student_id(value):
    if isinstance(value, bool):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _csv_response(filename, headers, rows):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    for row in rows:
        writer.writerow([
            "'" + value if isinstance(value, str) and value.startswith(("=", "+", "-", "@", "\t", "\r")) else value
            for value in row
        ])
    return Response(
        output.getvalue(), mimetype="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def create_app(test_config=None):
    if os.environ.get("VERCEL") and not os.environ.get("SECRET_KEY"):
        raise RuntimeError(
            "Set a stable SECRET_KEY in the Vercel project environment variables."
        )

    frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
    public_assets_dir = Path(__file__).resolve().parent.parent / "public" / "assets"

    if os.environ.get("VERCEL"):
        instance_dir = Path(tempfile.gettempdir()) / "student_management_instance"
    else:
        instance_dir = Path(__file__).resolve().parent.parent / "instance"
    instance_dir.mkdir(parents=True, exist_ok=True)

    app = Flask(
        __name__,
        template_folder=str(frontend_dir / "templates"),
        static_folder=None,
        instance_path=str(instance_dir),
    )
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI=_database_url(),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SECRET_KEY=os.environ.get("SECRET_KEY") or secrets.token_hex(32),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get(
            "SESSION_COOKIE_SECURE", "1" if os.environ.get("VERCEL") else "0"
        ) == "1",
        JSON_SORT_KEYS=False,
    )
    if test_config:
        app.config.update(test_config)
    if os.environ.get("VERCEL") and not os.environ.get("DATABASE_URL"):
        app.logger.warning(
            "DATABASE_URL is unset; Vercel SQLite storage is temporary and not durable."
        )
    db.init_app(app)

    database_initialized = False
    database_init_lock = Lock()

    @app.before_request
    def initialize_database():
        nonlocal database_initialized
        if (
            request.path in {"/", "/login", "/api/health"}
            or request.path.startswith("/assets/")
        ):
            return None
        if request.path.startswith("/api/") and request.path not in {
            "/api/auth/status",
            "/api/auth/setup",
            "/api/auth/login",
        } and not session.get("user_id"):
            return None
        if database_initialized:
            return None
        with database_init_lock:
            if database_initialized:
                return None
            db.create_all()
            for (course_name,) in db.session.query(Student.course).distinct().all():
                if not Course.query.filter_by(name=course_name).first():
                    db.session.add(Course(name=course_name))
            db.session.commit()
            database_initialized = True
        return None

    @app.before_request
    def protect_api():
        public = {
            "/login", "/api/health", "/api/auth/status",
            "/api/auth/setup", "/api/auth/login",
        }
        if request.path.startswith("/static/") or request.path in public:
            return None
        if request.path.startswith("/api/"):
            if not session.get("user_id"):
                return _json_error("Sign in to continue.", 401)
            if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
                supplied = request.headers.get("X-CSRF-Token", "")
                if not supplied or not secrets.compare_digest(supplied, session.get("csrf_token", "")):
                    return _json_error("Invalid or missing CSRF token.", 400)
        return None

    @app.get("/login")
    def login_page():
        return render_template("login.html")

    @app.get("/assets/<path:filename>")
    def local_asset(filename):
        return send_from_directory(public_assets_dir, filename)

    @app.get("/")
    def index():
        if not session.get("user_id"):
            return redirect(url_for("login_page"))
        return render_template("index.html")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.get("/api/auth/status")
    def auth_status():
        return jsonify({
            "setup_required": User.query.count() == 0,
            "authenticated": session.get("user_id") is not None,
            "csrf_token": _csrf_token(),
        })

    @app.post("/api/auth/setup")
    def setup_admin():
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        supplied = request.headers.get("X-CSRF-Token", "")
        if not supplied or not secrets.compare_digest(supplied, session.get("csrf_token", "")):
            return _json_error("Invalid or missing CSRF token.", 400)
        if User.query.count():
            return _json_error("Administrator setup has already been completed.", 409)
        name, email, password = str(data.get("name", "")).strip(), str(data.get("email", "")).strip().lower(), data.get("password", "")
        if not name or len(name) > 100:
            return _json_error("Enter an administrator name (up to 100 characters).", 400)
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            return _json_error("Enter a valid email address.", 400)
        if not isinstance(password, str) or len(password) < 12:
            return _json_error("Choose a password with at least 12 characters.", 400)
        user = User(name=name, email=email, password_hash=generate_password_hash(password))
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return _json_error("An account with this email already exists.", 409)
        session.clear()
        session["user_id"] = user.id
        _csrf_token()
        return jsonify({"user": {"name": user.name, "email": user.email}, "csrf_token": session["csrf_token"]}), 201

    @app.post("/api/auth/login")
    def login():
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        supplied = request.headers.get("X-CSRF-Token", "")
        if not supplied or not secrets.compare_digest(supplied, session.get("csrf_token", "")):
            return _json_error("Invalid or missing CSRF token.", 400)
        email = str(data.get("email", "")).strip().lower()
        user = User.query.filter_by(email=email).first()
        if user is None or not check_password_hash(user.password_hash, str(data.get("password", ""))):
            return _json_error("Email or password is incorrect.", 401)
        session.clear()
        session["user_id"] = user.id
        _csrf_token()
        return jsonify({"user": {"name": user.name, "email": user.email}, "csrf_token": session["csrf_token"]})

    @app.post("/api/auth/logout")
    def logout():
        session.clear()
        return jsonify({"logged_out": True})

    @app.get("/api/auth/me")
    def current_user():
        user = db.session.get(User, session["user_id"])
        if user is None:
            session.clear()
            return _json_error("Sign in to continue.", 401)
        return jsonify({"user": {"name": user.name, "email": user.email}, "csrf_token": _csrf_token()})

    @app.get("/api/stats")
    def stats():
        return jsonify({
            "total": Student.query.count(),
            "active": Student.query.filter_by(status="Active").count(),
            "graduated": Student.query.filter_by(status="Graduated").count(),
            "courses": Course.query.count(),
        })

    @app.get("/api/dashboard")
    def dashboard():
        today = date.today()
        period_start = date.fromordinal(today.toordinal() - 29)
        total, active = Student.query.count(), Student.query.filter_by(status="Active").count()

        recorded_attendance = Attendance.query.filter(
            Attendance.attendance_date >= period_start,
            Attendance.attendance_date <= today,
            Attendance.status != "Excused",
        ).all()
        attendance_rate = (
            round(sum(record.status in {"Present", "Late"} for record in recorded_attendance) / len(recorded_attendance) * 100)
            if recorded_attendance else None
        )

        pending_balance = db.session.query(func.sum(Fee.amount - Fee.amount_paid)).filter(
            Fee.amount > Fee.amount_paid
        ).scalar() or Decimal("0")
        fee_rows = db.session.query(Fee, Student).join(Student).filter(
            Fee.amount > Fee.amount_paid
        ).order_by(Fee.due_date).all()
        fees = [fee for fee, _student in fee_rows]

        enrollment = []
        for offset in range(5, -1, -1):
            month_index = today.year * 12 + today.month - 1 - offset
            year, month = divmod(month_index, 12)
            month += 1
            enrollment.append({
                "month": date(year, month, 1).strftime("%b"),
                "count": Student.query.filter(
                    func.strftime("%Y-%m", Student.enrollment_date) == f"{year:04d}-{month:02d}"
                ).count() if db.engine.dialect.name == "sqlite" else db.session.query(func.count(Student.id)).filter(
                    func.extract("year", Student.enrollment_date) == year,
                    func.extract("month", Student.enrollment_date) == month,
                ).scalar(),
            })

        attendance_trend = []
        for index in range(5):
            week_start = date.fromordinal(period_start.toordinal() + index * 6)
            week_end = date.fromordinal(min(today.toordinal(), week_start.toordinal() + 5))
            weekly = Attendance.query.filter(
                Attendance.attendance_date >= week_start,
                Attendance.attendance_date <= week_end,
                Attendance.status != "Excused",
            ).all()
            attendance_trend.append({
                "label": week_start.strftime("%d %b"),
                "rate": round(sum(item.status in {"Present", "Late"} for item in weekly) / len(weekly) * 100) if weekly else None,
            })

        insights, attention = [], {}
        active_students = Student.query.filter_by(status="Active").order_by(Student.last_name, Student.first_name).all()
        attendance_by_student = {}
        for student_id, status in db.session.query(Attendance.student_id, Attendance.status).join(Student).filter(
            Student.status == "Active",
            Attendance.attendance_date >= period_start,
            Attendance.attendance_date <= today,
            Attendance.status != "Excused",
        ).all():
            attendance_by_student.setdefault(student_id, []).append(status)
        grades_by_student = {}
        for student_id, score, maximum in db.session.query(
            Grade.student_id, Grade.score, Grade.max_score
        ).join(Student).filter(Student.status == "Active").order_by(
            Grade.student_id, Grade.grade_date.desc(), Grade.id.desc()
        ).all():
            student_grades = grades_by_student.setdefault(student_id, [])
            if len(student_grades) < 2:
                student_grades.append((score, maximum))

        for student in active_students:
            marks = attendance_by_student.get(student.id, [])
            if len(marks) >= 3:
                rate = round(sum(status in {"Present", "Late"} for status in marks) / len(marks) * 100)
                if rate < 75:
                    insights.append({
                        "type": "attendance", "student_id": student.id, "student_name": f"{student.first_name} {student.last_name}",
                        "message": f"Attendance is {rate}% over the last 30 days.", "severity": "high" if rate < 60 else "medium",
                    })
                    attention[student.id] = student

            grades_for_student = grades_by_student.get(student.id, [])
            if len(grades_for_student) == 2:
                latest, previous = (float(score / maximum * 100) for score, maximum in grades_for_student)
                if previous - latest >= 10:
                    insights.append({
                        "type": "grades", "student_id": student.id, "student_name": f"{student.first_name} {student.last_name}",
                        "message": f"Recent assessment average declined by {round(previous - latest)} percentage points.", "severity": "medium",
                    })
                    attention[student.id] = student

        for fee, student in fee_rows:
            if student:
                overdue = fee.due_date < today
                insights.append({
                    "type": "fees", "student_id": student.id, "student_name": f"{student.first_name} {student.last_name}",
                    "message": f"{fee.description} has an {'overdue' if overdue else 'pending'} balance of {fee.amount - fee.amount_paid:.2f}.",
                    "severity": "high" if overdue else "medium",
                })
                attention[student.id] = student

        activity = []
        for student in Student.query.order_by(Student.created_at.desc()).limit(6).all():
            activity.append({
                "date": student.created_at.isoformat(),
                "label": f"{student.first_name} {student.last_name} enrolled",
                "detail": student.course, "kind": "student",
            })
        for grade, student in db.session.query(Grade, Student).join(Student).order_by(Grade.grade_date.desc(), Grade.id.desc()).limit(6).all():
            activity.append({
                "date": grade.grade_date.isoformat(),
                "label": f"Assessment recorded for {student.first_name} {student.last_name}",
                "detail": f"{grade.assessment} · {grade.score:g}/{grade.max_score:g}", "kind": "grade",
            })
        for record, student in db.session.query(Attendance, Student).join(Student).order_by(Attendance.attendance_date.desc(), Attendance.id.desc()).limit(6).all():
            activity.append({
                "date": record.attendance_date.isoformat(),
                "label": f"{record.status} · {student.first_name} {student.last_name}",
                "detail": "Attendance record", "kind": "attendance",
            })
        activity.sort(key=lambda item: item["date"], reverse=True)

        events = AcademicEvent.query.filter(AcademicEvent.event_date >= today).order_by(AcademicEvent.event_date).limit(6).all()
        return jsonify({
            "metrics": {
                "total": total, "active": active,
                "graduated": Student.query.filter_by(status="Graduated").count(),
                "courses": Course.query.count(), "attendance_rate": attendance_rate,
                "pending_fees": float(pending_balance),
            },
            "enrollment": enrollment, "attendance_trend": attendance_trend,
            "insights": insights[:12],
            "attention": [{"id": item.id, "full_name": f"{item.first_name} {item.last_name}", "course": item.course} for item in list(attention.values())[:6]],
            "activity": activity[:8], "events": [event.to_dict() for event in events],
            "overdue_fee_count": sum(fee.due_date < today for fee in fees),
        })

    @app.get("/api/search")
    def global_search():
        term = request.args.get("q", "").strip()
        if not term:
            return jsonify({"students": [], "courses": [], "grades": [], "fees": [], "events": []})
        pattern = f"%{term}%"
        found_students = Student.query.filter(or_(
            Student.first_name.ilike(pattern), Student.last_name.ilike(pattern),
            Student.email.ilike(pattern), Student.course.ilike(pattern),
        )).order_by(Student.last_name, Student.first_name).limit(8).all()
        found_courses = Course.query.filter(or_(
            Course.name.ilike(pattern), Course.description.ilike(pattern),
        )).order_by(Course.name).limit(5).all()
        found_grades = db.session.query(Grade, Student).join(Student).filter(or_(
            Grade.assessment.ilike(pattern), Student.first_name.ilike(pattern),
            Student.last_name.ilike(pattern),
        )).order_by(Grade.grade_date.desc(), Grade.id.desc()).limit(5).all()
        found_fees = db.session.query(Fee, Student).join(Student).filter(or_(
            Fee.description.ilike(pattern), Student.first_name.ilike(pattern),
            Student.last_name.ilike(pattern),
        )).order_by(Fee.due_date).limit(5).all()
        found_events = AcademicEvent.query.filter(or_(
            AcademicEvent.title.ilike(pattern), AcademicEvent.description.ilike(pattern),
        )).order_by(AcademicEvent.event_date).limit(5).all()
        return jsonify({
            "students": [{"id": item.id, "full_name": f"{item.first_name} {item.last_name}", "email": item.email, "course": item.course} for item in found_students],
            "courses": [{"id": item.id, "name": item.name} for item in found_courses],
            "grades": [{"id": grade.id, "student_id": student.id, "student_name": f"{student.first_name} {student.last_name}", "assessment": grade.assessment} for grade, student in found_grades],
            "fees": [{"id": fee.id, "student_id": student.id, "student_name": f"{student.first_name} {student.last_name}", "description": fee.description} for fee, student in found_fees],
            "events": [{"id": event.id, "title": event.title, "event_date": event.event_date.isoformat()} for event in found_events],
        })

    @app.get("/api/students/<int:student_id>/profile")
    def student_profile(student_id):
        student = db.session.get(Student, student_id)
        if student is None:
            return _json_error("Student not found.", 404)
        marks = Attendance.query.filter_by(student_id=student_id).order_by(Attendance.attendance_date.desc()).all()
        grades_for_student = Grade.query.filter_by(student_id=student_id).order_by(Grade.grade_date.desc(), Grade.id.desc()).all()
        fees_for_student = Fee.query.filter_by(student_id=student_id).order_by(Fee.due_date).all()
        eligible_marks = [mark for mark in marks if mark.status != "Excused"]
        attendance_rate = round(sum(mark.status in {"Present", "Late"} for mark in eligible_marks) / len(eligible_marks) * 100) if eligible_marks else None
        achievements = []
        if attendance_rate is not None and attendance_rate >= 95:
            achievements.append({"title": "Consistent presence", "detail": "At least 95% recorded attendance"})
        if grades_for_student and sum(float(item.score / item.max_score * 100) for item in grades_for_student) / len(grades_for_student) >= 90:
            achievements.append({"title": "Academic distinction", "detail": "Assessment average of 90% or higher"})
        return jsonify({
            "student": student.to_dict(),
            "attendance": {
                "rate": attendance_rate, "present": sum(mark.status in {"Present", "Late"} for mark in marks),
                "total": len(eligible_marks), "records": [
                    {"date": mark.attendance_date.isoformat(), "status": mark.status} for mark in marks[:12]
                ],
            },
            "grades": [item.to_dict() for item in grades_for_student],
            "fees": [item.to_dict() for item in fees_for_student],
            "achievements": achievements,
        })

    @app.route("/api/events", methods=["GET", "POST"])
    def academic_events():
        if request.method == "GET":
            events = AcademicEvent.query.order_by(AcademicEvent.event_date).all()
            return jsonify({"events": [event.to_dict() for event in events]})
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        title = str(data.get("title", "")).strip()
        description = str(data.get("description", "")).strip()
        event_date, error = _parse_date(data.get("event_date"), "event_date")
        if not title or len(title) > 120 or len(description) > 500 or error:
            return _json_error(error or "Event title is required (up to 120 characters) and description must be at most 500 characters.", 400)
        event = AcademicEvent(title=title, description=description, event_date=event_date)
        db.session.add(event)
        db.session.commit()
        return jsonify({"event": event.to_dict()}), 201

    @app.delete("/api/events/<int:event_id>")
    def delete_academic_event(event_id):
        event = db.session.get(AcademicEvent, event_id)
        if event is None:
            return _json_error("Event not found.", 404)
        db.session.delete(event)
        db.session.commit()
        return "", 204

    @app.route("/api/courses", methods=["GET", "POST"])
    def courses():
        if request.method == "GET":
            return jsonify({"courses": [course.to_dict() for course in Course.query.order_by(Course.name).all()]})
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        name = str(data.get("name", "")).strip()
        description = str(data.get("description", "")).strip()
        if not name or len(name) > 120:
            return _json_error("Course name is required and must be at most 120 characters.", 400)
        course = Course(name=name, description=description)
        db.session.add(course)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return _json_error("A course with this name already exists.", 409)
        return jsonify({"course": course.to_dict()}), 201

    @app.route("/api/courses/<int:course_id>", methods=["PUT", "DELETE"])
    def course_detail(course_id):
        course = db.session.get(Course, course_id)
        if course is None:
            return _json_error("Course not found.", 404)
        if request.method == "DELETE":
            if Student.query.filter_by(course=course.name).count():
                return _json_error("Move enrolled students to another course before deleting this course.", 409)
            db.session.delete(course)
            db.session.commit()
            return "", 204
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        name = str(data.get("name", course.name)).strip()
        if not name or len(name) > 120:
            return _json_error("Course name is required and must be at most 120 characters.", 400)
        old_name = course.name
        course.name = name
        course.description = str(data.get("description", course.description)).strip()
        Student.query.filter_by(course=old_name).update({"course": name})
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return _json_error("A course with this name already exists.", 409)
        return jsonify({"course": course.to_dict()})

    @app.get("/api/students")
    def list_students():
        query = Student.query
        search, status = request.args.get("search", "").strip(), request.args.get("status", "").strip()
        if search:
            pattern = f"%{search}%"
            query = query.filter(or_(Student.first_name.ilike(pattern), Student.last_name.ilike(pattern), Student.email.ilike(pattern), Student.course.ilike(pattern)))
        if status:
            if status not in STUDENT_STATUSES:
                return _json_error("Invalid student status.", 400)
            query = query.filter_by(status=status)
        return jsonify({"students": [student.to_dict() for student in query.order_by(Student.last_name, Student.first_name).all()]})

    @app.post("/api/students")
    def create_student():
        values, errors = _validate_student(request.get_json(silent=True))
        if values.get("course") and not Course.query.filter_by(name=values["course"]).first():
            errors["course"] = "Choose a course from the course directory."
        if errors:
            return jsonify({"error": "Validation failed.", "details": errors}), 400
        student = Student(**values)
        db.session.add(student)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return _json_error("A student with this email already exists.", 409)
        return jsonify({"student": student.to_dict()}), 201

    @app.get("/api/students/<int:student_id>")
    def get_student(student_id):
        student = db.session.get(Student, student_id)
        return jsonify({"student": student.to_dict()}) if student else _json_error("Student not found.", 404)

    @app.put("/api/students/<int:student_id>")
    def update_student(student_id):
        student = db.session.get(Student, student_id)
        if student is None:
            return _json_error("Student not found.", 404)
        values, errors = _validate_student(request.get_json(silent=True), partial=True)
        if values.get("course") and not Course.query.filter_by(name=values["course"]).first():
            errors["course"] = "Choose a course from the course directory."
        if errors:
            return jsonify({"error": "Validation failed.", "details": errors}), 400
        for field, value in values.items():
            setattr(student, field, value)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return _json_error("A student with this email already exists.", 409)
        return jsonify({"student": student.to_dict()})

    @app.delete("/api/students/<int:student_id>")
    def delete_student(student_id):
        student = db.session.get(Student, student_id)
        if student is None:
            return _json_error("Student not found.", 404)
        Attendance.query.filter_by(student_id=student.id).delete(synchronize_session=False)
        Grade.query.filter_by(student_id=student.id).delete(synchronize_session=False)
        Fee.query.filter_by(student_id=student.id).delete(synchronize_session=False)
        db.session.delete(student)
        db.session.commit()
        return "", 204

    @app.get("/api/attendance")
    def get_attendance():
        day, error = _parse_date(request.args.get("date"), "date")
        if error:
            return _json_error(error, 400)
        records = {record.student_id: record.status for record in Attendance.query.filter_by(attendance_date=day).all()}
        students = Student.query.order_by(Student.last_name, Student.first_name).all()
        return jsonify({"date": day.isoformat(), "records": [
            {"student_id": student.id, "student_name": f"{student.first_name} {student.last_name}", "course": student.course, "status": records.get(student.id)}
            for student in students
        ]})

    @app.put("/api/attendance")
    def save_attendance():
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        day, error = _parse_date(data.get("date"), "date")
        records = data.get("records")
        if error:
            return _json_error(error, 400)
        if not isinstance(records, list):
            return _json_error("records must be a list.", 400)
        for item in records:
            if not isinstance(item, dict) or item.get("status") not in ATTENDANCE_STATUSES | {None, ""}:
                return _json_error("Each attendance record must have a valid status.", 400)
            student_id = _student_id(item.get("student_id"))
            if not student_id or not db.session.get(Student, student_id):
                return _json_error("Attendance contains an unknown student.", 404)
        for item in records:
            record = Attendance.query.filter_by(student_id=item["student_id"], attendance_date=day).first()
            if item["status"] in (None, ""):
                if record:
                    db.session.delete(record)
                continue
            if record:
                record.status = item["status"]
            else:
                db.session.add(Attendance(student_id=item["student_id"], attendance_date=day, status=item["status"]))
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return _json_error("Attendance could not be saved.", 409)
        return jsonify({"date": day.isoformat(), "saved": len(records)})

    @app.route("/api/grades", methods=["GET", "POST"])
    def grades():
        if request.method == "GET":
            return jsonify({"grades": [grade.to_dict() for grade in Grade.query.order_by(Grade.grade_date.desc(), Grade.id.desc()).all()]})
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        student_id = _student_id(data.get("student_id"))
        student = db.session.get(Student, student_id) if student_id else None
        assessment = str(data.get("assessment", "")).strip()
        score, score_error = _parse_money(data.get("score"), "score")
        maximum, maximum_error = _parse_money(data.get("max_score"), "max_score", False)
        grade_date, date_error = _parse_date(data.get("grade_date"), "grade_date")
        errors = [error for error in (score_error, maximum_error, date_error) if error]
        if not student:
            errors.append("Choose a valid student.")
        if not assessment or len(assessment) > 120:
            errors.append("Assessment name is required (up to 120 characters).")
        if score is not None and maximum is not None and score > maximum:
            errors.append("Score cannot exceed the maximum score.")
        if errors:
            return jsonify({"error": "Validation failed.", "details": errors}), 400
        grade = Grade(student_id=student.id, assessment=assessment, score=score, max_score=maximum, grade_date=grade_date)
        db.session.add(grade)
        db.session.commit()
        return jsonify({"grade": grade.to_dict()}), 201

    @app.put("/api/grades/<int:grade_id>")
    def update_grade(grade_id):
        grade = db.session.get(Grade, grade_id)
        if grade is None:
            return _json_error("Grade not found.", 404)
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        assessment = str(data.get("assessment", grade.assessment)).strip()
        score, score_error = _parse_money(data.get("score", grade.score), "score")
        maximum, maximum_error = _parse_money(data.get("max_score", grade.max_score), "max_score", False)
        grade_date, date_error = _parse_date(data.get("grade_date", grade.grade_date.isoformat()), "grade_date")
        errors = [error for error in (score_error, maximum_error, date_error) if error]
        if not assessment or len(assessment) > 120:
            errors.append("Assessment name is required (up to 120 characters).")
        if score is not None and maximum is not None and score > maximum:
            errors.append("Score cannot exceed the maximum score.")
        if errors:
            return jsonify({"error": "Validation failed.", "details": errors}), 400
        grade.assessment, grade.score, grade.max_score, grade.grade_date = assessment, score, maximum, grade_date
        db.session.commit()
        return jsonify({"grade": grade.to_dict()})

    @app.delete("/api/grades/<int:grade_id>")
    def delete_grade(grade_id):
        grade = db.session.get(Grade, grade_id)
        if grade is None:
            return _json_error("Grade not found.", 404)
        db.session.delete(grade)
        db.session.commit()
        return "", 204

    @app.route("/api/fees", methods=["GET", "POST"])
    def fees():
        if request.method == "GET":
            query = Fee.query.order_by(Fee.due_date, Fee.id)
            student_id = request.args.get("student_id", type=int)
            if student_id:
                query = query.filter_by(student_id=student_id)
            return jsonify({"fees": [fee.to_dict() for fee in query.all()]})
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        student_id = _student_id(data.get("student_id"))
        student = db.session.get(Student, student_id) if student_id else None
        description = str(data.get("description", "")).strip()
        amount, amount_error = _parse_money(data.get("amount"), "amount", False)
        paid, paid_error = _parse_money(data.get("amount_paid", 0), "amount_paid")
        due_date, date_error = _parse_date(data.get("due_date"), "due_date")
        errors = [error for error in (amount_error, paid_error, date_error) if error]
        if not student:
            errors.append("Choose a valid student.")
        if not description or len(description) > 160:
            errors.append("Fee description is required (up to 160 characters).")
        if amount is not None and paid is not None and paid > amount:
            errors.append("Amount paid cannot exceed the fee amount.")
        if errors:
            return jsonify({"error": "Validation failed.", "details": errors}), 400
        fee = Fee(student_id=student.id, description=description, amount=amount, amount_paid=paid, due_date=due_date)
        db.session.add(fee)
        db.session.commit()
        return jsonify({"fee": fee.to_dict()}), 201

    @app.put("/api/fees/<int:fee_id>")
    def update_fee(fee_id):
        fee = db.session.get(Fee, fee_id)
        if fee is None:
            return _json_error("Fee record not found.", 404)
        data = _json_object_body()
        if data is None:
            return _json_error("Request body must be a JSON object.", 400)
        paid, error = _parse_money(data.get("amount_paid"), "amount_paid")
        if error:
            return _json_error(error, 400)
        if paid > fee.amount:
            return _json_error("Amount paid cannot exceed the fee amount.", 400)
        fee.amount_paid = paid
        db.session.commit()
        return jsonify({"fee": fee.to_dict()})

    @app.delete("/api/fees/<int:fee_id>")
    def delete_fee(fee_id):
        fee = db.session.get(Fee, fee_id)
        if fee is None:
            return _json_error("Fee record not found.", 404)
        db.session.delete(fee)
        db.session.commit()
        return "", 204

    @app.get("/api/reports/<report_name>.csv")
    def report_csv(report_name):
        if report_name == "students":
            students = Student.query.order_by(Student.last_name, Student.first_name).all()
            return _csv_response("students.csv", ["ID", "First name", "Last name", "Email", "Phone", "Course", "Enrollment date", "Status"], [
                [s.id, s.first_name, s.last_name, s.email, s.phone, s.course, s.enrollment_date, s.status] for s in students
            ])
        if report_name == "courses":
            return _csv_response("courses.csv", ["ID", "Course", "Description", "Students", "Active", "Graduated"], [
                [c.id, c.name, c.description, c.to_dict()["students"], c.to_dict()["active"], c.to_dict()["graduated"]]
                for c in Course.query.order_by(Course.name).all()
            ])
        if report_name == "attendance":
            rows = db.session.query(Attendance, Student).join(Student).order_by(Attendance.attendance_date.desc()).all()
            return _csv_response("attendance.csv", ["Date", "Student", "Email", "Course", "Status"], [
                [a.attendance_date, f"{s.first_name} {s.last_name}", s.email, s.course, a.status] for a, s in rows
            ])
        if report_name == "grades":
            rows = db.session.query(Grade, Student).join(Student).order_by(Grade.grade_date.desc()).all()
            return _csv_response("grades.csv", ["Date", "Student", "Email", "Assessment", "Score", "Maximum"], [
                [g.grade_date, f"{s.first_name} {s.last_name}", s.email, g.assessment, g.score, g.max_score] for g, s in rows
            ])
        if report_name == "fees":
            rows = db.session.query(Fee, Student).join(Student).order_by(Fee.due_date).all()
            return _csv_response("fees.csv", ["Student", "Email", "Description", "Amount", "Amount paid", "Balance", "Due date", "Status"], [
                [f"{s.first_name} {s.last_name}", s.email, f.description, f.amount, f.amount_paid, f.amount - f.amount_paid, f.due_date, f.to_dict()["status"]]
                for f, s in rows
            ])
        return _json_error("Unknown report. Choose students, courses, attendance, grades, or fees.", 404)

    @app.cli.command("create-admin")
    @click.option("--name", prompt="Administrator name")
    @click.option("--email", prompt="Administrator email")
    @click.password_option("--password", confirmation_prompt=True)
    def create_admin_command(name, email, password):
        """Create an administrator account for this database."""
        db.create_all()
        normalized_email = email.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized_email):
            raise click.ClickException("Enter a valid email address.")
        if len(password) < 12:
            raise click.ClickException("Password must contain at least 12 characters.")
        if User.query.filter_by(email=normalized_email).first():
            raise click.ClickException("An account with that email already exists.")
        db.session.add(User(name=name.strip(), email=normalized_email, password_hash=generate_password_hash(password)))
        db.session.commit()
        click.echo(f"Administrator account created for {normalized_email}.")

    @app.cli.command("init-db")
    def init_db_command():
        db.create_all()
        click.echo("Database tables are ready.")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG") == "1")
