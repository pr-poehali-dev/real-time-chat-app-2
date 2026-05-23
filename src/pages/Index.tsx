import { useState, useEffect, useCallback } from "react";
import AuthScreen from "@/components/AuthScreen";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import ProfileScreen from "@/components/ProfileScreen";
import SearchScreen from "@/components/SearchScreen";
import { authUser, getChats, type User, type ChatItem } from "@/api";

type Screen = "chat" | "profile" | "search";

interface ActiveChat {
  chatId: number | null;
  partnerId: number;
  partnerName: string;
  partnerAvatar: string;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [screen, setScreen] = useState<Screen>("chat");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const loadChats = useCallback(async (userId: number) => {
    const data = await getChats(userId);
    setChats(data);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadChats(user.id);
    const interval = setInterval(() => loadChats(user.id), 3000);
    return () => clearInterval(interval);
  }, [user, loadChats]);

  const handleAuth = async (name: string, phone: string) => {
    const u = await authUser(phone, name);
    setUser(u);
  };

  const handleSelectChat = (chatItem: ChatItem) => {
    setActiveChat({
      chatId: chatItem.chat_id,
      partnerId: chatItem.partner_id,
      partnerName: chatItem.partner_name,
      partnerAvatar: chatItem.partner_name.charAt(0).toUpperCase(),
    });
    setScreen("chat");
    setMobileView("chat");
  };

  const handleStartChat = (partnerId: number, partnerName: string) => {
    setActiveChat({
      chatId: null,
      partnerId,
      partnerName,
      partnerAvatar: partnerName.charAt(0).toUpperCase(),
    });
    setScreen("chat");
    setMobileView("chat");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveChat(null);
    setChats([]);
    setScreen("chat");
    setMobileView("list");
  };

  if (!user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    return (Date.now() - new Date(lastSeen).getTime()) < 5 * 60 * 1000;
  };

  const chatListItems = chats.map(c => ({
    id: String(c.chat_id),
    name: c.partner_name,
    lastMessage: c.last_message,
    time: c.last_message_at
      ? new Date(c.last_message_at).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })
      : "",
    unread: c.unread_count,
    online: isOnline(c.last_seen),
    avatar: c.partner_name.charAt(0).toUpperCase(),
  }));

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
          onStartChat={(partnerId, partnerName) => handleStartChat(partnerId, partnerName)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden">
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${mobileView === "chat" ? "hidden md:flex" : "flex"} flex-col`}>
        <ChatList
          chats={chatListItems}
          activeId={activeChat ? String(activeChat.chatId) : null}
          onSelect={(id) => {
            const found = chats.find(c => String(c.chat_id) === id);
            if (found) handleSelectChat(found);
          }}
          onSearch={() => setScreen("search")}
          onProfile={() => setScreen("profile")}
          userName={user.name}
        />
      </div>

      <div className={`flex-1 min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"} flex-col`}>
        <ChatWindow
          chatId={activeChat?.chatId ?? null}
          partnerId={activeChat?.partnerId ?? null}
          partnerName={activeChat?.partnerName ?? ""}
          partnerOnline={false}
          partnerAvatar={activeChat?.partnerAvatar ?? ""}
          userId={user.id}
          onBack={() => setMobileView("list")}
        />
      </div>
    </div>
  );
}
