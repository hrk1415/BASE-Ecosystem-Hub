import React, { useState, useEffect } from "react";
import { BaseDAO, Transaction, TransactionCategory } from "../types";
import { CATEGORY_COLORS } from "../mockData";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  ExternalLink, 
  Calendar, 
  Wallet, 
  CheckCircle, 
  Tag, 
  RefreshCcw, 
  Copy, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle, 
  Globe, 
  Clock, 
  BookmarkCheck,
  Database,
  ArrowRightLeft,
  X,
  FileSpreadsheet,
  TrendingUp,
  BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from "recharts";
import { AnimatePresence, motion } from "motion/react";

interface TransactionPanelProps {
  currentDao: BaseDAO;
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, "id" | "timestamp" | "status">) => void;
  onUpdateTransactionTags: (txId: string, tags: string[]) => void;
  ethPriceUSD: number;
  aeroPriceUSD: number;
  connectedWalletAddress?: string | null;
}

const CATEGORY_LIST: TransactionCategory[] = [
  "Developer Grant",
  "Marketing & Growth",
  "Liquidity Provision",
  "Security Audit",
  "Core Contributors",
  "Operations & Legal",
  "Uncategorized",
];

// Well-known on-chain address label registry on Base
const KNOWN_LABELS: Record<string, string> = {
  "0xd8da6bf25964af9d7eed9e03e53415d37aa96045": "Vitalik.eth Wallet",
  "0x2626664c26028187bacd5100c913c54c5ee09c0f": "Uniswap Router (Base)",
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC Base Bridge Contract",
  "0x940181a94a35a4569e4529a3cdfb74e38fd98631": "AERO Token Contract",
};

// Hex validator
function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export default function TransactionPanel({
  currentDao,
  transactions,
  onAddTransaction,
  onUpdateTransactionTags,
  ethPriceUSD,
  aeroPriceUSD,
  connectedWalletAddress,
}: TransactionPanelProps) {
  // Navigation Tabs: "ledger" (Manual DAO records) or "crawler" (Live On-Chain Scanner)
  const [activeSubTab, setActiveSubTab] = useState<"ledger" | "crawler">("ledger");

  // Helper to look up text descriptors for hex addresses
  const getAddressLabel = (address: string): string => {
    if (!address) return "";
    const addrLower = address.toLowerCase();
    if (addrLower === currentDao.address.toLowerCase()) {
      return "DAO Treasury Vault";
    }
    if (connectedWalletAddress && addrLower === connectedWalletAddress.toLowerCase()) {
      return "My Connected Wallet";
    }
    const known = KNOWN_LABELS[addrLower];
    if (known) return known;
    return "";
  };

  // Filter states for manual ledger
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedToken, setSelectedToken] = useState<string>("All");
  const [chartStyle, setChartStyle] = useState<"fill" | "line">("fill");
  
  // Custom manual ledger entry creator states
  const [showAdder, setShowAdder] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"ETH" | "USDC" | "AERO">("ETH");
  const [category, setCategory] = useState<TransactionCategory>("Developer Grant");
  const [description, setDescription] = useState("");
  const [proposalId, setProposalId] = useState("");
  const [spentBy, setSpentBy] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Tag editing states
  const [activeEditTxId, setActiveEditTxId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState("");

  const handleAddTag = (txId: string, tag: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    const currentTags = tx.tags || [];
    if (!currentTags.includes(tag)) {
      onUpdateTransactionTags(txId, [...currentTags, tag]);
    }
    setActiveEditTxId(null);
    setNewTagInput("");
  };

  const handleRemoveTag = (txId: string, tagToRemove: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    const currentTags = tx.tags || [];
    onUpdateTransactionTags(
      txId,
      currentTags.filter((t) => t !== tagToRemove)
    );
  };

  // ==========================================
  // BASE MAINNET LIVE BLOCK EXPLORER STATES
  // ==========================================
  const [scanAddress, setScanAddress] = useState(currentDao.address);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [onchainBal, setOnchainBal] = useState<{ eth: number; usdc: number; aero: number } | null>(null);
  const [crawledTxns, setCrawledTxns] = useState<any[]>([]);
  const [scannedAddressMeta, setScannedAddressMeta] = useState<string>("");
  const [scannerSearchQuery, setScannerSearchQuery] = useState("");
  const [scannerCategory, setScannerCategory] = useState<string>("All");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Sync state if current DAO changes
  useEffect(() => {
    setScanAddress(currentDao.address);
  }, [currentDao]);

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Mainnet execution crawler
  const handleCrawlBaseMainnet = async (targetAddr?: string) => {
    const addrToCrawl = targetAddr || scanAddress;
    setScanError("");
    
    if (!isValidAddress(addrToCrawl)) {
      setScanError("Please enter a valid 42-character recipient hexadecimal address starting with 0x.");
      return;
    }

    setIsScanning(true);
    setOnchainBal(null);
    setCrawledTxns([]);

    try {
      // 1. Fetch balances
      const balRes = await fetch(`/api/onchain-balances?address=${addrToCrawl}`);
      if (balRes.ok) {
        const balData = await balRes.json();
        setOnchainBal({
          eth: balData.ethBalance || 0,
          usdc: balData.usdcBalance || 0,
          aero: balData.aeroBalance || 0
        });
      }

      // 2. Fetch real mainnet transactions
      const txRes = await fetch(`/api/address-transactions?address=${addrToCrawl}`);
      if (!txRes.ok) {
        throw new Error("Target address index lookup returned an error code.");
      }
      const txData = await txRes.json();
      if (txData.status === "Success" && Array.isArray(txData.transactions)) {
        setCrawledTxns(txData.transactions);
      } else {
        setCrawledTxns([]);
      }
      setScannedAddressMeta(addrToCrawl);
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || "Could not successfully connect to public indexer.");
    } finally {
      setIsScanning(false);
    }
  };

  // Direct population helper
  const recordCrawlerTxToLedger = (tx: any) => {
    // Fill record creator form
    // If scanning self, check if out or in
    const isOutflowStr = tx.from.toLowerCase() === scannedAddressMeta.toLowerCase();
    const targetedRecipient = isOutflowStr ? tx.to : tx.from;
    
    setRecipient(targetedRecipient);
    setAmount(tx.valueETH.toString());
    setToken("ETH");
    setDescription(`On-chain transaction scanned from Base Mainnet. Block: ${tx.blockNumber}. Method: ${tx.methodName}. (Scanned transaction Hash: ${tx.hash})`);
    
    // Open standard form
    setShowAdder(true);
    setActiveSubTab("ledger");
    
    // Scroll smoothly to form view
    setTimeout(() => {
      document.getElementById("manually-log-expense-form")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Filtered manual transactions list
  const filteredTxs = transactions
    .filter((tx) => tx.daoId === currentDao.id)
    .filter((tx) => {
      const addrLabel = getAddressLabel(tx.recipient);
      const matchSearch =
        tx.recipient.toLowerCase().includes(search.toLowerCase()) ||
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        addrLabel.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        (tx.proposalId || "").toLowerCase().includes(search.toLowerCase()) ||
        (tx.tags || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = selectedCategory === "All" || tx.category === selectedCategory;
      const matchToken = selectedToken === "All" || tx.tokenSymbol === selectedToken;
      return matchSearch && matchCategory && matchToken;
    });

  // Generate last 30 days of spend trend data relative to June 15, 2026 local time
  const dailyTrendData = React.useMemo(() => {
    const data = [];
    const anchorDate = new Date("2026-06-15T00:00:00Z");
    
    // Filter transactions to only those of the current DAO that are completed
    const daoTxs = transactions.filter(
      (tx) => tx.daoId === currentDao.id && tx.status === "Completed"
    );

    for (let i = 29; i >= 0; i--) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
      
      const dayTxs = daoTxs.filter((tx) => {
        const txDate = tx.timestamp.split("T")[0];
        return txDate === dateStr;
      });

      const totalUSD = dayTxs.reduce((sum, tx) => sum + tx.amountUSD, 0);
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

      data.push({
        date: dateStr,
        label,
        spend: Number(totalUSD.toFixed(1)),
        count: dayTxs.length,
        txs: dayTxs,
      });
    }
    return data;
  }, [transactions, currentDao.id]);

  const total30DaySpend = React.useMemo(() => {
    return dailyTrendData.reduce((sum, day) => sum + day.spend, 0);
  }, [dailyTrendData]);

  const peakSpendVal = React.useMemo(() => {
    const values = dailyTrendData.map((d) => d.spend);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [dailyTrendData]);

  const averageDailySpend = React.useMemo(() => {
    return total30DaySpend / 30;
  }, [total30DaySpend]);

  // Filtered crawled transactions list
  const filteredCrawledTxns = crawledTxns.filter((tx) => {
    // 1. Search filter by address or label
    const q = scannerSearchQuery.toLowerCase().trim();
    const fromLabel = getAddressLabel(tx.from);
    const toLabel = getAddressLabel(tx.to);
    
    const matchesSearch = !q || (
      tx.hash.toLowerCase().includes(q) ||
      tx.from.toLowerCase().includes(q) ||
      tx.to.toLowerCase().includes(q) ||
      fromLabel.toLowerCase().includes(q) ||
      toLabel.toLowerCase().includes(q) ||
      (tx.methodName || "Transaction").toLowerCase().includes(q) ||
      tx.blockNumber.toString().includes(q)
    );

    // 2. Category / Method filter
    const methodLower = (tx.methodName || "Transaction").toLowerCase();
    let matchesCategory = true;
    if (scannerCategory !== "All") {
      if (scannerCategory === "Transfer") {
        matchesCategory = methodLower.includes("transfer");
      } else if (scannerCategory === "Approve") {
        matchesCategory = methodLower.includes("approve");
      } else if (scannerCategory === "Swap") {
        matchesCategory = methodLower.includes("swap") || methodLower.includes("execute") || methodLower.includes("multicall");
      } else if (scannerCategory === "Other") {
        matchesCategory = !methodLower.includes("transfer") && !methodLower.includes("approve") && !methodLower.includes("swap") && !methodLower.includes("execute") && !methodLower.includes("multicall");
      }
    }

    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      setErrorMsg("Valid Base checksum hex addresses must start with 0x and contain 42 characters.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please provide a valid numeric value greater than zero.");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please explain the transaction context.");
      return;
    }

    // Compute estimated USD translation value
    let computedUSD = parsedAmount;
    if (token === "ETH") computedUSD = parsedAmount * ethPriceUSD;
    if (token === "AERO") computedUSD = parsedAmount * aeroPriceUSD;

    onAddTransaction({
      daoId: currentDao.id,
      hash: "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...f6" + Math.floor(Math.random() * 9 + 1) + "b",
      recipient,
      amountETH: token === "ETH" ? parsedAmount : 0,
      amountUSD: Number(computedUSD.toFixed(2)),
      tokenSymbol: token,
      category,
      description,
      proposalId: proposalId.trim() || undefined,
      spentBy: spentBy.trim() || "DAO Treasury Council",
      occurredAt: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
    });

    // Reset Form
    setRecipient("");
    setAmount("");
    setDescription("");
    setProposalId("");
    setSpentBy("");
    setOccurredAt("");
    setShowAdder(false);
  };

  return (
    <div className="space-y-6" id="transaction-panel-container">
      {/* High Craft Header of the Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-955 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white shadow-lg relative overflow-hidden animate-fade-in" id="transactions-dashboard-header">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-indigo-500/20 text-indigo-300 uppercase border border-indigo-500/30">
                Ledger & Explorer
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono">Base RPC Live Connection</span>
            </div>
            <h2 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
              <span>Base Mainnet Transactions Portal</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans leading-relaxed">
              Verify transactions of either your local DAO book or fetch any random wallet's live on-chain transactional flows from the Base public indexer.
            </p>
          </div>

          {/* Sub Navigation Switch */}
          <div className="flex bg-slate-800/80 p-1 border border-slate-700 rounded-xl" id="sub-panel-navigation">
            <button
              onClick={() => setActiveSubTab("ledger")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition cursor-pointer ${
                activeSubTab === "ledger" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-300 hover:text-white hover:bg-slate-705/50"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>DAO Ledger Book</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab("crawler");
                if (crawledTxns.length === 0) {
                  handleCrawlBaseMainnet(currentDao.address);
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition cursor-pointer ${
                activeSubTab === "crawler" 
                  ? "bg-blue-600 text-white shadow" 
                  : "text-slate-300 hover:text-white hover:bg-slate-705/50"
              }`}
            >
              <Globe className="w-3.5 h-3.5 animate-pulse text-emerald-450" />
              <span>On-Chain Crawler</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === "ledger" ? (
        // ==========================================
        // SUB-VIEW 1: MANUAL DAO LEDGER VIEW
        // ==========================================
        <div className="space-y-6">
          {/* 30-Day Daily Spend trend visualization */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4" id="dao-spend-trend-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span>30-Day Daily Treasury Spend Trend ({currentDao.name})</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Live moving tracking index of daily total USD outflow from treasury reserves (completed ledger entries).
                </p>
              </div>

              {/* Chart Visual Toggle controls */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setChartStyle("fill")}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                    chartStyle === "fill" ? "bg-white text-indigo-650 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Area Glow
                </button>
                <button
                  type="button"
                  onClick={() => setChartStyle("line")}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                    chartStyle === "line" ? "bg-white text-indigo-650 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sleek Line
                </button>
              </div>
            </div>

            {/* Quick KPI stats sub-grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">30d Total Outflow</span>
                  <div className="text-sm font-bold font-mono text-slate-850 mt-1">${total30DaySpend.toLocaleString(undefined, { minimumFractionDigits: 1 })}</div>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Peak Daily Spend</span>
                  <div className="text-sm font-bold font-mono text-indigo-600 mt-1">${peakSpendVal.toLocaleString(undefined, { minimumFractionDigits: 1 })}</div>
                </div>
                <span className="text-[9px] bg-indigo-50 text-indigo-600 font-mono px-1.5 py-0.5 rounded border border-indigo-100 font-bold">Max Day</span>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Avg Daily Spend</span>
                  <div className="text-sm font-bold font-mono text-slate-850 mt-1">${averageDailySpend.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono px-1.5 py-0.5 rounded border border-emerald-100 font-bold">Stable</span>
              </div>
            </div>

            {/* Recharts Render Area */}
            <div className="h-52 w-full pt-2" id="trendline-chart-stage">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentDao.id}-${chartStyle}`}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {chartStyle === "fill" ? (
                      <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="glowOutflow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="label" 
                          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-white text-xs max-w-xs space-y-1.5" id="chart-tooltip">
                                  <div className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">
                                    {data.label} (2026)
                                  </div>
                                  <div className="flex items-center justify-between gap-5 border-b border-slate-800 pb-1.5 mb-1.5">
                                    <span className="text-slate-300">Total Spend</span>
                                    <span className="font-mono text-emerald-400 font-bold">${data.spend.toLocaleString()}</span>
                                  </div>
                                  {data.count > 0 ? (
                                    <div className="space-y-1">
                                      <span className="text-[9px] text-indigo-300 font-semibold block uppercase tracking-wide">Ledger items:</span>
                                      <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                                        {data.txs.map((tx: any, idx: number) => (
                                          <div key={idx} className="bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] space-y-0.5">
                                            <div className="font-sans font-medium text-slate-200 truncate">{tx.description}</div>
                                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                                              <span className="px-1 bg-slate-800 rounded text-indigo-300 text-[8px]">{tx.category}</span>
                                              <span className="text-emerald-400 font-bold">${tx.amountUSD.toLocaleString()}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-mono block">No completed records on this day</span>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="spend" 
                          stroke="#4f46e5" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#glowOutflow)"
                          activeDot={{ r: 5, strokeWidth: 0, fill: "#4f46e5" }}
                          isAnimationActive={true}
                          animationDuration={600}
                          animationEasing="ease-out"
                        />
                      </AreaChart>
                    ) : (
                      <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="label" 
                          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg shadow-xl text-white text-xs max-w-xs space-y-1.5">
                                  <div className="text-[10px] text-slate-400 font-mono font-bold tracking-wider uppercase">
                                    {data.label} (2026)
                                  </div>
                                  <div className="flex items-center justify-between gap-5 border-b border-slate-800 pb-1.5 mb-1.5">
                                    <span className="text-slate-300">Total Spend</span>
                                    <span className="font-mono text-emerald-400 font-bold">${data.spend.toLocaleString()}</span>
                                  </div>
                                  {data.count > 0 ? (
                                    <div className="space-y-1">
                                      <span className="text-[9px] text-indigo-300 font-semibold block uppercase tracking-wide">Ledger items:</span>
                                      <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                                        {data.txs.map((tx: any, idx: number) => (
                                          <div key={idx} className="bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] space-y-0.5">
                                            <div className="font-sans font-medium text-slate-200 truncate">{tx.description}</div>
                                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                                              <span className="px-1 bg-slate-800 rounded text-indigo-300 text-[8px]">{tx.category}</span>
                                              <span className="text-emerald-400 font-bold">${tx.amountUSD.toLocaleString()}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-mono block">No completed records on this day</span>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="spend" 
                          stroke="#4f46e5" 
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 5, strokeWidth: 0, fill: "#4f46e5" }}
                          isAnimationActive={true}
                          animationDuration={600}
                          animationEasing="ease-out"
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Table Filters bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-sm" id="transactions-actions-bar">
            <div className="flex flex-wrap gap-3 items-center flex-1">
              {/* Search box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by recipient, log notes or proposals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 w-full focus:outline-none focus:border-blue-500 transition font-sans"
                />
              </div>

              {/* Category drop */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 font-sans cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {CATEGORY_LIST.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Token drop */}
              <div>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 font-sans cursor-pointer"
                >
                  <option value="All">All Assets</option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="AERO">AERO</option>
                </select>
              </div>
            </div>

            {/* Add payout toggle btn */}
            <button
              onClick={() => setShowAdder(!showAdder)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition duration-200 cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Spending</span>
            </button>
          </div>

          {/* Manual spending Logger form expansion */}
          {showAdder && (
            <form 
              onSubmit={handleAddSubmit}
              className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-4 animate-in fade-in slide-in-from-top-3 duration-200 text-slate-800"
              id="manually-log-expense-form"
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-semibold text-slate-800 font-mono tracking-wide uppercase">Manually Record DAO Outflow</h4>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-blue-650 bg-blue-50 px-2 py-0.5 rounded-full font-mono font-medium">Ledger Book Entry</span>
                  <button type="button" onClick={() => setShowAdder(false)} className="text-slate-400 hover:text-slate-655">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Base Address Recipient</label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-850 w-full focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Amount Outflow</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 1.5"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-850 w-full focus:outline-none focus:border-blue-500 font-mono pr-16"
                    />
                    <select
                      value={token}
                      onChange={(e) => setToken(e.target.value as any)}
                      className="absolute right-1 top-1 bg-slate-200 text-slate-700 border-none rounded p-1.5 text-xs focus:outline-none cursor-pointer font-mono font-semibold"
                    >
                      <option value="ETH">ETH</option>
                      <option value="USDC">USDC</option>
                      <option value="AERO">AERO</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Primary Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-850 w-full focus:outline-none focus:border-blue-500 font-sans cursor-pointer text-xs font-medium text-slate-755"
                  >
                    {CATEGORY_LIST.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Spent By / Claimant Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Core Dev team, or 0x63fe..."
                    value={spentBy}
                    onChange={(e) => setSpentBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-850 w-full focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">When Expense Occurred</label>
                  <input
                    type="datetime-local"
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-850 w-full focus:outline-none focus:border-blue-500 font-sans text-xs cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Disbursal Proposal ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. PROP-92"
                    value={proposalId}
                    onChange={(e) => setProposalId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-850 w-full focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono text-slate-700">Explanation & Allocation Notes</label>
                  <input
                    type="text"
                    required
                    placeholder="Describe why treasury disbursed these tokens..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-855 w-full focus:outline-none focus:border-blue-500 font-sans text-xs"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-mono pt-1">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdder(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-605 px-4 py-2 rounded-lg text-xs font-mono transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition cursor-pointer"
                >
                  Save to Register
                </button>
              </div>
            </form>
          )}

          {/* Main Transactions List layout */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm" id="transactions-log-list">
            <div className="border-b border-slate-200 p-5 flex items-center justify-between bg-slate-50/50">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 font-mono uppercase tracking-wide">Workspace Ledger Registry</h4>
                <p className="text-xs text-slate-500 mt-1">Showing tracked transactions entered into the book of accounts for {currentDao.name}.</p>
              </div>
              <span className="text-[10px] text-blue-750 bg-blue-50 border border-blue-250 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {filteredTxs.length} Record{filteredTxs.length !== 1 ? "s" : ""}
              </span>
            </div>

            {filteredTxs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-sans">
                <Wallet className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium pb-1">No tracked ledger records match the filters.</p>
                <button 
                  onClick={() => setShowAdder(true)}
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-semibold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Manually record first outflow transaction</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                      <th className="p-4">Transaction hash / Time</th>
                      <th className="p-4">Recipient</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Description Note</th>
                      <th className="p-4 text-right">Value (Asset / USD)</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTxs.map((tx) => {
                      let tokenStyle = "text-emerald-700 bg-emerald-50";
                      if (tx.tokenSymbol === "USDC") tokenStyle = "text-blue-700 bg-blue-50";
                      if (tx.tokenSymbol === "AERO") tokenStyle = "text-cyan-700 bg-cyan-50";

                      // Parse Category style
                      const catColorsMap: Record<string, { bg: string; text: string; border: string }> = {
                        "Developer Grant": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
                        "Marketing & Growth": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
                        "Liquidity Provision": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-100" },
                        "Security Audit": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
                        "Core Contributors": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100" },
                        "Operations & Legal": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
                        "Uncategorized": { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" }
                      };
                      
                      const styleCapsule = catColorsMap[tx.category] || { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" };
                      const categoryCapsuleClass = `px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono inline-block ${styleCapsule.bg} border ${styleCapsule.border} ${styleCapsule.text}`;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-all">
                          {/* Hash & Date */}
                          <td className="p-4">
                            <div className="flex flex-col space-y-1">
                              <a
                                href={`https://base.blockscout.com/tx/${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono font-semibold text-blue-600 hover:text-blue-800 transition flex items-center gap-1.5"
                              >
                                  <span>{tx.hash}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                              <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-1" title={tx.occurredAt ? "Expense occurrence date" : "Logged date"}>
                                <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                {new Date(tx.occurredAt || tx.timestamp).toLocaleString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Recipient */}
                          <td className="p-4 font-mono text-xs text-slate-600">
                            <div className="flex flex-col space-y-0.5">
                              <span title={tx.recipient} className="font-semibold text-slate-700">
                                {tx.recipient.substring(0, 6)}...{tx.recipient.substring(38)}
                              </span>
                              {getAddressLabel(tx.recipient) && (
                                <span className="text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-sans font-medium w-max max-w-[130px] truncate">
                                  {getAddressLabel(tx.recipient)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-4">
                            <span className={categoryCapsuleClass}>
                              {tx.category}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="p-4 max-w-[280px]">
                            <div className="space-y-1.5">
                              <p className="text-xs text-slate-650 font-sans leading-relaxed font-semibold">
                                {tx.description}
                              </p>
                              <div className="flex flex-wrap gap-1 items-center">
                                {tx.spentBy && (
                                  <span className="inline-flex items-center text-[9px] bg-blue-50 border border-blue-100 px-2 py-0.5 text-blue-750 font-sans rounded font-medium">
                                    Spender: {tx.spentBy}
                                  </span>
                                )}
                                {tx.proposalId && (
                                  <span className="inline-flex items-center text-[9px] bg-slate-100 border border-slate-200 px-2 py-0.5 text-slate-505 font-mono rounded font-medium">
                                    Proposal: {tx.proposalId}
                                  </span>
                                )}
                              </div>

                              {/* Custom Organization Tags */}
                              <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-slate-100/60 mt-1">
                                {(tx.tags || []).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSearch(tag);
                                    }}
                                    className="inline-flex items-center gap-1 text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-sans font-semibold cursor-pointer hover:bg-indigo-100 transition"
                                    title="Click to search/filter by this label"
                                  >
                                    <Tag className="w-2.5 h-2.5 text-indigo-500" />
                                    <span>{tag}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveTag(tx.id, tag);
                                      }}
                                      className="text-indigo-400 hover:text-rose-500 font-extrabold focus:outline-none ml-0.5 text-[10px] cursor-pointer"
                                      title="Remove label"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                                
                                {activeEditTxId === tx.id ? (
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      if (newTagInput.trim()) {
                                        handleAddTag(tx.id, newTagInput.trim());
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1"
                                  >
                                    <input
                                      type="text"
                                      placeholder="Label..."
                                      value={newTagInput}
                                      onChange={(e) => setNewTagInput(e.target.value)}
                                      className="text-[9px] px-1 bg-slate-50 border border-slate-250 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-slate-800 font-bold h-4 w-16"
                                      autoFocus
                                    />
                                    <button
                                      type="submit"
                                      className="text-[8px] bg-blue-600 text-white px-1.5 rounded hover:bg-blue-700 font-bold h-4 cursor-pointer"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveEditTxId(null);
                                        setNewTagInput("");
                                      }}
                                      className="text-[10px] text-slate-400 hover:text-slate-600 px-0.5 font-bold h-4 flex items-center cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </form>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveEditTxId(tx.id);
                                      setNewTagInput("");
                                    }}
                                    className="inline-flex items-center gap-1 text-[9px] text-[#0052FF] hover:bg-blue-50 px-1 py-0.5 rounded font-sans font-bold transition border border-dashed border-blue-200 cursor-pointer"
                                    title="Add customized labels to this transaction"
                                  >
                                    <Tag className="w-2.5 h-2.5" />
                                    <span>+ Label</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Value mapping */}
                          <td className="p-4 text-right">
                            <div className="flex flex-col space-y-0.5">
                              <span className="text-xs font-mono font-bold text-slate-800">
                                {tx.tokenSymbol === "ETH" 
                                  ? `${tx.amountETH.toFixed(2)} ETH` 
                                  : tx.tokenSymbol === "AERO"
                                  ? `${(tx.amountUSD / aeroPriceUSD).toLocaleString(undefined, { maximumFractionDigits: 0 })} AERO`
                                  : `${tx.amountUSD.toLocaleString()} USDC`
                                }
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ${tx.amountUSD.toLocaleString()} USD
                              </span>
                            </div>
                          </td>

                          {/* Status marker */}
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-100">
                                <CheckCircle className="w-2.5 h-2.5" />
                                <span>Reported</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ==========================================
        // SUB-VIEW 2: BASE MAINNET LIVE BLOCK EXPLORER CRAWLER
        // ==========================================
        <div className="space-y-6" id="onchain-crawler-module">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wide flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                <span>Base Mainnet Realtime Address Crawler</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Instruct the application to scan any valid on-chain Base address (externally owned wallets, multisig Gnosis vaults, smart contracts, grants). We retrieve current balances and the latest transaction history.
              </p>
            </div>

            {/* Scanning Form Control */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-650 font-mono uppercase tracking-wide">
                Target Wallet Address
              </label>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Wallet className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="0x... (Paste any Base address here)"
                    value={scanAddress}
                    onChange={(e) => setScanAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm font-mono p-2.5 pl-10 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                  />
                </div>
                
                <button
                  type="button"
                  disabled={isScanning}
                  onClick={() => handleCrawlBaseMainnet()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-mono font-semibold tracking-wider text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCcw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                  <span>{isScanning ? "CRAWLING BASE..." : "CRAWL BLOCKCHAIN"}</span>
                </button>
              </div>

              {/* Quick shortcuts */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-mono flex items-center mr-1">Quick Shortcuts:</span>
                
                <button
                  type="button"
                  onClick={() => {
                    setScanAddress(currentDao.address);
                    handleCrawlBaseMainnet(currentDao.address);
                  }}
                  className="bg-slate-105 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 transition font-semibold cursor-pointer"
                >
                  🏫 Current DAO Vault Address
                </button>

                {connectedWalletAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setScanAddress(connectedWalletAddress);
                      handleCrawlBaseMainnet(connectedWalletAddress);
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-1 rounded-lg border border-emerald-200 transition font-semibold flex items-center gap-1 cursor-pointer animate-in fade-in"
                  >
                    <span>🔌 Connected Wallet Address</span>
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    const testVitalik = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik address
                    setScanAddress(testVitalik);
                    handleCrawlBaseMainnet(testVitalik);
                  }}
                  className="bg-slate-105 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 transition font-semibold cursor-pointer"
                >
                  🚀 Vitalik.eth Wallet
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const testUniswapBaseSwapRouter = "0x2626664c26028187bacd5100c913c54c5ee09c0f"; // Uniswap router on Base
                    setScanAddress(testUniswapBaseSwapRouter);
                    handleCrawlBaseMainnet(testUniswapBaseSwapRouter);
                  }}
                  className="bg-slate-105 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 transition font-semibold cursor-pointer"
                >
                  🦄 Uniswap Router (Base)
                </button>
              </div>

              {scanError && (
                <div className="bg-rose-50 border border-rose-250 text-rose-800 text-xs p-3.5 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-1 font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>

            {/* Dynamic Results Header: shows only if queried */}
            {scannedAddressMeta && (
              <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                {/* Meta details bar */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono uppercase font-bold">
                      Scanned Account
                    </span>
                    <h4 className="text-sm font-mono text-slate-800 font-bold select-all mt-1 flex items-center gap-2">
                      <span>{scannedAddressMeta}</span>
                      <button 
                        onClick={() => copyToClipboard(scannedAddressMeta, "scanned-address-id")}
                        className="text-[10px] text-blue-650 hover:underline cursor-pointer lowercase"
                      >
                        {copiedIndex === "scanned-address-id" ? "copied!" : "copy"}
                      </button>
                    </h4>
                  </div>
                  
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400">Scan Timestamp</span>
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date().toLocaleTimeString()}</span>
                    </p>
                  </div>
                </div>

                {/* Scanned Balances Card */}
                {onchainBal ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* ETH */}
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 shadow-inner">
                      <div className="p-3 bg-indigo-55/30 text-indigo-700 rounded-xl border border-indigo-100 font-bold text-lg">
                        Ξ
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">ETH Balance</span>
                        <h5 className="text-sm font-mono font-bold text-slate-800 mt-0.5">
                          {onchainBal.eth.toFixed(4)} ETH
                        </h5>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ≈ ${(onchainBal.eth * ethPriceUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                        </p>
                      </div>
                    </div>

                    {/* USDC */}
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 shadow-inner">
                      <div className="p-3 bg-blue-55/30 text-blue-700 rounded-xl border border-blue-100 font-bold text-lg font-sans">
                        $
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium font-sans">USDC Balance</span>
                        <h5 className="text-sm font-mono font-bold text-slate-800 mt-0.5">
                          {onchainBal.usdc.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                        </h5>
                        <p className="text-[10px] text-slate-505 font-mono font-medium">
                          ≈ ${onchainBal.usdc.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                        </p>
                      </div>
                    </div>

                    {/* AERO */}
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3 shadow-inner">
                      <div className="p-3 bg-cyan-55/30 text-cyan-755 rounded-xl border border-cyan-100 font-bold text-lg">
                        🛩️
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-medium">AERO Balance</span>
                        <h5 className="text-sm font-mono font-bold text-slate-800 mt-0.5">
                          {onchainBal.aero.toLocaleString(undefined, { minimumFractionDigits: 2 })} AERO
                        </h5>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ≈ ${(onchainBal.aero * aeroPriceUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs text-slate-505 flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Loading current token balances on Base...</span>
                  </div>
                )}

                {/* Crawler Transaction History List */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wide">
                        Latest Base Block Transactions
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5 animate-pulse">
                        These are the actual live transactions executed by the scanned account from the blockchain ledger index.
                      </p>
                    </div>

                    {/* Transactions search & filter dropdown controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search address or method label..."
                          value={scannerSearchQuery}
                          onChange={(e) => setScannerSearchQuery(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs font-sans pl-8 pr-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 w-full"
                          id="crawler-search-input"
                        />
                      </div>

                      <div className="relative w-full sm:w-48">
                        <select
                          value={scannerCategory}
                          onChange={(e) => setScannerCategory(e.target.value)}
                          className="appearance-none bg-slate-50 border border-slate-200 text-xs font-sans px-3 py-2 pr-8 rounded-lg text-slate-705 focus:outline-none focus:border-indigo-500 w-full cursor-pointer"
                          id="crawler-category-select"
                        >
                          <option value="All">All Methods</option>
                          <option value="Transfer">Transfers (Transfer, mint)</option>
                          <option value="Approve">Approvals (Approve)</option>
                          <option value="Swap">DeFi Swaps (Swap, multicall)</option>
                          <option value="Other">Other Custom Calls</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {filteredCrawledTxns.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400 text-xs font-medium font-sans">
                      <BookmarkCheck className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                      <span>No transactions found or matching search query.</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm bg-white overflow-y-auto max-h-[480px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                            <th className="p-3">Method / Tx Hash</th>
                            <th className="p-3">Flow</th>
                            <th className="p-3">From / To Address</th>
                            <th className="p-3 text-right">Value (ETH)</th>
                            <th className="p-3 text-right">Gas Fees</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs select-none">
                          {filteredCrawledTxns.map((tx, idx) => {
                            const isOutBound = tx.from.toLowerCase() === scannedAddressMeta.toLowerCase();
                            
                            return (
                              <tr key={idx} className="hover:bg-slate-50/60 transition duration-150">
                                {/* Hash & Method */}
                                <td className="p-3 font-mono">
                                  <div className="flex flex-col space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                        tx.isError
                                          ? "text-red-700 bg-red-105"
                                          : "text-indigo-700 bg-indigo-50 border border-indigo-200"
                                      }`}>
                                        {tx.methodName || "Transaction"}
                                      </span>
                                      <span className="text-[10px] font-medium text-slate-400">
                                        Blk #{tx.blockNumber}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <a
                                        href={`https://base.blockscout.com/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-mono font-medium text-blue-600 hover:underline flex items-center gap-1"
                                        title={tx.hash}
                                      >
                                        <span>{tx.hash.substring(0, 10)}...{tx.hash.substring(56)}</span>
                                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                                      </a>
                                      <button 
                                        onClick={() => copyToClipboard(tx.hash, `crawled-hash-${idx}`)}
                                        className="text-[9px] text-slate-400 hover:text-slate-650"
                                      >
                                        {copiedIndex === `crawled-hash-${idx}` ? "✓" : "copy"}
                                      </button>
                                    </div>
                                  </div>
                                </td>

                                {/* Flow Direction */}
                                <td className="p-3">
                                  {isOutBound ? (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 whitespace-nowrap">
                                      <ArrowUpRight className="w-2.5 h-2.5 text-amber-600" />
                                      <span>OUTBOUND</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                                      <ArrowDownRight className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>INBOUND</span>
                                    </span>
                                  )}
                                </td>

                                {/* Address details */}
                                <td className="p-3 font-mono text-[11px] text-slate-650 min-w-[150px]">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-[10px]" title={tx.from}>
                                      <span className="text-slate-400 text-[9px] uppercase font-bold w-10 flex-shrink-0">From:</span>
                                      <span className={!isOutBound ? "font-bold text-slate-800" : "text-slate-600"}>
                                        {tx.from.substring(0, 8)}...{tx.from.substring(34)}
                                      </span>
                                      {getAddressLabel(tx.from) && (
                                        <span className="ml-1 text-[8px] bg-slate-100 border border-slate-200 text-slate-550 px-1 rounded truncate max-w-[80px]" title={getAddressLabel(tx.from)}>
                                          {getAddressLabel(tx.from)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px]" title={tx.to}>
                                      <span className="text-slate-400 text-[9px] uppercase font-bold w-10 flex-shrink-0">To:</span>
                                      <span className={isOutBound ? "font-bold text-slate-800" : "text-slate-600"}>
                                        {tx.to.substring(0, 8)}...{tx.to.substring(34)}
                                      </span>
                                      {getAddressLabel(tx.to) && (
                                        <span className="ml-1 text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-550 px-1 rounded truncate max-w-[80px]" title={getAddressLabel(tx.to)}>
                                          {getAddressLabel(tx.to)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Value in ETH & USD */}
                                <td className="p-3 text-right">
                                  <div className="flex flex-col space-y-0.5 font-mono text-[11px]">
                                    <span className="font-bold text-slate-800">
                                      {tx.valueETH > 0 ? `${tx.valueETH.toFixed(5)} ETH` : "0 ETH"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      ${(tx.valueETH * ethPriceUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </td>

                                {/* Gas information */}
                                <td className="p-3 text-right font-mono text-[10px] text-slate-500 whitespace-nowrap">
                                  <span>{tx.gasUsed.toLocaleString()} gas</span>
                                  <span className="block text-[9px] text-slate-400">@ {tx.gasPriceGwei} gwei</span>
                                </td>

                                {/* Shortcut addition btn */}
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => recordCrawlerTxToLedger(tx)}
                                    title="Pre-fill & record this blockchain transaction into DAO registry book"
                                    className="bg-slate-50 hover:bg-indigo-50 border border-slate-205 hover:border-indigo-305 text-slate-655 hover:text-indigo-705 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer font-sans whitespace-nowrap"
                                  >
                                    📋 Record Outflow
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
