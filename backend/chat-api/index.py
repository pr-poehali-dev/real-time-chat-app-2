import os
import json
import psycopg2


def handler(event: dict, context) -> dict:
    """
    Универсальный API для чатов.
    GET /?action=chats&user_id=X — список чатов
    GET /?action=messages&chat_id=X&user_id=Y&after_id=Z — сообщения чата
    """

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if action == 'chats':
        user_id = params.get('user_id')
        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Укажите user_id'})}

        cur.execute(
            """
            SELECT
                c.id,
                u.id,
                u.name,
                u.phone,
                u.last_seen,
                m.text,
                m.created_at,
                (SELECT COUNT(*) FROM messages
                 WHERE chat_id = c.id AND sender_id != %s AND is_read = FALSE) AS unread
            FROM chats c
            JOIN chat_members cm ON cm.chat_id = c.id AND cm.user_id = %s
            JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id != %s
            JOIN users u ON u.id = cm2.user_id
            LEFT JOIN LATERAL (
                SELECT text, created_at FROM messages
                WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
            ) m ON TRUE
            ORDER BY COALESCE(m.created_at, c.created_at) DESC
            """,
            (int(user_id), int(user_id), int(user_id))
        )

        rows = cur.fetchall()
        cur.close()
        conn.close()

        chats = []
        for row in rows:
            chats.append({
                'chat_id': row[0],
                'partner_id': row[1],
                'partner_name': row[2],
                'partner_phone': row[3],
                'last_seen': row[4].isoformat() if row[4] else None,
                'last_message': row[5] or '',
                'last_message_at': row[6].isoformat() if row[6] else None,
                'unread_count': row[7],
            })

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'chats': chats})}

    elif action == 'messages':
        chat_id = params.get('chat_id')
        user_id = params.get('user_id')
        after_id = params.get('after_id', '0')

        if not chat_id or not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Укажите chat_id и user_id'})}

        cur.execute(
            "UPDATE messages SET is_read = TRUE WHERE chat_id = %s AND sender_id != %s AND is_read = FALSE",
            (int(chat_id), int(user_id))
        )

        cur.execute(
            """
            SELECT m.id, m.sender_id, u.name, m.text, m.created_at, m.is_read
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.chat_id = %s AND m.id > %s
            ORDER BY m.created_at ASC
            LIMIT 100
            """,
            (int(chat_id), int(after_id))
        )

        rows = cur.fetchall()
        conn.commit()
        cur.close()
        conn.close()

        messages = []
        for row in rows:
            messages.append({
                'id': row[0],
                'sender_id': row[1],
                'sender_name': row[2],
                'text': row[3],
                'created_at': row[4].isoformat(),
                'is_read': row[5],
            })

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'messages': messages})}

    elif action == 'find_user':
        phone = params.get('phone', '').strip()
        if not phone:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Укажите phone'})}

        digits = ''.join(c for c in phone if c.isdigit())
        if digits.startswith('8'):
            digits = '7' + digits[1:]
        if not digits.startswith('7'):
            digits = '7' + digits.lstrip('7')

        cur.execute("SELECT id, name, phone FROM users WHERE phone = %s", (digits,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'user': None})}

        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({
            'user': {'id': row[0], 'name': row[1], 'phone': row[2]}
        })}

    else:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Неизвестный action'})}