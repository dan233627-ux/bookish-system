import { InvestmentPlan, Transaction, CommunityComment } from './types';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  // 24 Hours Plans
  {
    id: '24h-1',
    category: '24h',
    categoryLabel: '24 Hours Plan',
    durationLabel: '24 Hours',
    capital: 500,
    roi: 4200,
    durationHours: 24
  },
  {
    id: '24h-2',
    category: '24h',
    categoryLabel: '24 Hours Plan',
    durationLabel: '24 Hours',
    capital: 600,
    roi: 5000,
    durationHours: 24
  },
  {
    id: '24h-3',
    category: '24h',
    categoryLabel: '24 Hours Plan',
    durationLabel: '24 Hours',
    capital: 700,
    roi: 6100,
    durationHours: 24
  },
  {
    id: '24h-4',
    category: '24h',
    categoryLabel: '24 Hours Plan',
    durationLabel: '24 Hours',
    capital: 800,
    roi: 7000,
    durationHours: 24
  },

  // 2 Days Plans
  {
    id: '2day-1',
    category: '2day',
    categoryLabel: '2 Days Plan',
    durationLabel: '2 Days',
    capital: 900,
    roi: 8000,
    durationHours: 48
  },
  {
    id: '2day-2',
    category: '2day',
    categoryLabel: '2 Days Plan',
    durationLabel: '2 Days',
    capital: 1000,
    roi: 9000,
    durationHours: 48
  },
  {
    id: '2day-3',
    category: '2day',
    categoryLabel: '2 Days Plan',
    durationLabel: '2 Days',
    capital: 1500,
    roi: 12000,
    durationHours: 48
  },

  // Weekly Plans
  {
    id: 'weekly-1',
    category: 'weekly',
    categoryLabel: 'Weekly Plan',
    durationLabel: '7 Days',
    capital: 2000,
    roi: 16000,
    durationHours: 168
  },
  {
    id: 'weekly-2',
    category: 'weekly',
    categoryLabel: 'Weekly Plan',
    durationLabel: '7 Days',
    capital: 3000,
    roi: 20000,
    durationHours: 168
  },
  {
    id: 'weekly-3',
    category: 'weekly',
    categoryLabel: 'Weekly Plan',
    durationLabel: '7 Days',
    capital: 5000,
    roi: 30000,
    durationHours: 168
  },
  {
    id: 'weekly-4',
    category: 'weekly',
    categoryLabel: 'Weekly Plan',
    durationLabel: '7 Days',
    capital: 10000,
    roi: 60000,
    durationHours: 168
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    username: 'VIP_RoyalTrader',
    type: 'deposit',
    amount: 10000,
    planLabel: '7 Days Weekly Pool',
    timestamp: '2 mins ago',
    status: 'completed'
  },
  {
    id: 'tx-2',
    username: 'Alister_F',
    type: 'payout',
    amount: 4200,
    planLabel: '24 Hours Pool',
    timestamp: '5 mins ago',
    status: 'completed'
  },
  {
    id: 'tx-3',
    username: 'Lady_GoldStandard',
    type: 'deposit',
    amount: 1500,
    planLabel: '2 Days Pool',
    timestamp: '15 mins ago',
    status: 'completed'
  },
  {
    id: 'tx-4',
    username: 'Marcus_K',
    type: 'payout',
    amount: 9000,
    planLabel: '2 Days Pool',
    timestamp: '32 mins ago',
    status: 'completed'
  },
  {
    id: 'tx-5',
    username: 'SovereignFX',
    type: 'deposit',
    amount: 5000,
    planLabel: '7 Days Weekly Pool',
    timestamp: '1 hour ago',
    status: 'completed'
  },
  {
    id: 'tx-6',
    username: 'CrownPool_Boss',
    type: 'payout',
    amount: 12000,
    planLabel: '2 Days Pool',
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: 'tx-7',
    username: 'EliteScalper',
    type: 'deposit',
    amount: 800,
    planLabel: '24 Hours Pool',
    timestamp: '3 hours ago',
    status: 'completed'
  }
];

export const INITIAL_COMMENTS: CommunityComment[] = [
  {
    id: 'comment-1',
    username: 'LordForex_99',
    rank: 'Royal Elite',
    avatarSeed: 'lord_forex',
    content: 'Unbelievable returns on the £1,000 pool! The payout of £9,000 was processed automatically to my USDT wallet in exactly 48 hours. Royal support team was fast too. ✅',
    timestamp: 'Today at 3:14 PM',
    likes: 42
  },
  {
    id: 'comment-2',
    username: 'PrestigeTrader',
    rank: 'VIP',
    avatarSeed: 'prestige',
    content: 'Just reinvested £3,000 into the weekly pool. Ready for £20,000! Royal community has changed the game. Let\'s go guys! 🚀🔥',
    timestamp: 'Today at 1:45 PM',
    likes: 28
  },
  {
    id: 'comment-3',
    username: 'Charlotte_Gold',
    rank: 'Gold',
    avatarSeed: 'charlotte',
    content: 'The 24h pool is insane! Deposited £500 yesterday, woke up to £4,200 payout notification. Transparent tracking here makes all the difference.',
    timestamp: 'Yesterday at 9:11 PM',
    likes: 19
  },
  {
    id: 'comment-4',
    username: 'SterlingScalper',
    rank: 'Silver',
    avatarSeed: 'sterling',
    content: 'Can verify this is completely active and paying out without issues. Fast deposits via BTC and direct pool allocation.',
    timestamp: '2 days ago',
    likes: 12
  }
];

export const CRYPTO_WALLETS = {
  TRX: 'TC2C999E01259c50334765bE4988d3F1dC',
  USDT_TRC20: 'TQoGQdLGK9gJ9EvMu7LqQzA6Vs8rn3m6Vp',
  USDT_ERC20: '0x2C999E01259c50334765bE4988d3F1dCF68346c1',
  BTC: 'bc1qmyjpjnvxhn7cuph86dylhzwtha6cdg7thdqnks',
  ETH: '0x2C999E01259c50334765bE4988d3F1dCF68346c1'
};
