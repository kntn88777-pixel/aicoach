from fastapi import APIRouter
from pydantic import BaseModel
from database import get_connection
from groq import Groq
import os
import json
import re
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

SYSTEM_PROMPT = """Bạn là AI Coach dinh dưỡng và tập luyện chuyên nghiệp.
Hãy tư vấn dựa trên thông tin người dùng bên dưới.
Trả lời bằng tiếng Việt, ngắn gọn và thân thiện.

QUAN TRỌNG: Bạn LUÔN PHẢI trả lời bằng một JSON object hợp lệ, không kèm văn bản nào khác ngoài JSON. JSON phải theo đúng 1 trong 2 dạng sau:

Dạng 1 - Khi người dùng hỏi về lộ trình/kế hoạch tập luyện hoặc giảm cân theo thời gian (theo tuần/tháng):
{{
  "type": "plan",
  "intro": "câu giới thiệu ngắn",
  "milestones": [
    {{"period": "Tuần 1-4", "weight_target": "105kg → 97kg", "calories": "1500-1700 kcal", "activity": "Cardio 30-40 phút, 3-4 lần/tuần"}}
  ],
  "notes": ["lưu ý 1", "lưu ý 2"]
}}

Dạng 2 - Cho mọi câu trả lời thông thường khác (chào hỏi, giải thích, trả lời câu hỏi không phải lộ trình):
{{
  "type": "text",
  "content": "nội dung trả lời, có thể dùng \\n để xuống dòng"
}}

Không thêm markdown ```json, không thêm giải thích ngoài JSON. Chỉ trả đúng JSON object.

{context}"""

def extract_json(raw):
    raw = raw.strip()
    raw = re.sub(r"^```json\s*|^```\s*|```$", "", raw, flags=re.MULTILINE).strip()
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except (json.JSONDecodeError, ValueError):
                pass
    return {"type": "text", "content": raw}

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
            "content": SYSTEM_PROMPT.format(context=context)
        }
    ] + history + [{"role": "user", "content": req.message}]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1500,
        response_format={"type": "json_object"}
    )

    raw_reply = response.choices[0].message.content
    parsed = extract_json(raw_reply)

    save_chat(req.user_id, "user", req.message)
    save_chat(req.user_id, "assistant", json.dumps(parsed, ensure_ascii=False))

    return {"reply": parsed}

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

    result = []
    for row in rows:
        d = dict(row)
        if d["role"] == "assistant":
            try:
                d["message"] = json.loads(d["message"])
            except (json.JSONDecodeError, TypeError):
                d["message"] = {"type": "text", "content": d["message"]}
        result.append(d)
    return result