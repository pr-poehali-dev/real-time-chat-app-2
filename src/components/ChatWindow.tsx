import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { getMessages, sendMessage, type Message } from "@/api";

interface ChatWindowProps {
  chatId: number | null;
  partnerId: number | null;
  partnerName: string;
  partnerOnline: boolean;
  partnerAvatar: string;
  userId: number;
  onBack: () => void;
}

const AVATAR_COLORS = [
  "from-purple-500 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-green-400 to-teal-500",
];

export default function ChatWindow({ chatId, partnerId, partnerName, partnerOnline, partnerAvatar, userId, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = useCallback(async (afterId = 0) => {
    if (!chatId || !userId) return;
    const msgs = await getMessages(chatId, userId, afterId);
    if (msgs.length > 0) {
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = msgs.filter(m => !existingIds.has(m.id));
        if (newMsgs.length === 0) return prev;
        lastIdRef.current = msgs[msgs.length - 1].id;
        return [...prev, ...newMsgs];
      });
    }
  }, [chatId, userId]);

  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    lastIdRef.current = 0;

    loadMessages(0);

    pollingRef.current = setInterval(() => {
      loadMessages(lastIdRef.current);
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [chatId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !userId) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const msg = await sendMessage(userId, text, chatId ?? undefined, partnerId ?? undefined);
      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;
        lastIdRef.current = msg.id;
        return [...prev, { ...msg, sender_name: "" }];
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMsgTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  };

  if (!chatId && !partnerId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background bg-mesh">
        <div className="text-center animate-fade-in">
          <div className="text-7xl mb-4">💬</div>
          <h2 className="font-golos text-2xl font-bold text-foreground mb-2">Выбери чат</h2>
          <p className="text-muted-foreground">Открой диалог из списка слева</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 p-4 border-b border-border glass">
        <button onClick={onBack} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className={`relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[0]} flex items-center justify-center font-golos font-bold text-white ${partnerOnline ? "online-dot" : ""}`}>
          {partnerAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{partnerName}</h3>
          <p className={`text-xs ${partnerOnline ? "text-green-400" : "text-muted-foreground"}`}>
            {partnerOnline ? "в сети" : "был(а) недавно"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Icon name="Phone" size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Icon name="Video" size={18} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <Icon name="MoreVertical" size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-mesh">
        <div className="flex justify-center mb-4">
          <span className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
            <Icon name="Lock" size={10} /> Сквозное шифрование включено
          </span>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-2">👋</span>
            <p className="text-muted-foreground text-sm">Напиши первое сообщение!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOut = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOut ? "justify-end" : "justify-start"} animate-message-in`}
              style={{ animationDelay: `${Math.min(i * 0.03, 0.2)}s` }}
            >
              <div className={`max-w-[75%] px-4 py-2.5 ${isOut ? "msg-bubble-out text-white" : "msg-bubble-in text-foreground"}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${isOut ? "justify-end" : "justify-start"}`}>
                  <span className={`text-[10px] ${isOut ? "text-white/60" : "text-muted-foreground"}`}>
                    {formatMsgTime(msg.created_at)}
                  </span>
                  {isOut && (
                    <Icon
                      name={msg.is_read ? "CheckCheck" : "Check"}
                      size={12}
                      className={msg.is_read ? "text-cyan-300" : "text-white/60"}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-border glass">
        <div className="flex items-end gap-2">
          <button className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground mb-0.5">
            <Icon name="Paperclip" size={20} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Написать сообщение..."
              rows={1}
              className="w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none max-h-32"
              style={{ minHeight: "46px" }}
            />
          </div>
          <button className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground mb-0.5">
            <Icon name="Smile" size={20} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl gradient-btn text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-0.5"
          >
            {sending
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Icon name="Send" size={18} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
