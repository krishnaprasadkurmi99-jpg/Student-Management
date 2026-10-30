"""Compatibility entry point for running the Flask backend from the project root."""

from backend.app import Student, app, create_app, db

__all__ = ["Student", "app", "create_app", "db"]


if __name__ == "__main__":
    app.run(debug=app.config.get("DEBUG", False))
