import React, { useState } from "react";
import { BaseDAO, Transaction, Budget } from "../types";
import { Brain, FileText, Send, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface AIAnalystProps {
  currentDao: BaseDAO;
  transactions: Transaction[];
  budgets: Budget[];
  isApiKeyConfigured: boolean;
}

export default function AIAnalyst({
  currentDao,
  transactions,
  budgets,
  isApiKeyConfigured,
}: AIAnalystProps) {
  const [loading, setLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string>("");
  const [errorText, setErrorText] = useState("");

  const handleRunAudit = async () => {
    setLoading(true);
    setErrorText("");
    setAnalysisReport("");

    const relevantTxs = transactions.filter((tx) => tx.daoId === currentDao.id);

    try {
      const response = await fetch("/api/gemini/analyze-treasury", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daoName: currentDao.name,
          balances: {
            ethBalance: currentDao.ethBalance,
            usdcBalance: currentDao.usdcBalance,
            aeroBalance: currentDao.aeroBalance,
          },
          transactions: relevantTxs,
          budgets: budgets,
        }),
      });

      if (!response.ok) {
        throw new Error("Target analyzer backend returned an error.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisReport(data.analysis || "No audit output returned.");
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || "AI Analysis was unable to build. Make sure the Gemini API key is correctly configured inside Settings > Secrets.");
    } finally {
      setLoading(false);
    }
  };

  // Basic layout parser for simple markdown results to render elegantly without full heavier packages
  const renderParsedAnalysis = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // 1. Headings check
      if (line.startsWith("### ")) {
        return (
          <h5 key={index} className="text-sm font-bold text-slate-850 font-mono uppercase tracking-wider mt-5 mb-2.5 pb-1 border-b border-slate-250 pr-4">
            {line.replace("### ", "")}
          </h5>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h4 key={index} className="text-base font-bold text-blue-700 font-sans tracking-tight mt-6 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-500 rounded-sm inline-block" />
            {line.replace("## ", "")}
          </h4>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h3 key={index} className="text-lg font-bold text-slate-850 font-sans tracking-tight mt-6 mb-4">
            {line.replace("# ", "")}
          </h3>
        );
      }

      // 2. Unordered lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        // Clean double-bold stars inside list
        const cleanContent = line.replace(/^\s*[-*]\s+/, "");
        return (
          <li key={index} className="text-xs text-slate-650 font-sans ml-4 list-disc space-y-1.5 pl-1.5 leading-relaxed py-0.5">
            {parseBoldText(cleanContent)}
          </li>
        );
      }

      // 3. Regular lines / bold formatting
      if (line.trim()) {
        return (
          <p key={index} className="text-xs text-slate-650 font-sans leading-relaxed my-2">
            {parseBoldText(line)}
          </p>
        );
      }

      // Empty separator lines
      return <div key={index} className="h-1" />;
    });
  };

  // Helper inside helper to parse standard markdown double-stars (**) into safe bold highlights
  const parseBoldText = (text: string) => {
    const segments = text.split(/\*\*([^*]+)\*\*/g);
    if (segments.length === 1) return text;
    return segments.map((seg, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="text-blue-705 font-semibold font-mono">
            {seg}
          </strong>
        );
      }
      return seg;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm text-slate-800" id="ai-auditor-workspace">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 font-mono tracking-wide uppercase">Gemini AI Treasury Auditor</h4>
              <p className="text-xs text-slate-500 mt-1">Get custom L2-optimized liquidity, budget buffer assessments, and threat reports.</p>
            </div>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-xs font-mono font-semibold tracking-wide flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-100" />
                <span>Running Audit Engine...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Request Executive Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Informative tips box */}
        {!analysisReport && !loading && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-600 font-sans space-y-1">
              <p className="font-semibold text-slate-700">How the DAO Treasury Auditor operates:</p>
              <p>The auditor maps all assets stored on-chain inside selected vaults and matches them against category caps. It verifies allocation thresholds and checks recent outflow transactions for any severe threat factors.</p>
            </div>
          </div>
        )}

        {/* Error warnings */}
        {errorText && (
          <div className="bg-rose-50 text-rose-700 text-xs rounded-xl p-4 border border-rose-200 font-sans mb-6 font-medium">
            <p className="font-bold mb-1 border-b border-rose-100 pb-1">Audit Generation Suspended</p>
            <p className="leading-relaxed text-[11px] font-mono">{errorText}</p>
          </div>
        )}

        {/* Progress simulator */}
        {loading && (
          <div className="py-24 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-xs font-mono text-blue-700 uppercase tracking-widest animate-pulse font-semibold">Scanning ledger and verifying budgets...</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed font-sans">
              Compiling total ETH values, matching categories, and assessing risk balances with Gemini on Base.
            </p>
          </div>
        )}

        {/* Generated report */}
        {analysisReport && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner max-h-[550px] overflow-y-auto text-slate-705"
            id="audit-markdown-report"
          >
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-xs font-bold text-blue-800 font-mono uppercase tracking-wider block">Executive Financial Audit</span>
                <span className="text-[10px] text-slate-400 font-mono">Issued by Gemini Auditor • Base Chain Hub</span>
              </div>
            </div>

            <div className="prose max-w-none text-slate-700">
              {renderParsedAnalysis(analysisReport)}
            </div>
          </motion.div>
        )}

        {/* Fallback landing panel */}
        {!analysisReport && !loading && (
          <div className="py-28 text-center border border-dashed border-slate-200 bg-slate-50/20 rounded-2xl">
            <Brain className="w-10 h-10 text-slate-305 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold text-sm">Auditing Workspace Ready</p>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed font-medium">
              Click the **Request Executive Audit** button at the top right. Gemini will run structured audits regarding diversity, stability, and risks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
