from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from database import get_connection
from food_data import food_db
from chat_routes import router as chat_router
from auth import hash_password, verify_password, create_token, get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://aicoachhealth.onrender.com"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    name: str
    age: int
    gender: str
    weight: float
    height: float
    goal_weight: float
    goal_loss: float
    email: EmailStr
    password: str

class TrainerCreate(BaseModel):
    name: str
    age: int
    gender: str
    weight: float
    height: float
    specialty: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class FoodRequest(BaseModel):
    user_id: int
    food: str
    grams: float

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@app.post("/users")
def create_user(user: UserCreate):
    conn = get_connection()
    cursor = conn.cursor()
    existing = cursor.execute("SELECT id FROM users WHERE email=?", (user.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    password_hash = hash_password(user.password)
    cursor.execute("""
        INSERT INTO users (name, age, gender, weight, height, goal_weight, goal_loss, email, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user.name, user.age, user.gender, user.weight, user.height, user.goal_weight, user.goal_loss, user.email, password_hash))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    token = create_token(user_id, "user")
    return {"message": "created", "user_id": user_id, "token": token, "role": "user"}

@app.post("/trainers")
def create_trainer(trainer: TrainerCreate):
    conn = get_connection()
    cursor = conn.cursor()
    existing = cursor.execute("SELECT id FROM trainers WHERE email=?", (trainer.email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    password_hash = hash_password(trainer.password)
    cursor.execute("""
        INSERT INTO trainers (name, age, gender, weight, height, specialty, email, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (trainer.name, trainer.age, trainer.gender, trainer.weight, trainer.height, trainer.specialty, trainer.email, password_hash))
    conn.commit()
    trainer_id = cursor.lastrowid
    conn.close()
    token = create_token(trainer_id, "trainer")
    return {"message": "created", "trainer_id": trainer_id, "token": token, "role": "trainer"}

@app.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()

    user = cursor.execute("SELECT * FROM users WHERE email=?", (data.email,)).fetchone()
    if user and verify_password(data.password, user["password_hash"]):
        conn.close()
        token = create_token(user["id"], "user")
        return {"token": token, "role": "user", "user_id": user["id"], "name": user["name"]}

    trainer = cursor.execute("SELECT * FROM trainers WHERE email=?", (data.email,)).fetchone()
    if trainer and verify_password(data.password, trainer["password_hash"]):
        conn.close()
        token = create_token(trainer["id"], "trainer")
        return {"token": token, "role": "trainer", "user_id": trainer["id"], "name": trainer["name"]}

    conn.close()
    raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

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

app.include_router(chat_router)