import { useState } from "react";
import Icon from "@/components/ui/icon";

interface AuthScreenProps {
  onAuth: (name: string, phone: string) => void;
}

type Step = "phone" | "otp" | "name";

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [demoCode, setDemoCode] = useState("");

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 1) return digits ? "+" + digits : "";
    if (digits.length <= 4) return `+${digits[0]} (${digits.slice(1)}`;
    if (digits.length <= 7) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setPhone(raw.slice(0, 11));
  };

  const handleOtpInput = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  };

  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendCode = () => {
    if (phone.length >= 11) {
      setDemoCode(generateCode());
      setStep("otp");
    }
  };

  const handleVerify = () => {
    if (otp.join("") === demoCode) setStep("name");
  };

  const handleFinish = () => {
    if (name.trim().length >= 2) onAuth(name.trim(), phone);
  };

  return (
    <div className="min-h-screen w-full bg-background bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-cyan-400/10 blur-[60px] pointer-events-none" />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-strong mb-4 animate-pulse-ring">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="font-golos text-4xl font-black text-gradient mb-2">Pulse</h1>
          <p className="text-muted-foreground text-sm">Мессенджер нового поколения</p>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          {step === "phone" && (
            <div className="animate-fade-in">
              <h2 className="font-golos text-xl font-bold text-foreground mb-1">Войти или создать аккаунт</h2>
              <p className="text-muted-foreground text-sm mb-6">Введи свой номер телефона</p>
              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon name="Phone" size={18} />
                </div>
                <input
                  type="tel"
                  value={formatPhone(phone)}
                  onChange={handlePhoneInput}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full bg-secondary border border-border rounded-xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={phone.length < 11}
                className="w-full gradient-btn text-white font-semibold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Получить код
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="animate-fade-in">
              <button onClick={() => setStep("phone")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm">
                <Icon name="ArrowLeft" size={16} /> Назад
              </button>
              <h2 className="font-golos text-xl font-bold text-foreground mb-1">Код подтверждения</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Отправили SMS на <span className="text-foreground font-medium">{formatPhone(phone)}</span>
              </p>
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-6">
                <Icon name="MessageSquare" size={18} className="text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Тестовый код (SMS не подключены)</p>
                  <p className="font-golos font-black text-2xl text-gradient tracking-widest">{demoCode}</p>
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpInput(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className="flex-1 aspect-square text-center text-xl font-bold bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                ))}
              </div>
              <button
                onClick={handleVerify}
                disabled={otp.join("").length < 6}
                className="w-full gradient-btn text-white font-semibold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Подтвердить
              </button>
              <p className="text-center text-muted-foreground text-xs mt-4">
                Не получили код?{" "}
                <button className="text-primary hover:underline">Отправить снова</button>
              </p>
            </div>
          )}

          {step === "name" && (
            <div className="animate-fade-in">
              <h2 className="font-golos text-xl font-bold text-foreground mb-1">Как тебя зовут?</h2>
              <p className="text-muted-foreground text-sm mb-6">Заполни свой профиль</p>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center cursor-pointer hover-scale">
                  <Icon name="Camera" size={24} className="text-white" />
                  <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Icon name="Upload" size={20} className="text-white" />
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Имя и фамилия"
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all mb-4"
              />
              <button
                onClick={handleFinish}
                disabled={name.trim().length < 2}
                className="w-full gradient-btn text-white font-semibold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Начать общение ✨
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Используя Pulse, ты соглашаешься с{" "}
          <span className="text-primary cursor-pointer hover:underline">условиями</span>
        </p>
      </div>
    </div>
  );
}