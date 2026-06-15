"""
Seed script to create users in Supabase Auth.
Run this AFTER applying the migration (001_initial_schema.sql) in Supabase SQL Editor.

Usage:
    python scripts/seed_users.py

Requires SUPABASE_URL and SUPABASE_SECRET_KEY env vars.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    print("Error: Set SUPABASE_URL and SUPABASE_SECRET_KEY env vars")
    sys.exit(1)

client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

USERS = [
    {"email": "admin@synthfocus.app", "password": "admin123", "display_name": "Admin", "role": "admin"},
    {"email": "user1@synthfocus.app", "password": "user1234", "display_name": "Alice", "role": "user"},
    {"email": "user2@synthfocus.app", "password": "user1234", "display_name": "Bob", "role": "user"},
    {"email": "demo@synthfocus.app", "password": "demo1234", "display_name": "Demo User", "role": "user"},
]


def create_user(email: str, password: str, display_name: str, role: str):
    try:
        result = client.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"display_name": display_name},
        })
        user_id = result.user.id
        print(f"Created user: {email} (id={user_id})")

        # Update role in profiles table if not admin (trigger defaults admin for admin email)
        if role != "admin" or email != "admin@synthfocus.app":
            client.table("profiles").update({"role": role}).eq("id", user_id).execute()

        return user_id
    except Exception as e:
        if "already been registered" in str(e) or "already exists" in str(e):
            print(f"User already exists: {email}")
        else:
            print(f"Error creating {email}: {e}")
        return None


if __name__ == "__main__":
    print("Seeding users...")
    for user_config in USERS:
        create_user(**user_config)
    print("\nDone! Users created:")
    print("  admin@synthfocus.app / admin123 (admin)")
    print("  user1@synthfocus.app / user1234 (user)")
    print("  user2@synthfocus.app / user1234 (user)")
    print("  demo@synthfocus.app  / demo1234 (user)")
