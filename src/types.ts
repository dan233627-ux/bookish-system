export interface InvestmentPlan {
  id: string;
  category: '24h' | '2day' | 'weekly';
  categoryLabel: string;
  durationLabel: string;
  capital: number;
  roi: number;
  durationHours: number;
}

export interface ActiveInvestment {
  id: string;
  planId: string;
  planLabel: string;
  category: '24h' | '2day' | 'weekly';
  capital: number;
  roi: number;
  startDate: string;
  endDate: string;
  durationHours: number;
  progress: number; // 0 to 100
  currentEarning: number;
  status: 'active' | 'completed' | 'claimed';
}

export interface Transaction {
  id: string;
  username: string;
  type: 'deposit' | 'payout' | 'reinvest';
  amount: number;
  planLabel: string;
  timestamp: string;
  status: 'processed' | 'pending' | 'completed';
}

export interface CommunityComment {
  id: string;
  username: string;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Royal Elite' | 'VIP';
  avatarSeed: string;
  content: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
}
