import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Diamond,
  Search,
  Play,
  RotateCcw,
  Filter,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Palette,
} from 'lucide-react';
import { initialRaffleData } from './data/raffleData';

interface Ticket {
  number: number;
  selected: boolean;
  eliminated: boolean;
  highlighted?: boolean;
  className?: string;
}

interface Theme {
  name: string;
  bgGradient: string;
  cardGradient: string;
  highlightColor: string;
  eliminateColor: string;
  winnerColor: string;
}

const themes: Theme[] = [
  {
    name: 'Diamond',
    bgGradient: 'from-[#1a2332] to-[#0d1219]',
    cardGradient: 'from-yellow-400 to-yellow-500',
    highlightColor: 'from-purple-400 to-purple-500',
    eliminateColor: 'bg-gray-800/50',
    winnerColor: 'from-yellow-400 to-yellow-500',
  },
  {
    name: 'Casino',
    bgGradient: 'from-red-900 to-red-950',
    cardGradient: 'from-red-500 to-red-600',
    highlightColor: 'from-green-400 to-green-500',
    eliminateColor: 'bg-red-950/50',
    winnerColor: 'from-gold-400 to-gold-500',
  },
  {
    name: 'Futuristic',
    bgGradient: 'from-blue-900 to-indigo-950',
    cardGradient: 'from-cyan-400 to-blue-500',
    highlightColor: 'from-indigo-400 to-indigo-500',
    eliminateColor: 'bg-blue-950/50',
    winnerColor: 'from-cyan-400 to-cyan-500',
  },
];

const STORAGE_KEY = 'raffle_state';

function App() {
  // Convert raffle data to tickets array
  const initialTickets: Ticket[] = Object.keys(initialRaffleData).map(
    (raffleId) => ({
      number: parseInt(raffleId),
      selected: false,
      eliminated: false,
    })
  );

  // Load initial state from localStorage or use default values
  const loadInitialState = () => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const {
        tickets: savedTickets,
        currentRound,
        winningTicket,
      } = JSON.parse(savedState);
      return { tickets: savedTickets, currentRound, winningTicket };
    }
    return { tickets: initialTickets, currentRound: 1, winningTicket: null };
  };

  const initialState = loadInitialState();
  const [tickets, setTickets] = useState<Ticket[]>(initialState.tickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketsToEliminate, setTicketsToEliminate] = useState(126);
  const [isRaffleRunning, setIsRaffleRunning] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [currentRound, setCurrentRound] = useState(initialState.currentRound);
  const [eliminationProgress, setEliminationProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winningTicket, setWinningTicket] = useState<number | null>(
    initialState.winningTicket
  );
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  // A ref to track total eliminated during a round (resets each round)
  const totalEliminatedRef = useRef(0);
  const ticketsRef = useRef(tickets);
  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  // Sound effects
  const tickSound = useRef(
    new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
    )
  );
  const eliminationSound = useRef(
    new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3'
    )
  );
  const winnerSound = useRef(
    new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'
    )
  );
  const shuffleSound = useRef(
    new Audio(
      'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'
    )
  );

  // Persist state to localStorage
  useEffect(() => {
    const state = { tickets, currentRound, winningTicket };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [tickets, currentRound, winningTicket]);

  const availableTickets = tickets.filter((t) => !t.eliminated).length;
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.number.toString().includes(searchQuery);
    const matchesFilter = showOnlyAvailable ? !ticket.eliminated : true;
    return matchesSearch && matchesFilter;
  });

  const handleTicketClick = (number: number) => {
    if (isRaffleRunning) return;
    if (isSoundEnabled) tickSound.current.play();
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.number === number
          ? { ...ticket, selected: !ticket.selected }
          : ticket
      )
    );
  };

  const shuffleAnimation = useCallback(() => {
    if (isSoundEnabled) shuffleSound.current.play();

    const duration = 1000; // 1 second
    const frames = 20; // Number of frames
    let frame = 0;

    const interval = setInterval(() => {
      setTickets((prev) => {
        const available = prev.filter((t) => !t.eliminated);
        const shuffled = [...available].sort(() => Math.random() - 0.5);

        return prev.map((ticket) => {
          if (ticket.eliminated) return ticket;
          return {
            ...ticket,
            className: `shuffle-animation-${frame % 2 ? 'left' : 'right'}`,
          };
        });
      });

      frame++;
      if (frame >= frames) {
        clearInterval(interval);
        setTickets((prev) => prev.map((t) => ({ ...t, className: undefined })));
      }
    }, duration / frames);
  }, [isSoundEnabled]);

  const highlightRandomTickets = useCallback(() => {
    setTickets((prevTickets) => {
      const available = prevTickets.filter((t) => !t.eliminated);
      if (available.length === 0) return prevTickets;

      const randomIndexes = Array.from(
        { length: Math.min(5, available.length) },
        () => Math.floor(Math.random() * available.length)
      );
      const highlightedNumbers = randomIndexes.map((i) => available[i].number);

      return prevTickets.map((ticket) => ({
        ...ticket,
        highlighted: highlightedNumbers.includes(ticket.number),
      }));
    });
  }, []);

  const handleStartRaffle = () => {
    if (isRaffleRunning || ticketsToEliminate <= 0) return;

    setIsRaffleRunning(true);
    setCurrentRound((prev) => prev + 1);
    setEliminationProgress(0);
    totalEliminatedRef.current = 0; // Reset for new round
    setWinningTicket(null);

    // Phase 1: Shuffle Animation (1 second)
    shuffleAnimation();

    setTimeout(() => {
      // Start highlight phase
      const highlightInterval = setInterval(highlightRandomTickets, 100);

      // After 2 seconds, stop highlighting and clear any leftover purple highlight
      setTimeout(() => {
        clearInterval(highlightInterval);
        setTickets((prev) =>
          prev.map((ticket) => ({ ...ticket, highlighted: false }))
        );

        // Phase 2: Elimination logic
        const roundEliminationCount = ticketsToEliminate;
        const totalBatches = Math.min(10, roundEliminationCount);
        const baseBatchSize = Math.ceil(roundEliminationCount / totalBatches);
        let currentBatch = 0;

        const eliminationInterval = setInterval(() => {
          const availableCount = ticketsRef.current.filter(
            (t) => !t.eliminated
          ).length;
          if (availableCount <= 1) {
            clearInterval(eliminationInterval);
            setIsRaffleRunning(false);
            if (isSoundEnabled) winnerSound.current.play();
            setShowConfetti(true);
            const winner = ticketsRef.current.find((t) => !t.eliminated);
            if (winner) {
              setWinningTicket(winner.number);
              setTickets((prev) =>
                prev.map((t) =>
                  t.number === winner.number
                    ? { ...t, className: 'winner-zoom spotlight' }
                    : t
                )
              );
            }
            setTimeout(() => setShowConfetti(false), 5000);
            return;
          }

          // Calculate how many tickets we still need to eliminate
          const remainingToEliminate =
            roundEliminationCount - totalEliminatedRef.current;
          if (remainingToEliminate <= 0) {
            clearInterval(eliminationInterval);
            setIsRaffleRunning(false);
            return;
          }

          const batchSize = Math.min(baseBatchSize, remainingToEliminate);

          // Randomly select batchSize tickets to eliminate
          const availableTicketsForElimination = ticketsRef.current.filter(
            (t) => !t.eliminated
          );
          const shuffled = [...availableTicketsForElimination].sort(
            () => Math.random() - 0.5
          );
          const selectedToEliminate = shuffled
            .slice(0, batchSize)
            .map((t) => t.number);

          setTickets((prev) =>
            prev.map((ticket) => {
              if (selectedToEliminate.includes(ticket.number)) {
                return {
                  ...ticket,
                  eliminated: true,
                  highlighted: false,
                  className: 'eliminate-flash',
                };
              }
              return ticket;
            })
          );

          // Remove the temporary elimination flash class after the animation (600ms)
          setTimeout(() => {
            setTickets((prev) =>
              prev.map((ticket) => {
                if (
                  ticket.eliminated &&
                  ticket.className === 'eliminate-flash'
                ) {
                  return { ...ticket, className: '' };
                }
                return ticket;
              })
            );
          }, 600);

          totalEliminatedRef.current += batchSize;
          currentBatch++;
          setEliminationProgress((currentBatch / totalBatches) * 100);

          if (currentBatch >= totalBatches) {
            clearInterval(eliminationInterval);
            setIsRaffleRunning(false);
          }
        }, 300);
      }, 2000);
    }, 1000);
  };

  const handleReset = () => {
    setTickets(initialTickets);
    setTicketsToEliminate(126);
    setSearchQuery('');
    setShowOnlyAvailable(false);
    setCurrentRound(1);
    setShowConfetti(false);
    setEliminationProgress(0);
    setWinningTicket(null);
    totalEliminatedRef.current = 0;
    localStorage.removeItem(STORAGE_KEY);
  };

  const cycleTheme = () => {
    const currentIndex = themes.findIndex((t) => t.name === currentTheme.name);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  return (
    <div
      className={`h-screen flex flex-col bg-gradient-to-b ${currentTheme.bgGradient} text-white relative`}
    >
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 animate-confetti" />
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col">
        <header className="p-4 md:p-8 text-center">
          <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto">
            <div className="flex items-center">
              <Diamond className="text-yellow-400 w-8 h-8 mr-3 animate-pulse" />
              <h1 className="text-3xl font-bold">
                <span className="text-yellow-400">Golden Hands</span>
                <span className="mx-2">×</span>
                <span className="text-yellow-400">The Diamond Casino</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSoundEnabled((prev) => !prev)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-6 h-6 text-yellow-400" />
                ) : (
                  <VolumeX className="w-6 h-6 text-gray-400" />
                )}
              </button>
              <button
                onClick={cycleTheme}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Palette className="w-6 h-6 text-yellow-400" />
              </button>
              <button
                onClick={() => setIsDarkTheme((prev) => !prev)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isDarkTheme ? (
                  <Moon className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Sun className="w-6 h-6 text-yellow-400" />
                )}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-transparent bg-clip-text">
              RAFFLE
            </h2>
            <div className="text-sm text-yellow-400/80">
              Round {currentRound}
            </div>
          </div>
        </header>

        <div
          className={`px-4 md:px-8 py-4 border-y ${
            isDarkTheme ? 'border-gray-800' : 'border-white/20'
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors ${
                  isDarkTheme
                    ? 'bg-gray-800/50 border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                    : 'bg-white/10 border-white/20 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                }`}
              />
            </div>
            <button
              onClick={() => setShowOnlyAvailable((prev) => !prev)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showOnlyAvailable
                  ? 'bg-yellow-400 text-gray-900'
                  : isDarkTheme
                  ? 'bg-gray-800/50 text-gray-300'
                  : 'bg-white/10 text-gray-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              Available Only
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 md:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-w-4xl mx-auto">
            {filteredTickets.map(
              ({ number, eliminated, highlighted, className }) => (
                <div
                  key={number}
                  onClick={() => handleTicketClick(number)}
                  className={`
                  aspect-square rounded-lg p-2 flex flex-col items-center justify-center
                  transition-all duration-300 transform hover:scale-105 cursor-pointer
                  border-2 ${className || ''} ${
                    eliminated
                      ? isDarkTheme
                        ? currentTheme.eliminateColor +
                          ' border-gray-700 opacity-80'
                        : 'bg-black/30 border-white/20 opacity-80'
                      : highlighted
                      ? `bg-gradient-to-br ${currentTheme.highlightColor} border-purple-300 shadow-lg animate-pulse`
                      : number === winningTicket
                      ? `bg-gradient-to-br ${currentTheme.winnerColor} border-yellow-300 shadow-lg neon-text`
                      : `bg-gradient-to-br ${currentTheme.cardGradient} border-yellow-300 shadow-lg hover:shadow-yellow-400/20`
                  }
                `}
                >
                  <span className="text-xs font-medium">Ticket</span>
                  <span className="font-bold text-lg">{number}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div
          className={`p-3 border-t ${
            isDarkTheme
              ? 'border-gray-800 bg-gray-900/50'
              : 'border-white/20 bg-black/50'
          } backdrop-blur-sm`}
        >
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 sm:w-1/4">
              <span className="text-3xl font-bold text-yellow-400">
                {availableTickets}
              </span>
              <span className="text-sm text-gray-400">
                tickets
                <br />
                available
              </span>
            </div>

            <div className="flex-1 flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max={availableTickets}
                  value={ticketsToEliminate}
                  onChange={(e) =>
                    setTicketsToEliminate(Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Eliminate: {ticketsToEliminate}</span>
                  <span>Max: {availableTickets}</span>
                </div>
              </div>

              <button
                onClick={handleStartRaffle}
                disabled={isRaffleRunning || availableTickets === 0}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 
                         text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 
                         disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-all transform hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isRaffleRunning && eliminationProgress > 0 && (
            <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-yellow-400 h-full transition-all duration-300 progress-animate"
                style={{ width: `${eliminationProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
