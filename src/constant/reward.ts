import { DAY } from "./time";

export const REWARD_DURATION = 1 * DAY

export const REWARD_PENALTY = 0.75

export const REWARD_LENDS = [
  {
    id: "1",
    lendPeriod: 7 * DAY,
    amount: 1,
    multiply: 1,
  },
  {
    id: "2",
    lendPeriod: 30 * DAY,
    amount: 1,
    multiply: 1.05,
  },
  {
    id: "3",
    lendPeriod: 60 * DAY,
    amount: 1,
    multiply: 1.1,
  },
  {
    id: "4",
    lendPeriod: 90 * DAY,
    amount: 1,
    multiply: 1.15,
  },
  {
    id: "5",
    lendPeriod: 120 * DAY,
    amount: 1,
    multiply: 1.2,
  },
]
