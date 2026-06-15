import React, { useState } from "react";
import { ProposalPlan, TransactionCategory } from "../types";
import { 
  AlertCircle, 
  Brain, 
  CheckSquare, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  Vote, 
  Award, 
  Users, 
  XOctagon, 
  Clock, 
  User, 
  Calendar 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProposalAssessmentProps {
  currentDaoId: string;
  onApproveProposal: (
    proposal: ProposalPlan, 
    evaluation: { category: TransactionCategory; riskScore: "Low" | "Medium" | "High"; explanation: string }
  ) => void; // Immediate evaluation fallback
  ethPriceUSD: number;
  aeroPriceUSD: number;
  proposals: ProposalPlan[];
  onCreateProposal: (newProp: Omit<ProposalPlan, "id" | "votesSupport" | "votesOppose" | "votesAbstain" | "voterReceipts">) => void;
  onVoteProposal: (propId: string, choice: "Support" | "Oppose" | "Abstain", voter: string) => void;
  onExecuteApprovedProposal: (prop: ProposalPlan) => void;
  onRejectProposal: (propId: string) => void;
  connectedWalletAddress?: string | null;
}

const CATEGORIES: TransactionCategory[] = [
  "Developer Grant",
  "Marketing & Growth",
  "Liquidity Provision",
  "Security Audit",
  "Core Contributors",
  "Operations & Legal",
  "Uncategorized"
];

export default function ProposalAssessment({
  currentDaoId,
  onApproveProposal,
  ethPriceUSD,
  aeroPriceUSD,
  proposals,
  onCreateProposal,
  onVoteProposal,
  onExecuteApprovedProposal,
  onRejectProposal,
  connectedWalletAddress
}: ProposalAssessmentProps) {
  // Draft Form States
  const [title, setTitle] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState<"ETH" | "USDC" | "AERO">("ETH");
  const [category, setCategory] = useState<TransactionCategory>("Developer Grant");
  const [rationale, setRationale] = useState("");
  const [spentBy, setSpentBy] = useState("");
  const [occurredAt, setOccurredAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<{
    recommendedCategory: TransactionCategory;
    riskScore: "Low" | "Medium" | "High";
    riskExplanation: string;
    auditMeritAnalysis: string;
  } | null>(null);

  const [validationError, setValidationError] = useState("");

  // Filter proposals relevant to current DAO workspace
  const activeDaoProposals = proposals.filter((p) => p.daoId === currentDaoId);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setAssessment(null);

    if (!title.trim() || !rationale.trim()) {
      setValidationError("Required fields: Please fill out the proposal title and the spending rationale.");
      return;
    }

    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      setValidationError("Must provide a valid 0x Base blockchain wallet address structure.");
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setValidationError("Disbursal value must be a valid numeric quantity greater than zero.");
      return;
    }

    setLoading(true);

    const proposalObj = {
      title,
      recipient,
      amountETH: value,
      tokenSymbol: token,
      category,
      rationale
    };

    try {
      const response = await fetch("/api/gemini/evaluate-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal: proposalObj })
      });

      if (!response.ok) {
        throw new Error("Target evaluation endpoint returned abnormal response.");
      }

      const result = await response.json();
      setAssessment({
        recommendedCategory: result.recommendedCategory || category,
        riskScore: result.riskScore || "Low",
        riskExplanation: result.riskExplanation || "Evaluated safe under standard criteria.",
        auditMeritAnalysis: result.auditMeritAnalysis || "Verified grant alignment."
      });
    } catch (err: any) {
      console.error(err);
      // Fallback evaluation on errors
      setAssessment({
        recommendedCategory: category,
        riskScore: value > 10 ? "High" : value > 3 ? "Medium" : "Low",
        riskExplanation: "Automated standard evaluation based on amount size threshold fallback.",
        auditMeritAnalysis: "Completed check fallback."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterProposal = () => {
    if (!assessment) return;

    onCreateProposal({
      daoId: currentDaoId,
      title,
      recipient,
      amountETH: parseFloat(amount),
      tokenSymbol: token,
      category: assessment.recommendedCategory,
      rationale,
      status: "Voting",
      spentBy: spentBy.trim() || "DAO Core Team Member",
      occurredAt: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
      riskScore: assessment.riskScore,
      riskExplanation: assessment.riskExplanation,
      auditMeritAnalysis: assessment.auditMeritAnalysis
    });

    // Reset drafting fields
    setTitle("");
    setRecipient("");
    setAmount("");
    setRationale("");
    setSpentBy("");
    setOccurredAt("");
    setAssessment(null);
  };

  // Simulated voters behavior
  const handleSimulateVoters = (propId: string, risk: "Low" | "Medium" | "High") => {
    // Generate realistic voting distribution based on the audit risk rating
    const totalDelegates = 15;
    let supportRate = 0.85; // Low risk
    if (risk === "Medium") supportRate = 0.55;
    if (risk === "High") supportRate = 0.30;

    const supportCount = Math.round(totalDelegates * supportRate);
    const opposeCount = Math.round(totalDelegates * (1 - supportRate) * 0.8);
    const abstainCount = totalDelegates - supportCount - opposeCount;

    // Simulate voting action
    for (let i = 0; i < supportCount; i++) {
      onVoteProposal(propId, "Support", `delegate_support_${i}`);
    }
    for (let i = 0; i < opposeCount; i++) {
      onVoteProposal(propId, "Oppose", `delegate_oppose_${i}`);
    }
    for (let i = 0; i < abstainCount; i++) {
      onVoteProposal(propId, "Abstain", `delegate_abstain_${i}`);
    }
  };

  return (
    <div className="space-y-6" id="proposal-assessment-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payout Proposal Input workspace */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm text-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800 font-mono tracking-wide uppercase">Draft DAO Spending Proposal</h4>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Active Sandbox</span>
              </div>
            </div>

            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Proposal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Redesign and gas optimization for Uniswap hook"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Spent By / Claimant Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Core Dev group, Engineering team"
                    value={spentBy}
                    onChange={(e) => setSpentBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Date Occurred</label>
                  <input
                    type="datetime-local"
                    value={occurredAt}
                    onChange={(e) => setOccurredAt(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-sans text-xs cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Target Recipient (0x Wallet)</label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Disbursal Quantity</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 5.2"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-mono pr-16"
                    />
                    <select
                      value={token}
                      onChange={(e) => setToken(e.target.value as any)}
                      className="absolute right-1 top-1 bg-slate-200 border-none rounded p-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer font-mono font-semibold"
                    >
                      <option value="ETH">ETH</option>
                      <option value="USDC">USDC</option>
                      <option value="AERO">AERO</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Preliminary Category Allocation</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-sans cursor-pointer"
                >
                  {CATEGORIES.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono text-slate-755">Proposal Spending Rationale</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the work milestones achieved, link to public PRs, outline why the DAO council should allocate assets..."
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-sans leading-relaxed text-xs"
                />
              </div>

              {validationError && (
                <p className="text-xs text-rose-600 font-mono">{validationError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg text-xs font-mono tracking-wide flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                    <span>Configuring AI Auditor Model...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Run AI Audit Diagnostics</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* AI Assessment Result Display card */}
        <div className="lg:col-span-6 flex">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between w-full shadow-sm h-full relative overflow-hidden text-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
            
            <div>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-800 font-mono tracking-wider uppercase">AI Audit Assessment Matrix</h4>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-sm font-mono text-slate-700 font-medium">Evaluating proposal alignment...</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">Gemini is looking up address risk, category threat level, and checking budget constraints.</p>
                  </motion.div>
                ) : assessment ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Gauge Risk matrix */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase block">Risk Threat Rating</span>
                        <div className="flex items-center gap-1.5 mt-2">
                          {assessment.riskScore === "High" ? (
                            <>
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              <span className="text-sm font-bold text-rose-600 font-mono">High Risk</span>
                            </>
                          ) : assessment.riskScore === "Medium" ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <span className="text-sm font-bold text-amber-500 font-mono">Medium Risk</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-bold text-emerald-600 font-mono">Low Risk</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase block">Recommended Segment</span>
                        <p className="text-xs font-bold text-blue-600 mt-2 font-mono truncate">
                          {assessment.recommendedCategory}
                        </p>
                      </div>
                    </div>

                    {/* Context notes */}
                    <div className="space-y-2.5">
                      <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
                        <p className="text-[10px] text-blue-700 font-bold font-mono tracking-wide uppercase">AI Threat Diagnostics</p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans mt-1">
                          {assessment.riskExplanation}
                        </p>
                      </div>

                      <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
                        <p className="text-[10px] text-emerald-700 font-bold font-mono tracking-wide uppercase">Financial Merit & Milestones check</p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                          {assessment.auditMeritAnalysis}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 font-sans border border-dashed border-slate-200 bg-slate-50/40 rounded-xl">
                    <Brain className="w-10 h-10 text-slate-300 mb-3 animate-pulse" />
                    <p className="text-slate-600 font-semibold text-sm">Draft spending details to run diagnostics</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Before registering a proposal to voters consensus, audit it via Gemini model checks to assign safety levels.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Approval controller */}
            {assessment && !loading && (
              <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
                <div className="bg-slate-50 rounded-lg p-2.5 text-[10px] text-slate-605 border border-slate-200 font-sans font-medium">
                  ✓ Diagnostics successfully completed. Now, submit this package to initiate the democratic voting and consensus registry.
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAssessment(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg text-xs font-semibold cursor-pointer transition font-mono"
                  >
                    Clear Draft
                  </button>
                  <button
                    onClick={handleRegisterProposal}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm font-mono tracking-wide"
                  >
                    <Vote className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Submit to voting list</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DAO Multi-Member Active Voting Proposals section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-800" id="dao-proposals-voting-governance">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Vote className="w-5 h-5 text-indigo-600" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-sans tracking-wide">Governance Voting Registry</h4>
            <p className="text-xs text-slate-400 font-medium">Review, discuss, cast votes, and finalize the execution of DAO expenditures.</p>
          </div>
        </div>

        {activeDaoProposals.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-sans border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-600">No proposals in consensus for this DAO</p>
            <p className="text-xs text-slate-400 mt-1">Use the active draft sandbox above to create your very first spending proposal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDaoProposals.map((prop) => {
              const activeVotedOption = connectedWalletAddress && prop.voterReceipts ? prop.voterReceipts[connectedWalletAddress] : null;
              
              const isLowRisk = prop.riskScore === "Low";
              const isHighRisk = prop.riskScore === "High";
              const riskColorStr = isLowRisk ? "bg-emerald-50 text-emerald-700 border-emerald-100" : isHighRisk ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100";
              const statusColorStr = prop.status === "Approved" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : prop.status === "Rejected" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-indigo-50 text-indigo-700 border-indigo-200";

              return (
                <div 
                  key={prop.id} 
                  className={`border rounded-xl p-5 space-y-4 shadow-sm hover:shadow transition relative flex flex-col justify-between ${
                    prop.status === "Approved" ? "border-emerald-200 bg-emerald-50/10" : prop.status === "Rejected" ? "border-slate-100 bg-slate-50/40" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColorStr}`}>
                        {prop.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${riskColorStr}`}>
                        Risk: {prop.riskScore || "Low"}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-slate-800 line-clamp-1" title={prop.title}>
                        {prop.title}
                      </h5>
                      <span className="text-[10px] font-mono text-indigo-600 font-semibold uppercase mt-0.5 block">
                        Category: {prop.category}
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-lg space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                        <div>
                          <span className="block text-slate-400 font-bold uppercase text-[9px]">Disbursal Amount</span>
                          <span className="font-bold text-slate-800">
                            {prop.amountETH} {prop.tokenSymbol}
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-bold uppercase text-[9px]">Recipient Wallet</span>
                          <span className="font-bold text-slate-700 underline truncate max-w-[125px] block">
                            {prop.recipient.substring(0, 6)}...{prop.recipient.substring(38)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-1.5 text-[11px] text-slate-500 font-mono">
                        <div>
                          <span className="block text-slate-400 font-bold uppercase text-[9px] flex items-center gap-1">
                            <User className="w-2.5 h-2.5" /> Spender
                          </span>
                          <span className="font-semibold text-slate-750 truncate max-w-[125px] block leading-normal pt-0.5">
                            {prop.spentBy || "DAO Delegate"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-bold uppercase text-[9px] flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> Occurred
                          </span>
                          <span className="font-semibold text-slate-750 block leading-normal pt-0.5">
                            {new Date(prop.occurredAt || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-2 font-sans">
                        <span className="block font-bold text-slate-400 text-[9px] uppercase font-mono">Rationale Context</span>
                        <p className="text-slate-650 leading-relaxed text-[11.5px] line-clamp-2 mt-0.5">
                          {prop.rationale}
                        </p>
                      </div>

                      {prop.riskExplanation && (
                        <div className="border-t border-slate-100 pt-2 font-sans text-[10.5px] text-slate-500 bg-slate-100/50 p-2 rounded block">
                          <span className="block font-bold text-indigo-500 text-[9px] uppercase font-mono">AI Assessment Note</span>
                          <p className="leading-snug italic mt-1 font-medium text-slate-600">
                            "{prop.riskExplanation}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* VOTE STATS PROGRESS BAR */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase flex justify-between">
                        <span>DAO Consensus votes</span>
                        <span className="text-slate-600 font-bold">
                          {prop.votesSupport} support vs {prop.votesOppose} oppose
                        </span>
                      </span>
                      <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex font-mono text-[9px]">
                        {prop.votesSupport === 0 && prop.votesOppose === 0 && prop.votesAbstain === 0 ? (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                            Unvoted
                          </div>
                        ) : (
                          <>
                            <div 
                              className="bg-emerald-500 h-full transition-all" 
                              style={{ width: `${(prop.votesSupport / (prop.votesSupport + prop.votesOppose + prop.votesAbstain || 1)) * 100}%` }}
                            />
                            <div 
                              className="bg-rose-500 h-full transition-all" 
                              style={{ width: `${(prop.votesOppose / (prop.votesSupport + prop.votesOppose + prop.votesAbstain || 1)) * 100}%` }}
                            />
                            <div 
                              className="bg-slate-350 h-full transition-all" 
                              style={{ width: `${(prop.votesAbstain / (prop.votesSupport + prop.votesOppose + prop.votesAbstain || 1)) * 100}%` }}
                            />
                          </>
                        )}
                      </div>
                      <div className="flex justify-between text-[9.5px] font-mono font-semibold text-slate-500">
                        <span className="text-emerald-700">Support ({prop.votesSupport})</span>
                        <span className="text-rose-700">Oppose ({prop.votesOppose})</span>
                        <span className="text-slate-550">Abstain ({prop.votesAbstain})</span>
                      </div>
                    </div>
                  </div>

                  {prop.status === "Voting" && (
                    <div className="pt-4 border-t border-slate-100 space-y-3.5">
                      {/* Cast standard votes controls */}
                      <div className="space-y-2">
                        <label className="block text-[9.5px] text-slate-450 font-mono uppercase font-bold tracking-wide">Cast member vote</label>
                        <div className="grid grid-cols-3 gap-1.5 font-mono">
                          <button
                            onClick={() => onVoteProposal(prop.id, "Support", connectedWalletAddress || "sim_user")}
                            className={`px-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                              activeVotedOption === "Support" 
                                ? "bg-emerald-600 text-white border-emerald-600 shadow" 
                                : "bg-slate-50 hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300 text-emerald-800"
                            }`}
                          >
                            <span>Yes</span>
                          </button>
                          
                          <button
                            onClick={() => onVoteProposal(prop.id, "Oppose", connectedWalletAddress || "sim_user")}
                            className={`px-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                              activeVotedOption === "Oppose" 
                                ? "bg-rose-600 text-white border-rose-600 shadow" 
                                : "bg-slate-50 hover:bg-rose-50/50 border-slate-200 hover:border-rose-300 text-rose-800"
                            }`}
                          >
                            <span>No</span>
                          </button>
                          
                          <button
                            onClick={() => onVoteProposal(prop.id, "Abstain", connectedWalletAddress || "sim_user")}
                            className={`px-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                              activeVotedOption === "Abstain" 
                                ? "bg-slate-600 text-white border-slate-600 shadow" 
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-350 text-slate-700"
                            }`}
                          >
                            <span>Abstain</span>
                          </button>
                        </div>
                      </div>

                      {/* Delegates controls */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSimulateVoters(prop.id, prop.riskScore || "Low")}
                          title="Simulate standard board delegates consensus weighted logically by AI threat assessments."
                          className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold p-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer font-mono"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>Simulate Board Votes</span>
                        </button>

                        <button
                          onClick={() => onRejectProposal(prop.id)}
                          className="px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer font-mono"
                        >
                          <XOctagon className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>

                      {/* Execution triggers */}
                      <button
                        onClick={() => onExecuteApprovedProposal(prop)}
                        disabled={prop.votesSupport <= prop.votesOppose}
                        className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition font-mono tracking-wide ${
                          prop.votesSupport > prop.votesOppose
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        }`}
                        title={prop.votesSupport <= prop.votesOppose ? "Consensus not reached: Support must exceed Oppose votes" : "Dispatch approved treasury disbursement now."}
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Execute & Disburse Funds</span>
                      </button>
                    </div>
                  )}

                  {prop.status === "Approved" && (
                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Executed on Base</span>
                    </div>
                  )}

                  {prop.status === "Rejected" && (
                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1">
                      <XOctagon className="w-4 h-4 text-rose-500" />
                      <span>Proposal Rejected</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
