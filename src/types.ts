export interface RaffleData {
  [raffleId: string]: string; // raffleId -> playerId
}

export interface RaffleState {
  tickets: RaffleData;
  selectedCount: number;
  isRaffleInProgress: boolean;
}