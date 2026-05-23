import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  online: boolean;
  mutual: number;
}

const CONTACTS: Contact[] = [
  { id: "c1", name: "Алексей Иванов", phone: "+7 (916) 123-45-67", avatar: "А", online: true, mutual: 5 },
  { id: "c2", name: "Мария Петрова", phone: "+7 (926) 234-56-78", avatar: "М", online: false, mutual: 3 },
  { id: "c3", name: "Дмитрий Сидоров", phone: "+7 (906) 345-67-89", avatar: "Д", online: true, mutual: 8 },
  { id: "c4", name: "Анна Козлова", phone: "+7 (977) 456-78-90", avatar: "А", online: false, mutual: 2 },
  { id: "c5", name: "Сергей Новиков", phone: "+7 (962) 567-89-01", avatar: "С", online: true, mutual: 11 },
];

const AVATAR_COLORS = [
  "from-purple-500 to-pink-500",
  "from-cyan-400 to-blue-500",
  "from-green-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-violet-500 to-indigo-500",
];

interface SearchScreenProps {
  onBack: () => void;
  onStartChat: (contactId: string) => void;
}

export default function SearchScreen({ onBack, onStartChat }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query)
  );

  const handleAdd = (id: string) => {
    setAdded(prev => new Set([...prev, id]));
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
        <div className="flex-1 relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Найти по имени или номеру..."
            autoFocus
            className="w-full bg-secondary rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Icon name="Phone" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              placeholder="Добавить по номеру телефона"
              className="w-full bg-secondary rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <button className="gradient-btn text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex-shrink-0">
            Найти
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {query && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs text-muted-foreground">Найдено: {filtered.length}</p>
          </div>
        )}

        {!query && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Рекомендуемые контакты</p>
          </div>
        )}

        {filtered.map((contact, i) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center font-golos font-bold text-white ${contact.online ? "online-dot" : ""}`}>
                {contact.avatar}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{contact.name}</p>
              <p className="text-xs text-muted-foreground">{contact.phone}</p>
              {contact.mutual > 0 && (
                <p className="text-xs text-primary mt-0.5">{contact.mutual} общих контактов</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {added.has(contact.id) ? (
                <button
                  onClick={() => onStartChat(contact.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                >
                  Написать
                </button>
              ) : (
                <button
                  onClick={() => handleAdd(contact.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg gradient-btn text-white"
                >
                  Добавить
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-muted-foreground text-sm">Ничего не найдено</p>
            <p className="text-muted-foreground text-xs mt-1">Попробуй добавить по номеру телефона</p>
          </div>
        )}
      </div>
    </div>
  );
}
