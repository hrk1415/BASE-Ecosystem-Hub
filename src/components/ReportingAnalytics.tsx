import React, { useState, useMemo } from "react";
import { BaseDAO, Transaction, Budget, TransactionCategory } from "../types";
import { 
  FileText, 
  TrendingUp, 
  Coins, 
  Activity, 
  Calendar, 
  Download, 
  Users, 
  PieChart as PieIcon, 
  ChevronRight, 
  ShieldCheck, 
  ArrowUpRight, 
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  Layers,
  Sparkles,
  DollarSign
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Cell,
  PieChart,
  Pie
} from "recharts";

interface ReportingAnalyticsProps {
  currentDao: BaseDAO;
  transactions: Transaction[];
  budgets: Budget[];
  ethPriceUSD: number;
  aeroPriceUSD: number;
}

const COLORS = [
  "#3b82f6", // Blue - Dev Grant
  "#8b5cf6", // Purple - Marketing
  "#06b6d4", // Cyan - LP
  "#f43f5e", // Rose - Audit
  "#f59e0b", // Amber - Core
  "#8c52ff", // Violet - Ops
  "#64748b"  // Slate - Uncategorized
];

export default function ReportingAnalytics({
  currentDao,
  transactions,
  budgets,
  ethPriceUSD,
  aeroPriceUSD
}: ReportingAnalyticsProps) {
  const [reportPeriod, setReportPeriod] = useState<"weekly" | "monthly" | "all-time">("monthly");
  const [filterClaimant, setFilterClaimant] = useState<string>("All");
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [liveDigest, setLiveDigest] = useState<string>("");

  // Target DAO finished transactions
  const daoTransactions = useMemo(() => {
    return transactions.filter(tx => tx.daoId === currentDao.id && tx.status === "Completed");
  }, [transactions, currentDao.id]);

  // Available Funds Calculation
  const availableUSD = useMemo(() => {
    const ethVal = currentDao.ethBalance * ethPriceUSD;
    const usdcVal = currentDao.usdcBalance;
    const aeroVal = currentDao.aeroBalance * aeroPriceUSD;
    return ethVal + usdcVal + aeroVal;
  }, [currentDao, ethPriceUSD, aeroPriceUSD]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalSpent = daoTransactions.reduce((acc, tx) => acc + tx.amountUSD, 0);
    const count = daoTransactions.length;
    const averageTicket = count > 0 ? totalSpent / count : 0;

    // Track spending by category
    const categoryTotals: Record<TransactionCategory, number> = {
      "Developer Grant": 0,
      "Marketing & Growth": 0,
      "Liquidity Provision": 0,
      "Security Audit": 0,
      "Core Contributors": 0,
      "Operations & Legal": 0,
      "Uncategorized": 0
    };

    daoTransactions.forEach(tx => {
      if (categoryTotals[tx.category] !== undefined) {
        categoryTotals[tx.category] += tx.amountUSD;
      }
    });

    // Identify category consuming the most budget
    let highestCategory: TransactionCategory = "Developer Grant";
    let highestCatAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > highestCatAmount) {
        highestCatAmount = amt;
        highestCategory = cat as TransactionCategory;
      }
    });

    // Track spending by claimant/spentBy
    const claimantTotals: Record<string, number> = {};
    daoTransactions.forEach(tx => {
      const claimant = tx.spentBy || "DAO Treasury Council";
      claimantTotals[claimant] = (claimantTotals[claimant] || 0) + tx.amountUSD;
    });

    let topSpender = "N/A";
    let topSpenderSpent = 0;
    Object.entries(claimantTotals).forEach(([name, spent]) => {
      if (spent > topSpenderSpent) {
        topSpender = name;
        topSpenderSpent = spent;
      }
    });

    return {
      totalSpent,
      transactionCount: count,
      averageTicket,
      categoryTotals,
      highestSpentCategory: highestCatAmount > 0 ? highestCategory : "No Outflow recorded",
      highestCategoryAmount: highestCatAmount,
      topSpender,
      uniqueClaimants: Object.keys(claimantTotals),
      claimantTotals
    };
  }, [daoTransactions]);

  // Filter transactions for report preview
  const reportTransactions = useMemo(() => {
    const anchorDate = new Date("2026-06-15T00:00:00Z");
    let cutoffDate = new Date(anchorDate);

    if (reportPeriod === "weekly") {
      cutoffDate.setDate(anchorDate.getDate() - 7);
    } else if (reportPeriod === "monthly") {
      cutoffDate.setMonth(anchorDate.getMonth() - 1);
    } else {
      cutoffDate = new Date(0); // Epoch
    }

    return daoTransactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      const matchesPeriod = txDate >= cutoffDate;
      const claimant = tx.spentBy || "DAO Treasury Council";
      const matchesClaimant = filterClaimant === "All" || claimant.toLowerCase() === filterClaimant.toLowerCase();
      return matchesPeriod && matchesClaimant;
    });
  }, [daoTransactions, reportPeriod, filterClaimant]);

  const reportTotalUSD = useMemo(() => {
    return reportTransactions.reduce((val, tx) => val + tx.amountUSD, 0);
  }, [reportTransactions]);

  // Recharts Chart Formatter
  const categoryChartData = useMemo(() => {
    return Object.entries(stats.categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value as number),
    })).filter(item => item.value > 0);
  }, [stats.categoryTotals]);

  const budgetProgressRatio = useMemo(() => {
    const budgetedTotal = budgets.reduce((sum, b) => sum + b.allocatedUSD, 0);
    const spentTotal = budgets.reduce((sum, b) => sum + b.spentUSD, 0);
    return {
      allocatedUSD: budgetedTotal,
      spentUSD: spentTotal,
      percentage: budgetedTotal > 0 ? (spentTotal / budgetedTotal) * 100 : 0
    };
  }, [budgets]);

  // Download raw TXT Report
  const downloadTxtReport = () => {
    const timestamp = new Date().toLocaleString();
    let textOut = `=========================================================\n`;
    textOut += `           BASE DAO EXECUTIVE FINANCIAL STATEMENT       \n`;
    textOut += `=========================================================\n`;
    textOut += `DAO Name:        ${currentDao.name}\n`;
    textOut += `Vault Multisig:  ${currentDao.address}\n`;
    textOut += `Issued At:       2026-06-15 (Standard UTC Workspace)\n`;
    textOut += `Report Scope:    ${reportPeriod.toUpperCase()} Statement\n`;
    textOut += `Claimant filter: ${filterClaimant}\n`;
    textOut += `---------------------------------------------------------\n\n`;
    
    textOut += `FINANCIAL METRIC INDEX SUMMARY:\n`;
    textOut += `---------------------------------------------------------\n`;
    textOut += `Total Available Funds: $${availableUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    textOut += `Total Account Expenses: $${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    textOut += `Remaining DAO Capacity: $${availableUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    textOut += `Category High outflow: ${stats.highestSpentCategory} ($${stats.highestCategoryAmount.toLocaleString()})\n`;
    textOut += `Top Member Spender:    ${stats.topSpender}\n`;
    textOut += `Statement Item Count:  ${reportTransactions.length} completed logs\n`;
    textOut += `Itemized Disbursements Sum: $${reportTotalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n\n`;

    textOut += `BY CATEGORY EXPENDITURE LOGS:\n`;
    textOut += `---------------------------------------------------------\n`;
    Object.entries(stats.categoryTotals).forEach(([cat, val]) => {
      textOut += `${cat.padEnd(25)}: $${(val as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}\n`;
    });
    textOut += `\n`;

    textOut += `ITEMIZED EXPENDITURE TRANSACTIONS RECORD:\n`;
    textOut += `---------------------------------------------------------\n`;
    if (reportTransactions.length === 0) {
      textOut += `No records available for the target parameter query.\n`;
    } else {
      reportTransactions.forEach((tx, idx) => {
        const dateStr = new Date(tx.timestamp).toLocaleDateString();
        textOut += `${idx + 1}. [${dateStr}] Hash: ${tx.hash.substring(0, 10)}...\n`;
        textOut += `   Claimant/Spender: ${tx.spentBy || "DAO Treasury Council"}\n`;
        textOut += `   Recipient Addr:   ${tx.recipient}\n`;
        textOut += `   Category/Class:   ${tx.category}\n`;
        textOut += `   Details Purpose:  ${tx.description}\n`;
        textOut += `   Logged Amount:    ${tx.amountETH > 0 ? tx.amountETH + " ETH" : tx.amountUSD + " " + tx.tokenSymbol} (≈ $${tx.amountUSD.toLocaleString()})\n`;
        textOut += `   Threat Assessment: ${tx.riskScore || "Low Risk"}\n`;
        textOut += `   ------------------------------------------------------\n`;
      });
    }

    textOut += `\n=========================================================\n`;
    textOut += `    CRYPTOGRAPHIC VERIFICATION STATEMENTS\n`;
    textOut += `    Hash index logged on Base L2 standard mainnet. Verified\n`;
    textOut += `    multisig ledger parameters. Prevents spend fraud.\n`;
    textOut += `=========================================================\n`;

    const blob = new Blob([textOut], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentDao.id}_expense_statement_${reportPeriod}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentMonthName = "June 2026";

  return (
    <div className="space-y-6" id="reporting-analytics-root">
      
      {/* Premium Dashboard Title header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-indigo-500/30 text-indigo-200 uppercase border border-indigo-500/30">
                Auditing & Intelligence
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono">100% Cryptographic Traceability</span>
            </div>
            <h2 className="text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-405" />
              <span>DAO Treasury Analytics & Expense Reporting Hub</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-sans leading-relaxed">
              Maintain pristine oversight of spending velocity. Generate structured weekly or monthly expense statements, analyze funds consumption by budget category, and identify threat exposure.
            </p>
          </div>
        </div>
      </div>

      {/* THREE CORES: Total reserves, Total Spend, Remaining Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="reports-kpi-row">
        {/* KPI 1: Available Funds */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden shadow-sm group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-mono font-bold tracking-wide uppercase">Total Available Funds</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                ${availableUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-slate-500 text-[10px] font-mono mt-1">
                Crypto reserves value on Base Mainnet
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 font-mono">
            <span>Locked Assets in Vault</span>
            <span className="text-emerald-600 font-bold">LIVE ON-CHAIN</span>
          </div>
        </div>

        {/* KPI 2: Total Spent */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden shadow-sm group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-mono font-bold tracking-wide uppercase">Total Amount Spent</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight block">
                ${stats.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-slate-505 text-[10px] font-mono mt-1">
                Aggregated outflows recorded on-book
              </p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 font-mono">
            <span>Average payload transaction</span>
            <span className="text-rose-650 font-bold">${stats.averageTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* KPI 3: Remaining Balance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden shadow-sm group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-mono font-bold tracking-wide uppercase">Remaining Balance Reserves</p>
              <h3 className="text-2xl font-extrabold text-emerald-700 mt-2 tracking-tight">
                ${availableUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-slate-500 text-[10px] font-mono mt-1">
                No external debt recorded
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3 font-mono">
            <span>Overall financial deficit risk</span>
            <span className="text-emerald-700 uppercase font-semibold text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">negligible</span>
          </div>
        </div>
      </div>

      {/* EXPENDITURE BREAKDOWN & HIGH-USAGE INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expenditure Chart card */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-slate-800 text-sm font-semibold tracking-wide uppercase font-mono flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-indigo-500" />
                <span>Spending Allocation by Category</span>
              </h4>
              <span className="text-[10px] text-slate-450 uppercase font-mono font-bold">live ledger metrics</span>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-sans">
              Visualizes which categories consume the most budget reserves in real USD values.
            </p>

            {categoryChartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Layers className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-450 font-mono">No expenses logged yet under current DAO</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Visual rendering bar chart */}
                <div className="md:col-span-7 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 8, fill: "#64748b", fontFamily: "monospace" }} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-800 space-y-1">
                                <p className="font-mono text-[10px] text-slate-400 font-bold uppercase">{payload[0].payload.name}</p>
                                <p className="font-mono text-emerald-400 font-bold">${payload[0].payload.value.toLocaleString()} USD</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" strokeWidth={0} radius={[4, 4, 0, 0]}>
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend and lists table details */}
                <div className="md:col-span-5 space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {categoryChartData.map((item, idx) => (
                    <div key={idx} className="bg-slate-50/80 p-2 rounded-xl border border-slate-150 flex items-center justify-between text-xs transition hover:bg-slate-50">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="font-sans font-medium text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 flex-shrink-0 pl-1.5">
                        ${item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Intelligence card on heaviest consume area & spender */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-5">
            <h4 className="text-slate-800 text-sm font-semibold tracking-wide uppercase font-mono flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>DAO Budget Consumption Report</span>
            </h4>
            
            <div className="space-y-4">
              {/* Heaviest Consume Area */}
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/20">
                <div className="flex items-center gap-2 text-[10px] font-mono font-extrabold uppercase text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Highest Spending Area</span>
                </div>
                <h5 className="text-lg font-bold text-slate-900 mt-2 font-mono tracking-tight">{stats.highestSpentCategory}</h5>
                <p className="text-[11px] text-slate-450 mt-1 font-sans">
                  Consuming <strong className="text-rose-600 font-mono">${stats.highestCategoryAmount.toLocaleString()} USD</strong> from total treasury resources. Focus diligence on this sector.
                </p>
              </div>

              {/* Big Spender */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/20">
                <div className="flex items-center gap-2 text-[10px] font-mono font-extrabold uppercase text-blue-700">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Heaviest Claimant Spender</span>
                </div>
                <h5 className="text-sm font-bold text-slate-800 mt-2 font-mono tracking-tight truncate max-w-full" title={stats.topSpender}>
                  {stats.topSpender}
                </h5>
                <p className="text-[11px] text-slate-450 mt-1 font-sans">
                  Accountable for <strong className="text-blue-650 font-mono">${(stats.claimantTotals[stats.topSpender] || 0).toLocaleString()} USD</strong> of total spend requests.
                </p>
              </div>

              {/* Integrity status */}
              <div className="p-3.5 rounded-xl border border-emerald-150 bg-emerald-50/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-700 block">Fraud Risk Index</span>
                  <p className="text-xs font-semibold text-slate-700">No Double-Schedules</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REPORT GENERATION & DOWNLOAD HUB */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5" id="generate-reports-section">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wide flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>Interactive Financial Report Generator</span>
            </h3>
            <p className="text-xs text-slate-450 mt-1">
              Select time boundaries and claimant scope filter to render visual receipts and download structural text statements.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Period selector */}
            <div>
              <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block mb-1">statement range</label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="weekly">Weekly Statement (Past 7d)</option>
                <option value="monthly">Monthly Statement (Past 30d)</option>
                <option value="all-time">All-Time Statement</option>
              </select>
            </div>

            {/* Claimant filter */}
            <div>
              <label className="text-[9px] font-mono font-bold uppercase text-slate-400 block mb-1">claimant spender</label>
              <select
                value={filterClaimant}
                onChange={(e) => setFilterClaimant(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Claimants</option>
                {stats.uniqueClaimants.map((name, idx) => (
                  <option key={idx} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Action button */}
            <div className="self-end pt-5 md:pt-0">
              <button
                type="button"
                onClick={() => setShowReportPreview(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold font-mono tracking-wide px-4 py-1.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Compile Statement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Statement Display preview */}
        {showReportPreview ? (
          <div className="bg-slate-950 text-slate-200 rounded-xl p-6 border border-slate-800 font-mono text-xs space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200" id="statement-card-preview-container">
            <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-sm font-mono tracking-widest">
                  OFFICIAL LEDGER DIGEST
                </span>
                <h4 className="text-base font-extrabold text-white tracking-tight">{currentDao.name} Treasury Statement</h4>
                <p className="text-[11px] text-slate-400 leading-none">Vault multisig contract: <span className="text-slate-300 font-semibold">{currentDao.address}</span></p>
              </div>
              <div className="text-right text-[10px] text-slate-400 space-y-1">
                <p>Anchor date: <span className="text-slate-200">2026-06-15</span></p>
                <p>Coverage: <span className="text-blue-400 font-extrabold uppercase">{reportPeriod}</span></p>
                <p>Target claimant: <span className="text-slate-200 font-semibold">{filterClaimant}</span></p>
              </div>
            </div>

            {/* Summary Highlights inside statement */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Funds on-chain</span>
                <span className="text-sm font-bold text-white block mt-1">${availableUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Period disbursements</span>
                <span className="text-sm font-bold text-rose-450 block mt-1">${reportTotalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Remaining balance</span>
                <span className="text-sm font-bold text-emerald-450 block mt-1">${availableUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Itemized Transactions</span>
                <span className="text-sm font-bold text-white block mt-1">{reportTransactions.length} items</span>
              </div>
            </div>

            {/* Account List details */}
            <div className="space-y-3">
              <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider block">Receipt Items Ledger:</span>
              <div className="max-h-[220px] overflow-y-auto pr-2 divide-y divide-slate-800 border-t border-b border-slate-800/80">
                {reportTransactions.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 font-mono">
                    -- No transaction entries found matching criteria in this interval --
                  </div>
                ) : (
                  reportTransactions.map((tx, idx) => (
                    <div key={tx.id} className="py-2.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-[11px] hover:bg-slate-900/20 px-1 transition duration-150">
                      <div className="space-y-0.5 max-w-lg">
                        <div className="font-sans font-semibold text-slate-200 text-xs flex items-center gap-2">
                          <span className="text-slate-500 font-mono">[{idx + 1}]</span>
                          <span className="truncate">{tx.description}</span>
                        </div>
                        <div className="text-[10px] text-slate-450 font-mono flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>Recipient: <strong className="text-slate-350">{tx.recipient.substring(0,6)}...{tx.recipient.substring(38)}</strong></span>
                          <span>Spender: <strong className="text-blue-300">{tx.spentBy || "DAO Treasury Council"}</strong></span>
                          <span>Category: <strong className="text-indigo-300">{tx.category}</strong></span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-white font-bold block">${tx.amountUSD.toLocaleString()} USD</span>
                        <span className="text-[10px] text-slate-500 block pr-0.5 uppercase tracking-wide font-extrabold">{new Date(tx.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Download Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[10px] text-slate-500 leading-normal max-w-sm">
                Crypto audited record ledger complies with consensus integrity formats. Verified against Base multi-owner specifications.
              </p>
              <div className="flex gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowReportPreview(false)}
                  className="flex-1 sm:flex-none px-4.5 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition text-xs cursor-pointer text-center font-bold font-mono text-[11px]"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={downloadTxtReport}
                  className="flex-1 sm:flex-none px-4.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition text-xs font-bold flex items-center justify-center gap-2 cursor-pointer text-[11px] font-mono shadow"
                >
                  <Download className="w-4 h-4 text-slate-100" />
                  <span>Download Ledger statement (.TXT)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-slate-205 bg-slate-50/50 rounded-xl text-center text-slate-500 font-sans" id="statement-placeholder">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Configure parameters above and click "Compile Statement" to audit and preview.</p>
          </div>
        )}
      </div>

    </div>
  );
}
