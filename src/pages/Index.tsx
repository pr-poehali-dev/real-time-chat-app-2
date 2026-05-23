import { useState } from "react";
import AuthScreen from "@/components/AuthScreen";
import ChatList, { type Chat } from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import ProfileScreen from "@/components/ProfileScreen";
import SearchScreen from "@/components/SearchScreen";

type Screen = "chat" | "profile" | "search";

const DEMO_CHATS: Chat[] = [
  { id: "1", name: "Алексей Иванов", lastMessage: "Кстати, здесь есть сквозное шифрование 🔐", time: "10:26", unread: 0, online: true, avatar: "А", pinned: true },
  { id: "2", name: "Мария Петрова", lastMessage: "Окей, увидимся завтра!", time: "09:15", unread: 3, online: true, avatar: "М" },
  { id: "3", name: "Рабочий чат", lastMessage: "Дмитрий: Отчёт готов, отправляю", time: "Вчера", unread: 12, online: false, avatar: "Р" },
  { id: "4", name: "Сергей Новиков", lastMessage: "Спасибо, получил!", time: "Вчера", unread: 0, online: false, avatar: "С" },
  { id: "5", name: "Анна Козлова", lastMessage: "Смотри что нашла 😍", time: "Пн", unread: 1, online: true, avatar: "А" },
  { id: "6", name: "Команда Pulse", lastMessage: "Добро пожаловать в Pulse! ⚡", time: "Вс", unread: 0, online: false, avatar: "⚡", pinned: true },
];

export default function Index() {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("chat");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const handleAuth = (name: string, phone: string) => {
    setUser({ name, phone });
  };

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    setScreen("chat");
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("list");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveChat(null);
    setScreen("chat");
    setMobileView("list");
  };

  if (!user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const selectedChat = DEMO_CHATS.find(c => c.id === activeChat) || null;

  if (screen === "profile") {
    return (
      <div className="h-screen w-full">
        <ProfileScreen
          name={user.name}
          phone={user.phone}
          onBack={() => setScreen("chat")}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  if (screen === "search") {
    return (
      <div className="h-screen w-full">
        <SearchScreen
          onBack={() => setScreen("chat")}
          onStartChat={(id) => {
            setActiveChat(id);
            setScreen("chat");
            setMobileView("chat");
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <div className={`
        w-full md:w-80 lg:w-96 flex-shrink-0
        ${mobileView === "chat" ? "hidden md:flex" : "flex"}
        flex-col
      `}>
        <ChatList
          chats={DEMO_CHATS}
          activeId={activeChat}
          onSelect={handleSelectChat}
          onSearch={() => setScreen("search")}
          onProfile={() => setScreen("profile")}
          userName={user.name}
        />
      </div>

      <div className={`
        flex-1 min-w-0
        ${mobileView === "list" ? "hidden md:flex" : "flex"}
        flex-col
      `}>
        <ChatWindow
          chat={selectedChat}
          onBack={handleBack}
          currentUser={user.name}
        />
      </div>
    </div>
  );
}
