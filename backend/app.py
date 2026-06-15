from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection
from food_data import food_db
from chat_routes import router as chat_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# MODELS
# =========================
class UserCreate(BaseModel):
    name: str
    age: int
    gender: str
    weight: float
    height: float
    goal_weight: float
    goal_loss: float

class FoodRequest(BaseModel):
    user_id: int
    food: str
    grams: float

class TrainerCreate(BaseModel):
    name: str
    age: int
    gender: str
    weight: float
    height: float
    specialty: str

# =========================
# FIX SQLITE ROW -> DICT
# =========================
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

# =========================
# CREATE USER
# =========================
@app.post("/users")
def create_user(user: UserCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (name, age, gender, weight, height, goal_weight, goal_loss)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user.name, user.age, user.gender, user.weight, user.height, user.goal_weight, user.goal_loss))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return {"message": "created", "user_id": user_id}

# =========================
# TRAINER
# =========================
@app.post("/trainers")
def create_trainer(trainer: TrainerCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO trainers (name, age, gender, weight, height, specialty)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (trainer.name, trainer.age, trainer.gender, trainer.weight, trainer.height, trainer.specialty))
    conn.commit()
    trainer_id = cursor.lastrowid
    conn.close()
    return {"message": "created", "trainer_id": trainer_id}

# =========================
# FOOD LOG
# =========================
@app.post("/food-log")
def add_food(data: FoodRequest):
    food_name = data.food.lower()
    if food_name not in food_db:
        return {"error": "food not found"}
    item = food_db[food_name]
    calories = item["calories"] * data.grams / 100
    protein = item["protein"] * data.grams / 100
    carb = item["carb"] * data.grams / 100
    fat = item["fat"] * data.grams / 100
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO food_logs (user_id, food_name, grams, calories, protein, carb, fat)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (data.user_id, food_name, data.grams, calories, protein, carb, fat))
    conn.commit()
    conn.close()
    return {"food": food_name, "calories": round(calories, 2), "protein": round(protein, 2)}

# =========================
# DASHBOARD
# =========================
@app.get("/dashboard/{user_id}")
def dashboard(user_id: int):
    conn = get_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    user = cursor.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if not user:
        return {"error": "user not found"}
    consumed_row = cursor.execute("""
        SELECT SUM(calories) as total FROM food_logs
        WHERE user_id=? AND DATE(created_at)=DATE('now')
    """, (user_id,)).fetchone()
    consumed = consumed_row["total"] if consumed_row["total"] else 0
    if user["gender"].lower() == "male":
        bmr = 10 * user["weight"] + 6.25 * user["height"] - 5 * user["age"] + 5
    else:
        bmr = 10 * user["weight"] + 6.25 * user["height"] - 5 * user["age"] - 161
    tdee = bmr * 1.375
    deficit = (user["goal_loss"] * 7700) / 7
    recommended = tdee - deficit
    conn.close()
    return {
        "weight": user["weight"],
        "goal_weight": user["goal_weight"],
        "tdee": round(tdee),
        "recommended": round(recommended),
        "consumed": round(consumed),
        "remaining": round(recommended - consumed)
    }

# =========================
# CHAT ROUTER
# =========================
app.include_router(chat_router)