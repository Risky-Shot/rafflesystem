import React from 'react';

interface RaffleTicketProps {
  id: string;
  playerId: string;
}

export const RaffleTicket: React.FC<RaffleTicketProps> = ({ id }) => {
  return (
    <div className="bg-yellow-500 rounded-lg shadow-md p-4 m-2 w-20 h-20 flex flex-col items-center justify-center border-2 border-white hover:border-black transition-colors">
      <div className="text-sm text-gray-500">Ticket</div>
      <div className="text-xl font-bold text-blue-600">{id}</div>
    </div>
  );
};