import { RaffleData } from '../types';

// Generate sample raffle data from ID 100 to 520
export const initialRaffleData: RaffleData = Array.from(
  { length: 840 }, // 520 - 100 + 1
  (_, index) => {
    const raffleId = (index + 100).toString();
    const playerId = `player${Math.floor(Math.random() * 100)}`; // Random player IDs
    return [raffleId, playerId];
  }
).reduce((acc, [raffleId, playerId]) => {
  acc[raffleId] = playerId;
  return acc;
}, {} as RaffleData);
