import Icon from "@/components/ui/icon";

interface ProfileScreenProps {
  name: string;
  phone: string;
  onBack: () => void;
  onLogout: () => void;
}

const stats = [
  { label: "Контакты", value: "24" },
  { label: "Сообщений", value: "1.2K" },
  { label: "Групп", value: "5" },
];

const securityItems = [
  { icon: "Lock", label: "Двухфакторная аутентификация", desc: "Дополнительная защита аккаунта", active: true },
  { icon: "Shield", label: "Сквозное шифрование", desc: "Все сообщения зашифрованы", active: true },
  { icon: "Eye", label: "Невидимка", desc: "Скрыть статус «в сети»", active: false },
];

const notificationItems = [
  { icon: "Bell", label: "Уведомления о сообщениях", active: true },
  { icon: "Volume2", label: "Звук уведомлений", active: true },
  { icon: "Vibrate", label: "Вибрация", active: false },
  { icon: "MessageSquare", label: "Превью сообщений", active: true },
];

interface ToggleProps {
  active: boolean;
}

function Toggle({ active }: ToggleProps) {
  return (
    <div className={`relative w-11 h-6 rounded-full transition-colors ${active ? "bg-primary" : "bg-secondary"}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
    </div>
  );
}

export default function ProfileScreen({ name, phone, onBack, onLogout }: ProfileScreenProps) {
  const formatPhone = (p: string) => {
    if (p.length !== 11) return p;
    return `+${p[0]} (${p.slice(1, 4)}) ${p.slice(4, 7)}-${p.slice(7, 9)}-${p.slice(9, 11)}`;
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto">
      <div className="flex items-center gap-3 p-4 border-b border-border glass sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <Icon name="ArrowLeft" size={20} />
        </button>
        <h2 className="font-golos text-lg font-bold text-foreground">Профиль</h2>
      </div>

      <div className="p-6 text-center border-b border-border bg-mesh animate-fade-in">
        <div className="inline-flex relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center font-golos text-4xl font-black text-white neon-glow animate-pulse-ring">
            {name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover-scale">
            <Icon name="Camera" size={14} />
          </button>
        </div>
        <h3 className="font-golos text-2xl font-black text-foreground mb-1">{name}</h3>
        <p className="text-muted-foreground text-sm">{formatPhone(phone)}</p>
        <p className="text-green-400 text-xs mt-1 flex items-center justify-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          В сети
        </p>

        <div className="flex items-center justify-center gap-6 mt-4">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-golos font-black text-xl text-gradient">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon name="Shield" size={12} /> Безопасность
          </p>
          <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
            {securityItems.map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Icon name={item.icon} size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Toggle active={item.active} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon name="Bell" size={12} /> Уведомления
          </p>
          <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
            {notificationItems.map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                    <Icon name={item.icon} size={16} className="text-accent" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                </div>
                <Toggle active={item.active} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="glass rounded-2xl overflow-hidden divide-y divide-border">
            {[
              { icon: "HelpCircle", label: "Помощь и поддержка", color: "text-blue-400", bg: "bg-blue-500/15" },
              { icon: "Info", label: "О приложении", color: "text-muted-foreground", bg: "bg-secondary" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <Icon name={item.icon} size={16} className={item.color} />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors font-medium"
        >
          <Icon name="LogOut" size={18} />
          Выйти из аккаунта
        </button>

        <p className="text-center text-xs text-muted-foreground pb-4">Pulse v1.0.0 · 🔐 Сквозное шифрование</p>
      </div>
    </div>
  );
}
