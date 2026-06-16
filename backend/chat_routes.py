from fastapi import APIRouter
from pydantic import BaseModel
from database import get_connection
from groq import Groq
import os
from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: int
    message: str

def save_chat(user_id, role, message):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO chat_logs (user_id, role, message)
        VALUES (?, ?, ?)
    """, (user_id, role, message))
    conn.commit()
    conn.close()

def get_user_context(user_id):
    conn = get_connection()
    conn.row_factory = lambda c, r: {col[0]: r[i] for i, col in enumerate(c.description)}
    cursor = conn.cursor()
    user = cursor.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    consumed = cursor.execute("""
        SELECT SUM(calories) as total FROM food_logs
        WHERE user_id=? AND DATE(created_at)=DATE('now')
    """, (user_id,)).fetchone()
    conn.close()
    if not user:
        return ""
    return f"""Thông tin người dùng:
- Tên: {user['name']}, Tuổi: {user['age']}, Giới tính: {user['gender']}
- Cân nặng: {user['weight']} kg, Chiều cao: {user['height']} cm
- Mục tiêu: {user['goal_weight']} kg, Giảm {user['goal_loss']} kg/tuần
- Calo đã ăn hôm nay: {consumed['total'] or 0} kcal"""

@router.post("/chat")
def chat(req: ChatRequest):
    context = get_user_context(req.user_id)

    conn = get_connection()
    cursor = conn.cursor()
    rows = cursor.execute("""
        SELECT role, message FROM chat_logs
        WHERE user_id=? ORDER BY created_at ASC LIMIT 20
    """, (req.user_id,)).fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            "role": "user" if row[0] == "user" else "assistant",
            "content": row[1]
        })

    messages = [
        {
            "role": "system",
            "content": f"""Bạn là AI Coach dinh dưỡng và tập luyện chuyên nghiệp.
Hãy tư vấn dựa trên thông tin người dùng bên dưới.
Trả lời bằng tiếng Việt, ngắn gọn và thân thiện.
{context}"""
        }
    ] + history + [{"role": "user", "content": req.message}]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1000
    )

    reply = response.choices[0].message.content

    save_chat(req.user_id, "user", req.message)
    save_chat(req.user_id, "assistant", reply)

    return {"reply": reply}

@router.get("/chat-history/{user_id}")
def get_chat_history(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT role, message FROM chat_logs
        WHERE user_id=? ORDER BY created_at ASC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]