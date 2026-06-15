export interface BaseDAO {
  id: string;
  name: string;
  address: string;
  description: string;
  network: "base-mainnet";
  ethBalance: number;
  usdcBalance: number;
  aeroBalance: number;
  budgetCapUSD: number;
  isCustom?: boolean;
  category?: string;
}

export type TransactionCategory = 
  | "Developer Grant" 
  | "Marketing & Growth" 
  | "Liquidity Provision" 
  | "Security Audit" 
  | "Core Contributors" 
  | "Operations & Legal" 
  | "Uncategorized";

export interface Transaction {
  id: string;
  daoId: string;
  hash: string;
  timestamp: string;
  recipient: string;
  amountETH: number;
  amountUSD: number;
  tokenSymbol: "ETH" | "USDC" | "AERO";
  category: TransactionCategory;
  description: string;
  proposalId?: string; // If associated with a proposal
  status: "Completed" | "Pending";
  riskScore?: "Low" | "Medium" | "High";
  riskNotes?: string;
  spentBy?: string; // Who spent the money / submitted claimant
  occurredAt?: string; // When the expense occurred (custom date-time support)
  tags?: string[];
}

export interface Budget {
  category: TransactionCategory;
  allocatedUSD: number;
  spentUSD: number;
}

export interface ProposalPlan {
  id: string;
  daoId: string; // Associated DAO
  title: string;
  recipient: string;
  amountETH: number;
  tokenSymbol: "ETH" | "USDC" | "AERO";
  category: TransactionCategory;
  rationale: string;
  status: "Voting" | "Approved" | "Rejected" | "Draft";
  spentBy?: string; // Who spent the money / who is claimant
  occurredAt?: string; // When the expense occurred
  votesSupport: number;
  votesOppose: number;
  votesAbstain: number;
  voterReceipts?: Record<string, "Support" | "Oppose" | "Abstain">; // Track individual user votes
  riskScore?: "Low" | "Medium" | "High";
  riskExplanation?: string;
  auditMeritAnalysis?: string;
}

