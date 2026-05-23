const AUTH_USER_URL = "https://functions.poehali.dev/db51c709-8817-4a92-ae7c-e0def33946ec";
const CHAT_API_URL = "https://functions.poehali.dev/83b1b49d-6c39-4cba-8c3e-9645d6ee0d5b";
const SEND_MESSAGE_URL = "https://functions.poehali.dev/c2e8fa48-5f07-4d25-b8b8-f9cb31078008";

export interface User {
  id: number;
  phone: string;
  name: string;
  last_seen: string;
}

export interface ChatItem {
  chat_id: number;
  partner_id: number;
  partner_name: string;
  partner_phone: string;
  last_seen: string | null;
  last_message: string;
  last_message_at: string | null;
  unread_count: number;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  text: string;
  created_at: string;
  is_read: boolean;
}

export async function authUser(phone: string, name: string): Promise<User> {
  const res = await fetch(AUTH_USER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка авторизации");
  return data;
}

export async function getChats(userId: number): Promise<ChatItem[]> {
  const res = await fetch(`${CHAT_API_URL}?action=chats&user_id=${userId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка загрузки чатов");
  return data.chats;
}

export async function getMessages(chatId: number, userId: number, afterId = 0): Promise<Message[]> {
  const res = await fetch(`${CHAT_API_URL}?action=messages&chat_id=${chatId}&user_id=${userId}&after_id=${afterId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка загрузки сообщений");
  return data.messages;
}

export async function sendMessage(senderId: number, text: string, chatId?: number, recipientId?: number): Promise<Message> {
  const res = await fetch(SEND_MESSAGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender_id: senderId, text, chat_id: chatId, recipient_id: recipientId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка отправки");
  return data;
}

export function formatTime(isoStr: string | null): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 172800000) return "Вчера";
  return d.toLocaleDateString("ru", { day: "numeric", month: "short" });
}
