import os
import random
import json
import urllib.request
import urllib.parse
import psycopg2


def handler(event: dict, context) -> dict:
    """Генерирует OTP-код и отправляет SMS через SMS.ru"""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    phone = body.get('phone', '').strip()

    if not phone or len(phone) < 10:
        return {
            'statusCode': 400,
            'headers': cors,
            'body': json.dumps({'error': 'Неверный номер телефона'})
        }

    # Нормализуем номер: только цифры
    digits = ''.join(c for c in phone if c.isdigit())
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    if not digits.startswith('7'):
        digits = '7' + digits.lstrip('7')

    code = str(random.randint(100000, 999999))

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    # Удаляем старые коды для этого номера
    cur.execute(
        "DELETE FROM otp_codes WHERE phone = %s",
        (digits,)
    )

    # Сохраняем новый код
    cur.execute(
        "INSERT INTO otp_codes (phone, code) VALUES (%s, %s)",
        (digits, code)
    )
    conn.commit()
    cur.close()
    conn.close()

    # Отправляем SMS через SMS.ru
    api_key = os.environ['SMSRU_API_KEY']
    params = urllib.parse.urlencode({
        'api_id': api_key,
        'to': digits,
        'msg': f'Ваш код для входа в Pulse: {code}. Не сообщайте никому.',
        'json': 1,
    })

    url = f'https://sms.ru/sms/send?{params}'
    req = urllib.request.urlopen(url, timeout=10)
    resp = json.loads(req.read().decode())

    sms_status = resp.get('sms', {}).get(digits, {}).get('status', '')

    if resp.get('status') != 'OK' or sms_status != 'OK':
        error_code = resp.get('sms', {}).get(digits, {}).get('status_code', '')
        return {
            'statusCode': 502,
            'headers': cors,
            'body': json.dumps({'error': f'Ошибка отправки SMS: {error_code}'})
        }

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'ok': True, 'message': 'SMS отправлено'})
    }
