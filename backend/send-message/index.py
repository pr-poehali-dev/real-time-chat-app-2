import os
import json
import psycopg2


def handler(event: dict, context) -> dict:
    """Отправляет сообщение в чат. Создаёт чат если его нет."""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    sender_id = body.get('sender_id')
    recipient_id = body.get('recipient_id')
    chat_id = body.get('chat_id')
    text = (body.get('text') or '').strip()

    if not sender_id or not text or (not recipient_id and not chat_id):
        return {
            'statusCode': 400,
            'headers': cors,
            'body': json.dumps({'error': 'Укажите sender_id, text и recipient_id или chat_id'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if not chat_id:
        # Ищем существующий приватный чат между двумя пользователями
        cur.execute(
            """
            SELECT c.id FROM chats c
            JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
            JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
            LIMIT 1
            """,
            (int(sender_id), int(recipient_id))
        )
        row = cur.fetchone()
        if row:
            chat_id = row[0]
        else:
            # Создаём новый чат
            cur.execute("INSERT INTO chats DEFAULT VALUES RETURNING id")
            chat_id = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s), (%s, %s)",
                (chat_id, int(sender_id), chat_id, int(recipient_id))
            )

    cur.execute(
        """
        INSERT INTO messages (chat_id, sender_id, text)
        VALUES (%s, %s, %s)
        RETURNING id, created_at
        """,
        (int(chat_id), int(sender_id), text)
    )
    msg_row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({
            'id': msg_row[0],
            'chat_id': chat_id,
            'sender_id': sender_id,
            'text': text,
            'created_at': msg_row[1].isoformat(),
        })
    }
