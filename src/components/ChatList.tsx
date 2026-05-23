import Icon from "@/components/ui/icon";

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar: string;
  pinned?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onSearch: () => void;
  onProfile: () => void;
  userName: string;
}

const AVATAR_COLORS = [
  "from-purple-500 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-green-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-violet-500 to-indigo-500",
  "from-amber-400 to-orange-500",
];

export default function ChatList({ chats, activeId, onSelect, onSearch, onProfile, userName }: ChatListProps) {
  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onProfile}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center font-golos font-bold text-white text-sm neon-glow">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-foreground">{userName}</p>
              <p className="text-xs text-green-400">онлайн</p>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={onSearch}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Icon name="Search" size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <Icon name="Plus" size={18} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск чатов..."
            className="w-full bg-secondary rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.filter(c => c.pinned).length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Icon name="Pin" size={12} /> Закреплённые
            </p>
          </div>
        )}

        {chats.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-secondary/60 text-left ${
              activeId === chat.id ? "bg-primary/10 border-l-2 border-primary" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center font-golos font-bold text-white ${chat.online ? "online-dot" : ""}`}>
                {chat.avatar}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-sm text-foreground truncate">{chat.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
                    {chat.unread > 99 ? "99+" : chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}

        {chats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <span className="text-5xl mb-3">💬</span>
            <p className="text-muted-foreground text-sm">Пока нет чатов</p>
            <p className="text-muted-foreground text-xs mt-1">Найди контакт и начни общение</p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-2">
        <div className="flex items-center justify-around">
          {[
            { icon: "MessageCircle", label: "Чаты", active: true },
            { icon: "Users", label: "Группы", active: false },
            { icon: "Phone", label: "Звонки", active: false },
            { icon: "Settings", label: "Настройки", active: false },
          ].map(item => (
            <button
              key={item.icon}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={item.icon} size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}