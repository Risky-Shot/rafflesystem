import React, { useState, useEffect, useCallback } from 'react';
import { Ticket } from 'lucide-react';
import { RaffleTicket } from './components/RaffleTicket';
import { initialRaffleData } from './data/raffleData';
import type { RaffleData } from './types';

function App() {
  const [tickets, setTickets] = useState<RaffleData>(initialRaffleData);
  const [selectedCount, setSelectedCount] = useState(1);
  const [isRaffleInProgress, setIsRaffleInProgress] = useState(false);

  const availableTickets = Object.keys(tickets).length;

  useEffect(() => {
      const existingTickets = JSON.parse(localStorage.getItem('tickets'));

      existingTickets ? setTickets(existingTickets) : setTickets(initialRaffleData);
    console.log('Updated Tickets', existingTickets)
  }, []);

  const handleRaffle = useCallback(() => {
    setIsRaffleInProgress(true);
    
    // Create animation effect
    const animationDuration = 10000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / animationDuration;
      
      if (progress < 1) {
        // During animation, randomly hide/show tickets
        const tempTickets = { ...tickets };
        Object.keys(tempTickets).forEach(id => {
          if (Math.random() > 0.5) {
            delete tempTickets[id];
          }
        });
        setTickets(tempTickets);
        requestAnimationFrame(animate);
      } else {
        // After animation, perform actual elimination
        const ticketIds = Object.keys(tickets);
        const shuffled = [...ticketIds].sort(() => Math.random() - 0.5);
        const remainingIds = shuffled.slice(0, ticketIds.length - selectedCount);
        
        const newTickets: RaffleData = {};
        remainingIds.forEach(id => {
          newTickets[id] = tickets[id];
        });
        
        setTickets(newTickets);
        setIsRaffleInProgress(false);
        
        // Reset selected count if needed
        if (selectedCount > remainingIds.length) {
          console.log('Issue?')
          setSelectedCount(Math.min(1, remainingIds.length));
        }

        console.log(newTickets);
        localStorage.setItem('tickets', JSON.stringify(newTickets));
      }
    };
    
    requestAnimationFrame(animate);
  }, [tickets, selectedCount]);

  return (
    <div className="h-screen bg-gradient-to-t from-green-600 to-slate-900 p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="bg-gradient-to-t from-slate-900 to-slate-700 rounded-lg shadow-lg p-6 flex-1 flex flex-col">
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-3xl font-bold text-yellow-200 flex items-center gap-2">
              Golden Hands x The Diamond Casino
            </h1>
            <h1 className="text-3xl font-bold text-yellow-200 flex items-center gap-2">
              RAFFLE
            </h1>
          </div>

          {/* Scrollable Tickets Container */}
          <div className="flex-1 overflow-hidden mb-6">
            <div className="h-96 overflow-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {Object.entries(tickets).map(([id, playerId]) => (
                  <RaffleTicket key={id} id={id} playerId={playerId} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="flex flex-col text-5xl font-semibold text-yellow-600 justify-center items-center">
                {availableTickets}
                <span className="text-lg text-white">AVAILABLE TICKETS</span>
            </div>
            
          </div>

          {/* Controls - Fixed at bottom */}
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label htmlFor="ticketCount" className="text-lg font-medium text-white">
                Tickets to Eliminate: {selectedCount}
              </label>
              <input
                id="ticketCount"
                type="range"
                min={1}
                max={Math.max(1, Object.keys(tickets).length)}
                value={selectedCount}
                onChange={(e) => setSelectedCount(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                disabled={isRaffleInProgress || availableTickets <= 1}
              />
            </div>

            <div className="flex justify-center gap-5 flex-col">
              <button
                onClick={handleRaffle}
                disabled={isRaffleInProgress || availableTickets <= 1}
                className="px-8 py-4 bg-gradient-to-t from-emerald-500 to-emerald-900 text-white font-bold rounded-lg shadow-lg hover:bg-gradient-to-b transition-colors
                          disabled:bg-gray-400 
                          disabled:cursor-not-allowed text-xl"
              >
                {availableTickets <= 1 ? 'Winner Selected!' : (
                  isRaffleInProgress ? 'Raffling...' : 'Start Raffle'
                )}
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                }}
                className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg shadow-lg 
                          hover:bg-red-700 transition-colors disabled:bg-gray-400 
                          disabled:cursor-not-allowed text-xl"
              >
                RESET STORAGE
              </button>
            </div>
          </div>
        </div>

        {availableTickets === 1 && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Ticket className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-green-900 font-medium">
                  Congratulations! The winning ticket is #{Object.keys(tickets)[0]} 
                  (Player ID: {Object.values(tickets)[0]})
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;