import os
import json
import psycopg2


def handler(event: dict, context) -> dict:
    """Проверяет OTP-код введённый пользователем"""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    phone = body.get('phone', '').strip()
    code = body.get('code', '').strip()

    if not phone or not code:
        return {
            'statusCode': 400,
            'headers': cors,
            'body': json.dumps({'error': 'Укажите телефон и код'})
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
        SELECT id FROM otp_codes
        WHERE phone = %s
          AND code = %s
          AND used = FALSE
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
        """,
        (digits, code)
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {
            'statusCode': 401,
            'headers': cors,
            'body': json.dumps({'error': 'Неверный или устаревший код'})
        }

    # Помечаем код как использованный
    cur.execute("UPDATE otp_codes SET used = TRUE WHERE id = %s", (row[0],))
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'ok': True, 'message': 'Код подтверждён'})
    }
