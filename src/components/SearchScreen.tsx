import { useState } from "react";
import Icon from "@/components/ui/icon";

interface SearchScreenProps {
  onBack: () => void;
  onStartChat: (partnerId: number, partnerName: string) => void;
}

interface FoundUser {
  id: number;
  name: string;
  phone: string;
}

const CHAT_API_URL = "https://functions.poehali.dev/83b1b49d-6c39-4cba-8c3e-9645d6ee0d5b";

export default function SearchScreen({ onBack, onStartChat }: SearchScreenProps) {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<FoundUser | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const digits = phone.replace(/\D/g, "");
      const res = await fetch(`${CHAT_API_URL}?action=find_user&phone=${digits}`);
      const data = await res.json();
      if (data.user) {
        setResult(data.user);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 p-4 border-b border-border glass">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <Icon name="ArrowLeft" size={20} />
        </button>
        <h2 className="font-golos text-lg font-bold text-foreground">Найти собеседника</h2>
      </div>

      <div className="p-4 border-b border-border">
        <p className="text-sm text-muted-foreground mb-3">Введи номер телефона зарегистрированного пользователя</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Icon name="Phone" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setResult(null); setNotFound(false); }}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="+7 (999) 000-00-00"
              className="w-full bg-secondary rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!phone.trim() || loading}
            className="gradient-btn text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Icon name="Search" size={16} />
            }
            Найти
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {result && (
          <div className="flex items-center gap-3 glass rounded-2xl p-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center font-golos text-xl font-black text-white flex-shrink-0">
              {result.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{result.name}</p>
              <p className="text-sm text-muted-foreground">{result.phone}</p>
            </div>
            <button
              onClick={() => onStartChat(result.id, result.name)}
              className="gradient-btn text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              Написать
            </button>
          </div>
        )}

        {notFound && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-muted-foreground text-sm">Пользователь не найден</p>
            <p className="text-muted-foreground text-xs mt-1">Попробуй другой номер</p>
          </div>
        )}

        {!result && !notFound && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-3">📱</span>
            <p className="text-muted-foreground text-sm">Введи номер для поиска</p>
            <p className="text-muted-foreground text-xs mt-1">Пользователь должен быть зарегистрирован в CasstecsZ</p>
          </div>
        )}
      </div>
    </div>
  );
}