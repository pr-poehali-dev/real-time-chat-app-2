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
    if len(digits) == 11 and digits.startswith('8'):
        digits = '7' + digits[1:]
    elif len(digits) == 10:
        digits = '7' + digits
    # digits должен быть 11 цифр начиная с 7

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

    SMS_ERRORS = {
        200: 'SMS отправлено',
        210: 'SMS в очереди',
        220: 'Недостаточно средств на балансе SMS.ru',
        221: 'Номер в стоп-листе или не добавлен в тестовые номера. Перейди в личный кабинет SMS.ru → Тестовые номера и добавь свой номер.',
        222: 'Неверный номер телефона',
        223: 'Сообщение слишком длинное',
        230: 'Превышен лимит на день',
        231: 'Превышен лимит в минуту',
        232: 'Превышен лимит в секунду',
    }

    if resp.get('status') != 'OK' or sms_status != 'OK':
        raw_code = resp.get('sms', {}).get(digits, {}).get('status_code', '')
        try:
            code_int = int(raw_code)
            friendly = SMS_ERRORS.get(code_int, f'Ошибка SMS.ru: {raw_code}')
        except (ValueError, TypeError):
            friendly = f'Ошибка отправки SMS: {raw_code}'
        return {
            'statusCode': 502,
            'headers': cors,
            'body': json.dumps({'error': friendly})
        }

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'ok': True, 'message': 'SMS отправлено'})
    }