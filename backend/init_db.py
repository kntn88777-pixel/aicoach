from database import get_connection

conn = get_connection()
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    gender TEXT,
    weight REAL,
    height REAL,
    goal_weight REAL,
    goal_loss REAL,
    email TEXT UNIQUE,
    password_hash TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS food_logs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    food_name TEXT,
    grams REAL,
    calories REAL,
    protein REAL,
    carb REAL,
    fat REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS weight_logs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    weight REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS exercise_logs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    exercise_name TEXT,
    calories_burned REAL,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    gender TEXT,
    weight REAL,
    height REAL,
    specialty TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS chat_logs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    role TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()

def add_column_if_missing(table, column, coltype):
    existing_cols = [row[1] for row in cursor.execute(f"PRAGMA table_info({table})").fetchall()]
    if column not in existing_cols:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}")
        print(f"Added column {column} to {table}")

add_column_if_missing("users", "email", "TEXT")
add_column_if_missing("users", "password_hash", "TEXT")
add_column_if_missing("trainers", "email", "TEXT")
add_column_if_missing("trainers", "password_hash", "TEXT")

conn.commit()
conn.close()

print("Database created successfully")