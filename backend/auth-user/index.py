import os
import json
import psycopg2


def handler(event: dict, context) -> dict:
    """Регистрирует или обновляет пользователя после верификации OTP. Возвращает user_id."""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    phone = body.get('phone', '').strip()
    name = body.get('name', '').strip()

    if not phone or not name:
        return {
            'statusCode': 400,
            'headers': cors,
            'body': json.dumps({'error': 'Укажите телефон и имя'})
        }

    digits = ''.join(c for c in phone if c.isdigit())
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    if not digits.startswith('7'):
        digits = '7' + digits.lstrip('7')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO users (phone, name, last_seen)
        VALUES (%s, %s, NOW())
        ON CONFLICT (phone) DO UPDATE
          SET name = EXCLUDED.name,
              last_seen = NOW()
        RETURNING id, phone, name, last_seen
        """,
        (digits, name)
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({
            'id': row[0],
            'phone': row[1],
            'name': row[2],
            'last_seen': row[3].isoformat(),
        })
    }
