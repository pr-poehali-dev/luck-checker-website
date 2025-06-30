import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

interface LeaderboardEntry {
  id: string;
  number: number;
  nickname: string;
  timestamp: Date;
  rank: number;
}

interface User {
  id: string;
  nickname: string;
  provider: "vk" | "google" | "yandex";
  providerId: string;
}

const Index = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<"day" | "month" | "all">("all");
  const [user, setUser] = useState<User | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(true);
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [pendingUser, setPendingUser] = useState<Omit<User, "nickname"> | null>(
    null,
  );

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 1000000000) + 1;
  };

  const handleAuthProvider = (provider: "vk" | "google" | "yandex") => {
    // Симуляция авторизации
    const mockProviderId = `${provider}_${Date.now()}`;
    setPendingUser({
      id: Date.now().toString(),
      provider,
      providerId: mockProviderId,
    });
    setShowAuthDialog(false);
    setShowNicknameDialog(true);
  };

  const handleNicknameSubmit = () => {
    if (!nicknameInput.trim() || !pendingUser) return;

    const newUser: User = {
      ...pendingUser,
      nickname: nicknameInput.trim(),
    };

    setUser(newUser);
    setShowNicknameDialog(false);
    setNicknameInput("");
    setPendingUser(null);
  };

  const getProviderIcon = (provider: "vk" | "google" | "yandex") => {
    switch (provider) {
      case "vk":
        return "🔵";
      case "google":
        return "🔴";
      case "yandex":
        return "🟡";
    }
  };

  const getProviderName = (provider: "vk" | "google" | "yandex") => {
    switch (provider) {
      case "vk":
        return "ВКонтакте";
      case "google":
        return "Google";
      case "yandex":
        return "Яндекс";
    }
  };

  const handleLuckyCheck = async () => {
    if (isSpinning || !user) return;

    setIsSpinning(true);

    // Анимация вращения чисел
    const spinDuration = 3000; // 3 секунды
    const spinInterval = 50; // Обновление каждые 50мс
    const totalSpins = spinDuration / spinInterval;

    let spinCount = 0;
    const spinTimer = setInterval(() => {
      setCurrentNumber(generateRandomNumber());
      spinCount++;

      if (spinCount >= totalSpins) {
        clearInterval(spinTimer);
        const finalNumber = generateRandomNumber();
        setCurrentNumber(finalNumber);
        setIsSpinning(false);

        // Добавляем результат в таблицу лидеров
        const newEntry: LeaderboardEntry = {
          id: Date.now().toString(),
          number: finalNumber,
          nickname: user.nickname,
          timestamp: new Date(),
          rank: 0,
        };

        setLeaderboard((prev) => {
          const updated = [...prev, newEntry].sort(
            (a, b) => b.number - a.number,
          );
          return updated.map((entry, index) => ({ ...entry, rank: index + 1 }));
        });
      }
    }, spinInterval);
  };

  const filteredLeaderboard = leaderboard.filter((entry) => {
    const now = new Date();
    const entryDate = new Date(entry.timestamp);

    switch (timeFilter) {
      case "day":
        return now.getTime() - entryDate.getTime() <= 24 * 60 * 60 * 1000;
      case "month":
        return now.getTime() - entryDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString("ru-RU");
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
          <Card className="bg-slate-800/90 border-yellow-500/30 backdrop-blur-sm max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-yellow-400 font-['Montserrat'] mb-2">
                🎰 Игра Удачи
              </CardTitle>
              <p className="text-gray-300">Для начала игры необходимо войти</p>
            </CardHeader>
          </Card>
        </div>

        {/* Диалог авторизации */}
        <Dialog open={showAuthDialog} onOpenChange={() => {}}>
          <DialogContent className="bg-slate-800 border-yellow-500/30">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-center text-xl">
                Выберите способ входа
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Button
                onClick={() => handleAuthProvider("vk")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {getProviderIcon("vk")} Войти через ВКонтакте
              </Button>
              <Button
                onClick={() => handleAuthProvider("google")}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                {getProviderIcon("google")} Войти через Google
              </Button>
              <Button
                onClick={() => handleAuthProvider("yandex")}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black"
                size="lg"
              >
                {getProviderIcon("yandex")} Войти через Яндекс
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог ввода ника */}
        <Dialog open={showNicknameDialog} onOpenChange={() => {}}>
          <DialogContent className="bg-slate-800 border-yellow-500/30">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 text-center text-xl">
                Введите ваш игровой ник
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="nickname" className="text-gray-300">
                  Никнейм
                </Label>
                <Input
                  id="nickname"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="Введите ваш ник"
                  className="bg-slate-700 border-gray-600 text-white"
                  maxLength={20}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleNicknameSubmit();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleNicknameSubmit}
                disabled={!nicknameInput.trim()}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
                size="lg"
              >
                Начать игру
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4 font-['Montserrat']">
            🎰 Игра Удачи
          </h1>
          <p className="text-xl text-gray-300 font-['Open_Sans']">
            Проверь свою удачу! Числа от 1 до 1 миллиарда
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Badge className="bg-slate-700 text-gray-300">
              {getProviderIcon(user.provider)} {user.nickname}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUser(null);
                setShowAuthDialog(true);
              }}
              className="text-gray-400 hover:text-white"
            >
              <Icon name="LogOut" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая панель - Игра */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <Card className="bg-slate-800/50 border-yellow-500/30 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-yellow-400 font-['Montserrat']">
                  Твоё число
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-white mb-8 font-mono tracking-wider min-h-[80px] flex items-center justify-center">
                  {isSpinning ? (
                    <span className="animate-pulse text-yellow-400">
                      {formatNumber(currentNumber)}
                    </span>
                  ) : currentNumber > 0 ? (
                    <span className="text-green-400">
                      {formatNumber(currentNumber)}
                    </span>
                  ) : (
                    <span className="text-gray-500">?</span>
                  )}
                </div>

                <Button
                  onClick={handleLuckyCheck}
                  disabled={isSpinning}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-xl px-8 py-4 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-['Montserrat']"
                  size="lg"
                >
                  {isSpinning ? (
                    <>
                      <Icon
                        name="Loader2"
                        className="mr-2 h-5 w-5 animate-spin"
                      />
                      Вращается...
                    </>
                  ) : (
                    <>
                      <Icon name="Dices" className="mr-2 h-5 w-5" />
                      Проверить удачу
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Правая панель - Таблица лидеров */}
          <div>
            <Card className="bg-slate-800/50 border-purple-500/30 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-400 font-['Montserrat'] flex items-center">
                  <Icon name="Trophy" className="mr-2 h-6 w-6" />
                  Таблица лидеров
                </CardTitle>

                <Tabs
                  value={timeFilter}
                  onValueChange={(value) =>
                    setTimeFilter(value as "day" | "month" | "all")
                  }
                  className="mt-4"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700">
                    <TabsTrigger value="day" className="text-sm">
                      День
                    </TabsTrigger>
                    <TabsTrigger value="month" className="text-sm">
                      Месяц
                    </TabsTrigger>
                    <TabsTrigger value="all" className="text-sm">
                      Всё время
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredLeaderboard.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Icon
                        name="CircleX"
                        className="mx-auto h-12 w-12 mb-4 opacity-50"
                      />
                      <p>Пока нет результатов</p>
                    </div>
                  ) : (
                    filteredLeaderboard.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={index === 0 ? "default" : "secondary"}
                            className={
                              index === 0
                                ? "bg-yellow-500 text-black"
                                : index === 1
                                  ? "bg-gray-400 text-black"
                                  : index === 2
                                    ? "bg-orange-600 text-white"
                                    : "bg-slate-600"
                            }
                          >
                            #{entry.rank}
                          </Badge>
                          <div className="flex flex-col">
                            <span className="text-white font-bold font-mono text-lg">
                              {formatNumber(entry.number)}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {entry.nickname}
                            </span>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {entry.timestamp.toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
