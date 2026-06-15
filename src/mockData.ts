import { BaseDAO, Transaction, Budget } from "./types";

export const PRESET_DAOS: BaseDAO[] = [
  {
    id: "purple-dao",
    name: "Purple DAO",
    address: "0x893b08e5ef07cfb7992e921d7465050f143714b8",
    description: "Decentralized collective supporting the expansion of Farcaster app layer technology and protocols on Base.",
    network: "base-mainnet",
    ethBalance: 124.52,
    usdcBalance: 48500.00,
    aeroBalance: 142000.00,
    budgetCapUSD: 150000.00,
    category: "social"
  },
  {
    id: "based-nouns",
    name: "Based Nouns",
    address: "0x55df852a4e9ca33cb8e364998782fe81bb598df9",
    description: "Creative-led onchain DAO funding public goods, artistic experiments, and meme proliferation across the Base network.",
    network: "base-mainnet",
    ethBalance: 86.15,
    usdcBalance: 123000.00,
    aeroBalance: 245000.00,
    budgetCapUSD: 250000.00,
    category: "nft"
  },
  {
    id: "base-builders",
    name: "Base Builders Guild",
    address: "0x777598cd6b73528b8cf442ecc2284cd124018314",
    description: "Syndicate of engineers and creators funding high-performance smart contracts, developer tooling, and hackathons on Base.",
    network: "base-mainnet",
    ethBalance: 42.80,
    usdcBalance: 25000.00,
    aeroBalance: 512000.00,
    budgetCapUSD: 100000.00,
    category: "developers"
  },
  {
    id: "aerodrome",
    name: "Aerodrome Finance",
    address: "0x25eb7b37e0e7a5b3a4a080bc64e26a798a7a5da7",
    description: "The primary liquidity hub of Base, coordinating incentives, emission routing, and ve(3,3) locking mechanics across the chain.",
    network: "base-mainnet",
    ethBalance: 450.25,
    usdcBalance: 890000.00,
    aeroBalance: 2500000.00,
    budgetCapUSD: 1500000.00,
    category: "developers"
  },
  {
    id: "virtuals",
    name: "Virtuals Protocol",
    address: "0xacbc0b8fe3e0cf55ca3922240bc64e26c1c222ff",
    description: "The co-ownership layer for AI agents in gaming and social realms on Base, driving permissionless agent launches with automated tokenomics.",
    network: "base-mainnet",
    ethBalance: 180.40,
    usdcBalance: 320000.00,
    aeroBalance: 750000.00,
    budgetCapUSD: 500000.00,
    category: "developers"
  },
  {
    id: "warpcast",
    name: "Warpcast Core",
    address: "0x12f3dbd987df6fcbaee080bc11e284c124018aef",
    description: "Active technical contributor fund powering frames infrastructure, Hub runners, and decentralized developer grants.",
    network: "base-mainnet",
    ethBalance: 110.80,
    usdcBalance: 78000.00,
    aeroBalance: 120000.00,
    budgetCapUSD: 200000.00,
    category: "social"
  },
  {
    id: "basepaint",
    name: "Base Paint Collab",
    address: "0xba5e9a111a1a5b3a4a080bc64e25a798a7a5da77",
    description: "Cooperative digital pixel grid where hundreds of global artists draw daily. Proceeds are automatically distributed onchain directly.",
    network: "base-mainnet",
    ethBalance: 55.40,
    usdcBalance: 35000.00,
    aeroBalance: 88000.00,
    budgetCapUSD: 80000.00,
    category: "nft"
  },
  {
    id: "degen-dao",
    name: "Degen L3 Collective",
    address: "0x43b8a10f87df6fcbc7992e921d7465050f143714",
    description: "High-velocity token ecosystem and autonomous community fund powering developer micro-grants and community initiatives on Base.",
    network: "base-mainnet",
    ethBalance: 320.10,
    usdcBalance: 150000.00,
    aeroBalance: 450000.00,
    budgetCapUSD: 400000.00,
    category: "social"
  },
  {
    id: "talent",
    name: "Talent Protocol",
    address: "0x77722feee9ca33cb8e364998782fe81bb598df99",
    description: "The onchain resume and builder reputation network of Base. Funding visual credential tools, SDK wrappers, and hackathons.",
    network: "base-mainnet",
    ethBalance: 35.15,
    usdcBalance: 14000.00,
    aeroBalance: 185000.00,
    budgetCapUSD: 60000.00,
    category: "developers"
  }
];

export const INITIAL_BUDGETS: Record<string, Budget[]> = {
  "purple-dao": [
    { category: "Developer Grant", allocatedUSD: 60000, spentUSD: 24500 },
    { category: "Marketing & Growth", allocatedUSD: 40000, spentUSD: 31000 },
    { category: "Liquidity Provision", allocatedUSD: 30000, spentUSD: 0 },
    { category: "Security Audit", allocatedUSD: 10000, spentUSD: 8500 },
    { category: "Core Contributors", allocatedUSD: 20000, spentUSD: 12000 },
    { category: "Operations & Legal", allocatedUSD: 10000, spentUSD: 4200 },
    { category: "Uncategorized", allocatedUSD: 5000, spentUSD: 1200 }
  ],
  "based-nouns": [
    { category: "Developer Grant", allocatedUSD: 50000, spentUSD: 15000 },
    { category: "Marketing & Growth", allocatedUSD: 100000, spentUSD: 86000 },
    { category: "Liquidity Provision", allocatedUSD: 50000, spentUSD: 20000 },
    { category: "Security Audit", allocatedUSD: 10000, spentUSD: 0 },
    { category: "Core Contributors", allocatedUSD: 25000, spentUSD: 15000 },
    { category: "Operations & Legal", allocatedUSD: 15000, spentUSD: 9500 },
    { category: "Uncategorized", allocatedUSD: 10000, spentUSD: 4300 }
  ],
  "base-builders": [
    { category: "Developer Grant", allocatedUSD: 50000, spentUSD: 38000 },
    { category: "Marketing & Growth", allocatedUSD: 15000, spentUSD: 7200 },
    { category: "Liquidity Provision", allocatedUSD: 20000, spentUSD: 5000 },
    { category: "Security Audit", allocatedUSD: 15000, spentUSD: 12000 },
    { category: "Core Contributors", allocatedUSD: 10000, spentUSD: 5000 },
    { category: "Operations & Legal", allocatedUSD: 5000, spentUSD: 2100 },
    { category: "Uncategorized", allocatedUSD: 5000, spentUSD: 800 }
  ],
  "aerodrome": [
    { category: "Developer Grant", allocatedUSD: 300000, spentUSD: 120000 },
    { category: "Marketing & Growth", allocatedUSD: 400000, spentUSD: 280000 },
    { category: "Liquidity Provision", allocatedUSD: 500000, spentUSD: 450000 },
    { category: "Security Audit", allocatedUSD: 150000, spentUSD: 95000 },
    { category: "Core Contributors", allocatedUSD: 100000, spentUSD: 60000 },
    { category: "Operations & Legal", allocatedUSD: 50000, spentUSD: 25000 }
  ],
  "virtuals": [
    { category: "Developer Grant", allocatedUSD: 150000, spentUSD: 68000 },
    { category: "Marketing & Growth", allocatedUSD: 100000, spentUSD: 72000 },
    { category: "Liquidity Provision", allocatedUSD: 150000, spentUSD: 120000 },
    { category: "Security Audit", allocatedUSD: 60000, spentUSD: 45000 },
    { category: "Core Contributors", allocatedUSD: 40000, spentUSD: 20000 }
  ],
  "warpcast": [
    { category: "Developer Grant", allocatedUSD: 90000, spentUSD: 42050 },
    { category: "Marketing & Growth", allocatedUSD: 50000, spentUSD: 31000 },
    { category: "Liquidity Provision", allocatedUSD: 30000, spentUSD: 12000 },
    { category: "Security Audit", allocatedUSD: 20000, spentUSD: 19500 },
    { category: "Core Contributors", allocatedUSD: 10000, spentUSD: 5000 }
  ],
  "basepaint": [
    { category: "Developer Grant", allocatedUSD: 20000, spentUSD: 12000 },
    { category: "Marketing & Growth", allocatedUSD: 40000, spentUSD: 18500 },
    { category: "Core Contributors", allocatedUSD: 15000, spentUSD: 9000 },
    { category: "Operations & Legal", allocatedUSD: 5000, spentUSD: 3200 }
  ],
  "degen-dao": [
    { category: "Developer Grant", allocatedUSD: 100000, spentUSD: 48000 },
    { category: "Marketing & Growth", allocatedUSD: 200000, spentUSD: 145000 },
    { category: "Liquidity Provision", allocatedUSD: 50000, spentUSD: 32000 },
    { category: "Core Contributors", allocatedUSD: 30000, spentUSD: 15000 },
    { category: "Operations & Legal", allocatedUSD: 20000, spentUSD: 8500 }
  ],
  "talent": [
    { category: "Developer Grant", allocatedUSD: 30000, spentUSD: 18000 },
    { category: "Marketing & Growth", allocatedUSD: 15000, spentUSD: 8500 },
    { category: "Security Audit", allocatedUSD: 10000, spentUSD: 5000 },
    { category: "Core Contributors", allocatedUSD: 5000, spentUSD: 2500 }
  ]
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Purple DAO
  {
    id: "tx-p1",
    daoId: "purple-dao",
    hash: "0xa278d9b...e219",
    timestamp: "2026-06-10T12:04:00Z",
    recipient: "0x12f3db...4aef",
    amountETH: 3.5,
    amountUSD: 11200,
    tokenSymbol: "ETH",
    category: "Developer Grant",
    description: "Milestone 1 release for Farcaster Client React Native SDK integration.",
    proposalId: "PROP-42",
    status: "Completed",
    riskScore: "Low",
    tags: ["Farcaster", "SDK"]
  },
  {
    id: "tx-p2",
    daoId: "purple-dao",
    hash: "0x43b8a10...9cfd",
    timestamp: "2026-06-08T18:32:00Z",
    recipient: "0x63fe22...2b7e",
    amountETH: 0,
    amountUSD: 15000,
    tokenSymbol: "USDC",
    category: "Marketing & Growth",
    description: "Sponsorship fee for Base Camp Hackathon - Purple Track.",
    proposalId: "PROP-41",
    status: "Completed",
    riskScore: "Low",
    tags: ["Sponsorship", "Hackathon"]
  },
  {
    id: "tx-p3",
    daoId: "purple-dao",
    hash: "0xc8d662b...38da",
    timestamp: "2026-06-05T09:12:00Z",
    recipient: "0x882aef...119d",
    amountETH: 0,
    amountUSD: 8500,
    tokenSymbol: "USDC",
    category: "Security Audit",
    description: "Critical vulnerability scan completed by Sherlock auditor pool.",
    proposalId: "PROP-39",
    status: "Completed",
    riskScore: "Low",
    tags: ["Auditing", "Sherlock"]
  },

  // Based Nouns
  {
    id: "tx-n1",
    daoId: "based-nouns",
    hash: "0x1102ba9...23db",
    timestamp: "2026-06-12T10:15:30Z",
    recipient: "0x3344ae...77cc",
    amountETH: 15,
    amountUSD: 48000,
    tokenSymbol: "ETH",
    category: "Marketing & Growth",
    description: "Billboard advertisement campaign across 5 prominent Layer-2 communities.",
    proposalId: "B-PROP-98",
    status: "Completed",
    riskScore: "Medium",
    tags: ["Meme", "Ad"]
  },
  {
    id: "tx-n2",
    daoId: "based-nouns",
    hash: "0x39dcff8...23df",
    timestamp: "2026-06-11T08:24:00Z",
    recipient: "0x8833ff...abcc",
    amountETH: 0,
    amountUSD: 20000,
    tokenSymbol: "AERO",
    category: "Liquidity Provision",
    description: "Seed Aerodrome v3 Pool with Nouns-AERO rewards.",
    proposalId: "B-PROP-97",
    status: "Completed",
    riskScore: "Low",
    tags: ["Aerodrome", "Liquidity"]
  },

  // Base Builders
  {
    id: "tx-b1",
    daoId: "base-builders",
    hash: "0x99abcc1...eaab",
    timestamp: "2026-06-13T16:50:00Z",
    recipient: "0xbc33ff...dc22",
    amountETH: 10,
    amountUSD: 32000,
    tokenSymbol: "ETH",
    category: "Developer Grant",
    description: "Seed funding for Base Gas Optimizers developer toolkit release.",
    proposalId: "BB-PROP-72",
    status: "Completed",
    riskScore: "Low",
    tags: ["Dev-Tools", "Gas-Save"]
  },

  // Aerodrome Finance
  {
    id: "tx-aero1",
    daoId: "aerodrome",
    hash: "0xe726bad...d902",
    timestamp: "2026-06-14T11:20:00Z",
    recipient: "0x992bfe...9923",
    amountETH: 0,
    amountUSD: 150000,
    tokenSymbol: "AERO",
    category: "Liquidity Provision",
    description: "Dynamic veAERO gauge emission booster locking cycle.",
    proposalId: "AERO-92",
    status: "Completed",
    riskScore: "Low",
    tags: ["Locked-veAERO", "Gauges"]
  },
  {
    id: "tx-aero2",
    daoId: "aerodrome",
    hash: "0x673bab8...e2b1",
    timestamp: "2026-06-12T09:40:00Z",
    recipient: "0x12aeff...33bc",
    amountETH: 0,
    amountUSD: 45000,
    tokenSymbol: "USDC",
    category: "Security Audit",
    description: "Immunefi whitehat bug bounty payout reward.",
    proposalId: "AERO-91",
    status: "Completed",
    riskScore: "Low",
    tags: ["Bounty", "Whitehat"]
  },

  // Virtuals Protocol
  {
    id: "tx-virt1",
    daoId: "virtuals",
    hash: "0xee612ba...33ff",
    timestamp: "2026-06-14T15:30:00Z",
    recipient: "0xbc33ff...dc22",
    amountETH: 8.5,
    amountUSD: 27200,
    tokenSymbol: "ETH",
    category: "Developer Grant",
    description: "Funding for LLM training datasets targeting Virtual RPG agent hosts.",
    proposalId: "VIRT-08",
    status: "Completed",
    riskScore: "Low",
    tags: ["AI", "Agents", "RPG"]
  },

  // Base Paint
  {
    id: "tx-paint1",
    daoId: "basepaint",
    hash: "0x28ba9cd...f39a",
    timestamp: "2026-06-13T22:15:00Z",
    recipient: "0xbe32ad...2390",
    amountETH: 3.2,
    amountUSD: 10240,
    tokenSymbol: "ETH",
    category: "Developer Grant",
    description: "Artist consensus engine optimization and palette expansion upgrade.",
    proposalId: "PAINT-01",
    status: "Completed",
    riskScore: "Low",
    tags: ["Consensus", "Canvas"]
  }
];

export const CATEGORY_COLORS: Record<string, string> = {
  "Developer Grant": "emerald",
  "Marketing & Growth": "indigo",
  "Liquidity Provision": "cyan",
  "Security Audit": "rose",
  "Core Contributors": "amber",
  "Operations & Legal": "violet",
  "Uncategorized": "slate text-gray-400"
};
