import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Diamond, Search, Play, RotateCcw, Filter, Moon, Sun, Volume2, VolumeX, Palette } from 'lucide-react';

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
    winnerColor: 'from-yellow-400 to-yellow-500'
  },
  {
    name: 'Casino',
    bgGradient: 'from-red-900 to-red-950',
    cardGradient: 'from-red-500 to-red-600',
    highlightColor: 'from-green-400 to-green-500',
    eliminateColor: 'bg-red-950/50',
    winnerColor: 'from-gold-400 to-gold-500'
  },
  {
    name: 'Futuristic',
    bgGradient: 'from-blue-900 to-indigo-950',
    cardGradient: 'from-cyan-400 to-blue-500',
    highlightColor: 'from-indigo-400 to-indigo-500',
    eliminateColor: 'bg-blue-950/50',
    winnerColor: 'from-cyan-400 to-cyan-500'
  }
];

const STORAGE_KEY = 'raffle_state';

function App() {
  const initialTickets: Ticket[] = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699]
  .map(number => ({ number, selected: false, eliminated: false }));

  // Load initial state from localStorage or use default values
  const loadInitialState = () => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const { tickets: savedTickets, currentRound, winningTicket } = JSON.parse(savedState);
      return {
        tickets: savedTickets,
        currentRound,
        winningTicket
      };
    }
    return {
      tickets: initialTickets,
      currentRound: 1,
      winningTicket: null
    };
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
  const [winningTicket, setWinningTicket] = useState<number | null>(initialState.winningTicket);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  const totalEliminatedRef = useRef(0);
  const ticketsRef = useRef(tickets);
  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  const tickSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'));
  const eliminationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3'));
  const winnerSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'));
  const shuffleSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'));

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      tickets,
      currentRound,
      winningTicket
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [tickets, currentRound, winningTicket]);

  const availableTickets = tickets.filter(t => !t.eliminated).length;

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.number.toString().includes(searchQuery);
    const matchesFilter = showOnlyAvailable ? !ticket.eliminated : true;
    return matchesSearch && matchesFilter;
  });

  const handleTicketClick = (number: number) => {
    if (isRaffleRunning) return;
    if (isSoundEnabled) tickSound.current.play();
    setTickets(prev => prev.map(ticket =>
      ticket.number === number ? { ...ticket, selected: !ticket.selected } : ticket
    ));
  };

  const shuffleAnimation = useCallback(() => {
    if (isSoundEnabled) shuffleSound.current.play();
    
    const duration = 1000; // 1 second
    const frames = 20; // Number of shuffle frames
    let frame = 0;
    
    const interval = setInterval(() => {
      setTickets(prev => {
        const available = prev.filter(t => !t.eliminated);
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        
        return prev.map(ticket => {
          if (ticket.eliminated) return ticket;
          const randomTicket = shuffled[Math.floor(Math.random() * shuffled.length)];
          return {
            ...ticket,
            className: `shuffle-animation-${frame % 2 ? 'left' : 'right'}`
          };
        });
      });
      
      frame++;
      if (frame >= frames) {
        clearInterval(interval);
        setTickets(prev => prev.map(t => ({ ...t, className: undefined })));
      }
    }, duration / frames);
  }, [isSoundEnabled]);

  const highlightRandomTickets = useCallback(() => {
    setTickets(prevTickets => {
      const available = prevTickets.filter(t => !t.eliminated);
      if (available.length === 0) return prevTickets;
      
      const randomIndexes = Array.from({ length: Math.min(5, available.length) }, () =>
        Math.floor(Math.random() * available.length)
      );
      const highlightedNumbers = randomIndexes.map(i => available[i].number);

      return prevTickets.map(ticket => ({
        ...ticket,
        highlighted: highlightedNumbers.includes(ticket.number)
      }));
    });
  }, []);

  const eliminateTickets = useCallback((batchSize: number) => {
    let eliminatedInBatch = 0;
    
    setTickets(prevTickets => {
      const available = prevTickets.filter(t => !t.eliminated);
      if (available.length === 0) return prevTickets;

      const remainingToEliminate = ticketsToEliminate - totalEliminatedRef.current;
      const ticketsToRemove = Math.min(batchSize, available.length, remainingToEliminate);

      if (ticketsToRemove <= 0) return prevTickets;

      eliminatedInBatch = ticketsToRemove;
      const shuffled = [...available].sort(() => Math.random() - 0.5);
      const toEliminate = shuffled.slice(0, ticketsToRemove).map(t => t.number);

      if (isSoundEnabled) eliminationSound.current.play();

      return prevTickets.map(ticket => ({
        ...ticket,
        eliminated: ticket.eliminated || toEliminate.includes(ticket.number),
        highlighted: false,
        className: toEliminate.includes(ticket.number) ? 'eliminate-flash' : ''
      }));
    });

    totalEliminatedRef.current += eliminatedInBatch;
    return totalEliminatedRef.current < ticketsToEliminate;
  }, [ticketsToEliminate, isSoundEnabled]);

  const handleStartRaffle = () => {
    if (isRaffleRunning || ticketsToEliminate <= 0) return;

    setIsRaffleRunning(true);
    setCurrentRound(prev => prev + 1);
    setEliminationProgress(0);
    totalEliminatedRef.current = 0;
    setWinningTicket(null);
    
    // Phase 1: Shuffle Animation (1 second)
    shuffleAnimation();
    
    // Phase 2: Highlight animation (2 seconds)
    setTimeout(() => {
      const highlightInterval = setInterval(highlightRandomTickets, 100);
      
      // Phase 3: Elimination (after 2 seconds of highlights)
      setTimeout(() => {
        clearInterval(highlightInterval);
        
        const totalBatches = Math.min(10, ticketsToEliminate);
        const batchSize = Math.ceil(ticketsToEliminate / totalBatches);
        let currentBatch = 0;

        const eliminationInterval = setInterval(() => {
          const remainingAvailable = ticketsRef.current.filter(t => !t.eliminated).length;
          if (remainingAvailable <= 1) {
            clearInterval(eliminationInterval);
            setIsRaffleRunning(false);
            if (isSoundEnabled) winnerSound.current.play();
            setShowConfetti(true);
            
            // Set winning ticket and add spotlight effect
            const winner = ticketsRef.current.find(t => !t.eliminated);
            if (winner) {
              setWinningTicket(winner.number);
              setTickets(prev => prev.map(t => 
                t.number === winner.number 
                  ? { ...t, className: 'winner-zoom spotlight' }
                  : t
              ));
            }
            
            setTimeout(() => setShowConfetti(false), 5000);
            return;
          }

          const hasMore = eliminateTickets(batchSize);
          currentBatch++;
          setEliminationProgress((currentBatch / totalBatches) * 100);
          
          if (!hasMore || currentBatch >= totalBatches) {
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
    // Clear localStorage when reset is clicked
    localStorage.removeItem(STORAGE_KEY);
  };

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.name === currentTheme.name);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-b ${currentTheme.bgGradient} text-white relative`}>
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
              <button onClick={() => setIsSoundEnabled(prev => !prev)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                {isSoundEnabled ? (
                  <Volume2 className="w-6 h-6 text-yellow-400" />
                ) : (
                  <VolumeX className="w-6 h-6 text-gray-400" />
                )}
              </button>
              <button onClick={cycleTheme} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Palette className="w-6 h-6 text-yellow-400" />
              </button>
              <button onClick={() => setIsDarkTheme(prev => !prev)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
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
            <div className="text-sm text-yellow-400/80">Round {currentRound}</div>
          </div>
        </header>

        <div className={`px-4 md:px-8 py-4 border-y ${isDarkTheme ? 'border-gray-800' : 'border-white/20'}`}>
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
              onClick={() => setShowOnlyAvailable(prev => !prev)}
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
            {filteredTickets.map(({ number, eliminated, highlighted, className }) => (
              <div
                key={number}
                onClick={() => handleTicketClick(number)}
                className={`
                  aspect-square rounded-lg p-2 flex flex-col items-center justify-center
                  transition-all duration-300 transform hover:scale-105 cursor-pointer
                  border-2 ${className || ''} ${
                    eliminated 
                      ? isDarkTheme
                        ? currentTheme.eliminateColor + ' border-gray-700 opacity-50'
                        : 'bg-black/30 border-white/20 opacity-50'
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
            ))}
          </div>
        </div>

        <div className={`p-3 border-t ${
          isDarkTheme 
            ? 'border-gray-800 bg-gray-900/50' 
            : 'border-white/20 bg-black/50'
        } backdrop-blur-sm`}>
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 sm:w-1/4">
              <span className="text-3xl font-bold text-yellow-400">{availableTickets}</span>
              <span className="text-sm text-gray-400">tickets<br/>available</span>
            </div>

            <div className="flex-1 flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max={availableTickets}
                  value={ticketsToEliminate}
                  onChange={(e) => setTicketsToEliminate(Number(e.target.value))}
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
