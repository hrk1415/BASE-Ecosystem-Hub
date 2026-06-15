import React, { useState, useMemo } from "react";
import { BaseDAO, Budget, Transaction } from "../types";
import { Coins, Flame, ArrowUpRight, ShieldCheck, HelpCircle, RefreshCw, AlertTriangle, Activity, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface TreasuryOverviewProps {
  currentDao: BaseDAO;
  budgets: Budget[];
  transactions: Transaction[];
  ethPriceUSD: number;
  aeroPriceUSD: number;
  onRefreshOnChain: () => void;
  isRefreshingBalances: boolean;
}

export default function TreasuryOverview({
  currentDao,
  budgets,
  transactions,
  ethPriceUSD,
  aeroPriceUSD,
  onRefreshOnChain,
  isRefreshingBalances,
}: TreasuryOverviewProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Balances
  const ethValueUSD = currentDao.ethBalance * ethPriceUSD;
  const usdcValueUSD = currentDao.usdcBalance;
  const aeroValueUSD = currentDao.aeroBalance * aeroPriceUSD;
  const totalTreasuryUSD = ethValueUSD + usdcValueUSD + aeroValueUSD;

  // Budget calculations
  const totalAllocatedUSD = budgets.reduce((sum, b) => sum + b.allocatedUSD, 0);
  const totalSpentUSD = budgets.reduce((sum, b) => sum + b.spentUSD, 0);
  const budgetUtilizationRate = totalAllocatedUSD > 0 ? (totalSpentUSD / totalAllocatedUSD) * 100 : 0;

  // Asset allocations for Donut Chart
  const assets = [
    { name: "USDC (Stable)", value: usdcValueUSD, color: "#3b82f6", absolute: currentDao.usdcBalance, unit: "USDC" },
    { name: "ETH (Base Native)", value: ethValueUSD, color: "#10b981", absolute: currentDao.ethBalance, unit: "ETH" },
    { name: "AERO (Governance)", value: aeroValueUSD, color: "#06b6d4", absolute: currentDao.aeroBalance, unit: "AERO" },
  ];

  const totalAssetValue = assets.reduce((sum, a) => sum + a.value, 0);

  // SVG Donut calculation
  let cumulativePercent = 0;
  const donutSegments = assets.map((asset) => {
    const percentage = totalAssetValue > 0 ? asset.value / totalAssetValue : 0;
    const startPercent = cumulativePercent;
    cumulativePercent += percentage;
    return {
      ...asset,
      percentage,
      startPercent,
    };
  });

  const isEthLow = currentDao.ethBalance < 0.5;

  const { recentDaoSpendUSD, velocityStatus } = useMemo(() => {
    // Treat 2026-06-15 as current anchor date
    const anchorDate = new Date("2026-06-15T00:00:00Z");
    const thirtyDaysAgo = new Date(anchorDate);
    thirtyDaysAgo.setDate(anchorDate.getDate() - 30);

    const relevantTxs = transactions.filter(
      (tx) => tx.daoId === currentDao.id && tx.status === "Completed"
    );

    const spend30Days = relevantTxs
      .filter((tx) => {
        const d = new Date(tx.timestamp);
        return d >= thirtyDaysAgo;
      })
      .reduce((sum, tx) => sum + tx.amountUSD, 0);

    const budgetCap = currentDao.budgetCapUSD || 100000;
    const velocityRatio = spend30Days / budgetCap;
    
    let level: "green" | "yellow" | "red" = "green";
    let label = "Stable Outflow";
    let sublabel = "Low Exposure";
    let description = "Treasury outflows are perfectly disciplined. Low friction rate detected over moving 30-day index.";

    if (velocityRatio >= 0.35 || spend30Days > 45000 || isEthLow) {
      level = "red";
      label = "Critical Outflow";
      sublabel = "High Volatility";
      description = isEthLow 
        ? "Severe Risk. Extremely low native ETH balances coupled with active payouts triggers immediate alert levels."
        : "Extreme Deficit Threat. 30-day treasury outflow velocity is hyper-accelerated relative to stable caps.";
    } else if (velocityRatio >= 0.15 || spend30Days > 20000 || (totalSpentUSD / totalAllocatedUSD) > 0.65) {
      level = "yellow";
      label = "Elevated Velocity";
      sublabel = "Moderate Exposure";
      description = "Elevated activity. Payout velocity is picking up. Continuous logging is advised for growth pools.";
    }

    return {
      recentDaoSpendUSD: spend30Days,
      velocityStatus: {
        level,
        label,
        sublabel,
        description,
        ratioPercent: (velocityRatio * 100).toFixed(1)
      }
    };
  }, [transactions, currentDao.id, currentDao.budgetCapUSD, totalSpentUSD, totalAllocatedUSD, isEthLow]);

  return (
    <div className="space-y-6" id="treasury-overview-container">
      {/* Treasury Snapshot Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          className={`rounded-2xl p-6 border relative overflow-hidden group shadow-sm transition-all duration-300 ${
            isEthLow 
              ? "bg-rose-50/20 border-rose-300 shadow-rose-100/50" 
              : "bg-white border-slate-200"
          }`}
          id="block-eth-balance-card"
        >
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-all duration-500 ${
            isEthLow ? "bg-rose-500/10 group-hover:bg-rose-500/15" : "bg-emerald-500/5 group-hover:bg-emerald-500/10"
          }`}></div>
          
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-slate-405 text-xs font-mono font-bold tracking-wide uppercase">ETH Reserves</p>
                {isEthLow && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-mono uppercase animate-pulse">
                    <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                    Low Treasury
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                {currentDao.ethBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ETH
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-mono">
                ≈ ${ethValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </p>
            </div>
            <div className={`p-3 rounded-xl border transition-colors ${
              isEthLow 
                ? "bg-rose-50 border-rose-100 text-rose-600" 
                : "bg-emerald-50 border-emerald-100 text-emerald-600"
            }`}>
              {isEthLow ? <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" /> : <span className="text-sm font-bold block w-5 h-5 text-center leading-none">Ξ</span>}
            </div>
          </div>

          {isEthLow && (
            <div className="mt-3 bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-[11px] text-rose-700 flex items-start gap-2" id="low-treasury-warning-explanation">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Critical Deficit Warning</span>
                <span className="text-rose-600/90 leading-tight block mt-0.5">
                  Balance is below the 0.5 ETH safety threshold. Deposit required to avoid failed payouts.
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
            <span>Market Rate: ${ethPriceUSD.toLocaleString()} / ETH</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
              isEthLow ? "text-rose-700 bg-rose-50" : "text-emerald-700 bg-emerald-50"
            }`}>
              {isEthLow ? "DEFICIT" : "BASE NATIVE"}
            </span>
          </div>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden group shadow-sm"
          id="block-usdc-balance-card"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-mono font-medium tracking-wide uppercase">USDC Liquidity</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                ${currentDao.usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-mono">
                Pegged Stablecoin
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
            <span>Market Rate: $1.00 USDC</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium">STABLE RESERVE</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 border border-slate-200 relative overflow-hidden group shadow-sm"
          id="block-aero-balance-card"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-mono font-medium tracking-wide uppercase">AERO Holdings</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
                {currentDao.aeroBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} AERO
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-mono">
                ≈ ${aeroValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </p>
            </div>
            <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100 text-cyan-600">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
            <span>Market Rate: ${aeroPriceUSD.toFixed(3)} AERO</span>
            <span className="text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium">AERODROME UTILITY</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Treasury Asset allocation chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm" id="portfolio-allocation-card">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-slate-700 text-xs font-semibold tracking-wide uppercase font-mono">Portfolio Composition</h4>
              <button 
                onClick={onRefreshOnChain}
                disabled={isRefreshingBalances}
                title="Query latest balance directly from Base Blockchain RPC"
                className="text-slate-500 hover:text-slate-800 transition p-1 rounded hover:bg-slate-100 flex items-center gap-1.5 text-xs font-mono disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBalances ? 'animate-spin' : ''}`} />
                {isRefreshingBalances ? "Syncing..." : "On-chain Live"}
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6 font-sans">
              Aggregated live balances stored on-chain inside contract multisig wallet <span className="font-mono text-[10px] text-blue-600 font-medium">{currentDao.address}</span>.
            </p>

            <div className="flex justify-center my-4 relative">
              {/* Perfect SVG Donut Chart */}
              <svg width="200" height="200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="24"
                />
                {donutSegments.map((segment, idx) => {
                  const strokeDasharray = 2 * Math.PI * 70;
                  const strokeDashoffset = strokeDasharray * (1 - segment.percentage);
                  const rotation = segment.startPercent * 360;
                  return (
                    <circle
                      key={idx}
                      cx="100"
                      cy="100"
                      r="70"
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth="24"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: "100px 100px",
                        transition: "all 0.5s ease-out",
                      }}
                      className="cursor-pointer opacity-90 hover:opacity-100"
                      onMouseEnter={() => setHoveredCategory(segment.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Total USD displayed inside the donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-slate-400 text-[9px] uppercase font-mono tracking-wider font-semibold">Total Treasury</p>
                <p className="text-xl font-extrabold text-slate-800 tracking-tight">
                  ${totalTreasuryUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <div className={`mt-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold flex items-center gap-1 border uppercase ${
                  velocityStatus.level === "red"
                    ? "bg-rose-50 text-rose-600 border-rose-100"
                    : velocityStatus.level === "yellow"
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${
                    velocityStatus.level === "red"
                      ? "bg-rose-500 animate-pulse"
                      : velocityStatus.level === "yellow"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`} />
                  {velocityStatus.label.split(" ")[0]} Risk
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {donutSegments.map((segment, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-lg border transition ${
                  hoveredCategory === segment.name 
                    ? "bg-slate-50 border-slate-200" 
                    : "bg-transparent border-transparent"
                }`}
                onMouseEnter={() => setHoveredCategory(segment.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="text-slate-700 font-medium">{segment.name}</span>
                  </div>
                  <span className="text-slate-600 font-mono font-semibold">
                    {((segment.percentage) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 pl-4">
                  <span>{segment.absolute.toLocaleString()} {segment.unit}</span>
                  <span>${segment.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Risk Heatmap Status Block */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3" id="ai-risk-heatmap-block">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                AI Risk Heatmap
              </span>
              
              <span className={`px-2.5 py-0.5 text-[9px] font-bold font-mono uppercase rounded-full border flex items-center gap-1.5 shadow-sm ${
                velocityStatus.level === "red"
                  ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                  : velocityStatus.level === "yellow"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`} id="realtime-risk-heatmap-badge">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  velocityStatus.level === "red"
                    ? "bg-rose-500 animate-ping"
                    : velocityStatus.level === "yellow"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`} />
                {velocityStatus.label}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${
              velocityStatus.level === "red"
                ? "bg-rose-50/30 border-rose-150 text-rose-850"
                : velocityStatus.level === "yellow"
                ? "bg-amber-50/20 border-amber-150 text-amber-850"
                : "bg-slate-50 border-slate-150 text-slate-700"
            }`}>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className="text-slate-450">Outflow Velocity (30d)</span>
                <span className={velocityStatus.level === "red" ? "text-rose-600 font-extrabold" : "text-slate-805"}>
                  ${recentDaoSpendUSD.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>Cap Utilization Limit</span>
                <span>{velocityStatus.ratioPercent}% limit/mo</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed mt-2 italic pt-1.5 border-t border-slate-100">
                "{velocityStatus.description}"
              </p>
            </div>
          </div>
        </div>

        {/* Treasury Category Budgets Progress bars */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm" id="category-budgets-grid">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-slate-700 text-xs font-semibold tracking-wide uppercase font-mono">Category Budget Utilization</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Budget caps assigned vs real spending pulled and mapped to on-chain payouts.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono block">Utilization Target</span>
                <p className="text-lg font-bold text-slate-800 mt-1 font-mono">
                  {budgetUtilizationRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Micro Overall aggregate budget overview */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between mb-6">
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase font-semibold">Spent Budget</p>
                <p className="text-base font-bold text-slate-700">${totalSpentUSD.toLocaleString()} USD</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase font-semibold">Limit Allocation</p>
                <p className="text-base font-bold text-slate-700">${totalAllocatedUSD.toLocaleString()} USD</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase font-semibold">Vault Buffer Left</p>
                <p className={`text-base font-bold ${totalAllocatedUSD - totalSpentUSD < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  ${Math.max(0, totalAllocatedUSD - totalSpentUSD).toLocaleString()} USD
                </p>
              </div>
            </div>

            {/* Individual budgets */}
            <div className="space-y-5">
              {budgets.map((budget, index) => {
                const percent = budget.allocatedUSD > 0 ? (budget.spentUSD / budget.allocatedUSD) * 100 : 0;
                let barColor = "bg-blue-600";
                let badgeStyle = "bg-blue-50 text-blue-700 border border-blue-100";
                if (percent >= 90) {
                  barColor = "bg-rose-500";
                  badgeStyle = "bg-rose-50 text-rose-700 border border-rose-100";
                } else if (percent >= 70) {
                  barColor = "bg-amber-500";
                  badgeStyle = "bg-amber-50 text-amber-700 border border-amber-100";
                } else if (percent > 0) {
                  barColor = "bg-emerald-500";
                  badgeStyle = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                }

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-medium ${badgeStyle}`}>
                          {budget.category}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono">
                        ${budget.spentUSD.toLocaleString()} / <span className="text-slate-400">${budget.allocatedUSD.toLocaleString()}</span>
                      </span>
                    </div>

                    <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full ${barColor} transition-all duration-700 rounded-full`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>{percent.toFixed(0)}% Utilized</span>
                      <span>
                        {percent > 100 
                          ? `Exceeded by $${Math.abs(budget.allocatedUSD - budget.spentUSD).toLocaleString()} USD` 
                          : `$${(budget.allocatedUSD - budget.spentUSD).toLocaleString()} remaining`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
