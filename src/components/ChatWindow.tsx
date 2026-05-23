import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { Chat } from "./ChatList";

interface Message {
  id: string;
  text: string;
  time: string;
  out: boolean;
  status: "sent" | "delivered" | "read";
}

interface ChatWindowProps {
  chat: Chat | null;
  onBack: () => void;
  currentUser: string;
}

const DEMO_MESSAGES: Message[] = [
  { id: "1", text: "Привет! Как дела?", time: "10:21", out: false, status: "read" },
  { id: "2", text: "Отлично, спасибо! Ты как?", time: "10:22", out: true, status: "read" },
  { id: "3", text: "Тоже всё хорошо! Слушай, ты видел новый мессенджер Pulse?", time: "10:23", out: false, status: "read" },
  { id: "4", text: "Да, только что зарегистрировался! Дизайн огонь 🔥", time: "10:24", out: true, status: "read" },
  { id: "5", text: "Согласен, особенно эти неоновые цвета. Очень современно!", time: "10:25", out: false, status: "read" },
  { id: "6", text: "Кстати, здесь есть сквозное шифрование — все сообщения под защитой 🔐", time: "10:26", out: true, status: "delivered" },
];

const AVATAR_COLORS = [
  "from-purple-500 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-green-400 to-teal-500",
];

export default function ChatWindow({ chat, onBack, currentUser }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chat) {
      setMessages(DEMO_MESSAGES);
      setIsTyping(false);
    }
  }, [chat?.id]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      out: true,
      status: "sent",
    };
    setMessages(prev => [...prev, msg]);
    setInput("");

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutoReply(msg.text),
        time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
        out: false,
        status: "read",
      };
      setMessages(prev => [...prev, reply]);
    }, 1500 + Math.random() * 1000);
  };

  const getAutoReply = (text: string) => {
    const replies = [
      "Понял, спасибо за сообщение! 👍",
      "Интересно, расскажи подробнее",
      "Хорошо, договорились!",
      "Окей, буду иметь в виду 😊",
      "Отличная идея!",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!chat) {
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
        <button
          onClick={onBack}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <Icon name="ArrowLeft" size={20} />
        </button>

        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[0]} flex items-center justify-center font-golos font-bold text-white ${chat.online ? "online-dot" : ""}`}>
            {chat.avatar}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{chat.name}</h3>
          <p className={`text-xs ${chat.online ? "text-green-400" : "text-muted-foreground"}`}>
            {isTyping ? (
              <span className="flex items-center gap-1">
                <span>печатает</span>
                <span className="flex gap-0.5">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-green-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              </span>
            ) : chat.online ? "в сети" : "был(а) недавно"}
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

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.out ? "justify-end" : "justify-start"} animate-message-in`}
            style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
          >
            <div className={`max-w-[75%] px-4 py-2.5 ${msg.out ? "msg-bubble-out text-white" : "msg-bubble-in text-foreground"}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.out ? "justify-end" : "justify-start"}`}>
                <span className={`text-[10px] ${msg.out ? "text-white/60" : "text-muted-foreground"}`}>{msg.time}</span>
                {msg.out && (
                  <Icon
                    name={msg.status === "read" ? "CheckCheck" : "Check"}
                    size={12}
                    className={msg.status === "read" ? "text-cyan-300" : "text-white/60"}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-border glass">
        <div className="flex items-end gap-2">
          <button className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground mb-0.5">
            <Icon name="Paperclip" size={20} />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Написать сообщение..."
              rows={1}
              className="w-full bg-secondary border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none max-h-32 scrollbar-thin"
              style={{ minHeight: "46px" }}
            />
          </div>

          <button className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground mb-0.5">
            <Icon name="Smile" size={20} />
          </button>

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl gradient-btn text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-0.5"
          >
            <Icon name="Send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
