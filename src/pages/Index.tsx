import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";

interface LeaderboardEntry {
  id: string;
  number: number;
  timestamp: Date;
  rank: number;
}

const Index = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<"day" | "month" | "all">("all");

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 1000000000) + 1;
  };

  const handleLuckyCheck = async () => {
    if (isSpinning) return;

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
                          <span className="text-white font-bold font-mono text-lg">
                            {formatNumber(entry.number)}
                          </span>
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
