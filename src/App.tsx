import React, { useState, useEffect } from "react";
import { BaseDAO, Transaction, Budget, ProposalPlan, TransactionCategory } from "./types";
import { PRESET_DAOS, INITIAL_BUDGETS, INITIAL_TRANSACTIONS } from "./mockData";
import TreasuryOverview from "./components/TreasuryOverview";
import TransactionPanel from "./components/TransactionPanel";
import ProposalAssessment from "./components/ProposalAssessment";
import AIAnalyst from "./components/AIAnalyst";
import ReportingAnalytics from "./components/ReportingAnalytics";
import { 
  Plus, 
  Settings, 
  HelpCircle, 
  TrendingUp, 
  FileText, 
  History, 
  Cpu, 
  Search, 
  RefreshCw, 
  ArrowUpRight, 
  Coins, 
  CheckCircle2, 
  AlertCircle,
  Wallet,
  LogOut,
  Check,
  Shield,
  Key,
  ExternalLink,
  BarChart3,
  Mail,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

const renderWalletIcon = (provider: string, className: string = "w-6 h-6") => {
  switch (provider) {
    case "MetaMask":
      return (
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
          alt="MetaMask" 
          className={`${className} object-contain`}
          referrerPolicy="no-referrer"
        />
      );
    case "Coinbase Wallet":
      return (
        <div className={className}>
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <rect width="40" height="40" rx="10" fill="#0052FF"/>
            <rect x="10" y="10" width="20" height="20" rx="4" stroke="white" strokeWidth="3" fill="none"/>
            <circle cx="20" cy="20" r="3.5" fill="white"/>
          </svg>
        </div>
      );
    case "Base Wallet":
      return (
        <div className={className}>
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <circle cx="20" cy="20" r="20" fill="#0052FF"/>
            <circle cx="20" cy="20" r="10" stroke="white" strokeWidth="3.5" fill="none"/>
          </svg>
        </div>
      );

    case "Email Login":
      return (
        <div className={className}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-indigo-600">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>
      );

    default:
      return null;
  }
};

const renderDaoAvatar = (daoId: string, className: string = "w-11 h-11") => {
  switch (daoId) {
    case "purple-dao":
      return (
        <div className={`${className} bg-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700/30 to-purple-500/10 animate-pulse duration-1000" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 text-white">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      );
    case "based-nouns":
      return (
        <div className={`${className} bg-amber-400 rounded-2xl flex items-center justify-center text-slate-900 font-extrabold text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent" />
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 relative z-10 text-black">
            <rect x="2" y="8" width="8" height="8" rx="2" />
            <rect x="14" y="8" width="8" height="8" rx="2" />
            <rect x="10" y="11" width="4" height="2" />
            <rect x="4" y="11" width="4" height="2" fill="#E11D48" />
            <rect x="16" y="11" width="4" height="2" fill="#E11D48" />
          </svg>
        </div>
      );
    case "base-builders":
      return (
        <div className={`${className} bg-slate-950 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden border border-slate-800`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/35 to-transparent" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 text-blue-400">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
      );
    case "aerodrome":
      return (
        <div className={`${className} bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10 animate-pulse" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 text-white animate-spin-slow">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      );
    case "virtuals":
      return (
        <div className={`${className} bg-indigo-950 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden border border-indigo-500/40`}>
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 via-transparent to-indigo-500/20" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 text-purple-450">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v12M6 12h12" />
          </svg>
        </div>
      );
    case "warpcast":
      return (
        <div className={`${className} bg-purple-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-transparent" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 text-pink-300">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      );
    case "basepaint":
      return (
        <div className={`${className} bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 text-white">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
            <path d="M7.5 10.5C8.32843 10.5 9 9.82843 9 9C9 8.17157 8.32843 7.5 7.5 7.5C6.67157 7.5 6 8.17157 6 9C6 9.82843 6.67157 10.5 7.5 10.5Z" />
            <path d="M11.5 7.5C12.3284 7.5 13 6.82843 13 6C13 5.17157 12.3284 4.5 11.5 4.5C10.6716 4.5 10 5.17157 10 6C10 6.82843 10.6716 7.5 11.5 7.5Z" />
            <path d="M16.5 10.5C17.3284 10.5 18 9.82843 18 9C18 8.17157 17.3284 7.5 16.5 7.5C15.6716 7.5 15 8.17157 15 9C15 9.82843 15.6716 10.5 16.5 10.5Z" />
          </svg>
        </div>
      );
    case "degen-dao":
      return (
        <div className={`${className} bg-indigo-900 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0052FF]/40 to-transparent" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 text-cyan-300">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      );
    case "talent":
      return (
        <div className={`${className} bg-teal-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-transparent" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 text-white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${className} bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-inner relative group-hover:scale-110 transition duration-305 overflow-hidden`}>
          <div className="absolute inset-0 bg-white/10" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-indigo-100">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      );
  }
};

export default function App() {
  // Dynamic market price rates feed states (active & live)
  const [ethPriceUSD, setEthPriceUSD] = useState<number>(3254.80);
  const [aeroPriceUSD, setAeroPriceUSD] = useState<number>(0.84);
  const [priceSource, setPriceSource] = useState<string>("Initializing...");
  const [priceTimestamp, setPriceTimestamp] = useState<string>("");
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);

  const fetchTokenPrices = async () => {
    setIsPriceLoading(true);
    try {
      const response = await fetch("/api/token-prices");
      if (response.ok) {
        const data = await response.json();
        if (data.status === "Success") {
          setEthPriceUSD(data.ethPrice);
          setAeroPriceUSD(data.aeroPrice);
          setPriceSource(data.source);
          setPriceTimestamp(new Date(data.timestamp).toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error("Error fetching token prices:", err);
    } finally {
      setIsPriceLoading(false);
    }
  };

  // 1. Core states
  const [daos, setDaos] = useState<BaseDAO[]>(() => {
    const saved = localStorage.getItem("base_daos_list");
    return saved ? JSON.parse(saved) : PRESET_DAOS;
  });

  const [currentDaoId, setCurrentDaoId] = useState<string>(() => {
    return daos[0]?.id || "purple-dao";
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("base_daos_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgetsMap, setBudgetsMap] = useState<Record<string, Budget[]>>(() => {
    const saved = localStorage.getItem("base_daos_budgets_map");
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [proposals, setProposals] = useState<ProposalPlan[]>(() => {
    const saved = localStorage.getItem("base_daos_proposals");
    if (saved) return JSON.parse(saved);

    return [
      {
        id: "prop-preset-1",
        daoId: "purple-dao",
        title: "Farcaster Client React Native SDK Integration Milestone 2",
        recipient: "0x12f3db0a469795ef03423cfb8bca612a3cdb4aef",
        amountETH: 4.8,
        tokenSymbol: "ETH",
        category: "Developer Grant",
        rationale: "Complete user authentication, frame validation, and notification client payload parsing.",
        status: "Voting",
        spentBy: "0x12f3db...4aef (Core Dev)",
        occurredAt: "2026-06-14T09:00:00Z",
        votesSupport: 12,
        votesOppose: 3,
        votesAbstain: 2,
        voterReceipts: {
          "0xd8da6bf25964af9d7eed9e03e53415d37aa96045": "Support"
        },
        riskScore: "Low",
        riskExplanation: "Solid milestone documentation linked to public pull requests with low risk of funds misuse."
      },
      {
        id: "prop-preset-2",
        daoId: "purple-dao",
        title: "Community Growth Campaign & Farcaster Promo Items",
        recipient: "0x63fe2200dc2219e9ca33cb8e364998782fe81bb59",
        amountETH: 8000,
        tokenSymbol: "USDC",
        category: "Marketing & Growth",
        rationale: "To manufacture high quality purple stickers, custom shirts, and sponsor developer lunch meetups in major cities.",
        status: "Voting",
        spentBy: "0x63fe22...2b7e (Marketing Lead)",
        occurredAt: "2026-06-12T14:30:00Z",
        votesSupport: 8,
        votesOppose: 9,
        votesAbstain: 1,
        voterReceipts: {},
        riskScore: "Medium",
        riskExplanation: "Spending on physical merchandise requires close oversight, but marketing budget has sufficient capacity."
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "proposal" | "ai-analyst" | "analytics">("overview");

  // Base Ecosystem Hub search & filtering states
  const [daoSearchQuery, setDaoSearchQuery] = useState("");
  const [daoCategoryFilter, setDaoCategoryFilter] = useState("all");

  // Wallet Connection States
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem("connected_wallet_address");
  });
  const [walletProvider, setWalletProvider] = useState<string | null>(() => {
    return localStorage.getItem("connected_wallet_provider");
  });
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(() => {
    return localStorage.getItem("utils_logged_in_email");
  });

  // Email authentication form states
  const [connectModalTab, setConnectModalTab] = useState<"wallet" | "email">("wallet");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailSignUpMode, setEmailSignUpMode] = useState(false);
  const [authError, setAuthError] = useState("");

  const deriveAddressFromEmail = (email: string) => {
    let hash = 0;
    const cleanEmail = email.trim().toLowerCase();
    for (let i = 0; i < cleanEmail.length; i++) {
      const char = cleanEmail.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Formulate deterministic hex address starting with 0x (40 characters after 0x)
    const part1 = Math.abs(hash).toString(16).padStart(8, "0");
    const part2 = Math.abs(hash * 3).toString(16).padStart(8, "0");
    const part3 = Math.abs(hash * 7).toString(16).padStart(8, "0");
    const part4 = Math.abs(hash * 13).toString(16).padStart(8, "0");
    const part5 = Math.abs(hash * 17).toString(16).padStart(8, "0");
    const combined = (part1 + part2 + part3 + part4 + part5).substring(0, 40);
    return "0x" + combined;
  };

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showActiveWalletMenu, setShowActiveWalletMenu] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signMessage, setSignMessage] = useState("I am signing this secure session challenge to authenticate on Base Mainnet.");
  const [signStatus, setSignStatus] = useState<"idle" | "signing" | "success">("idle");
  const [generatedSignature, setGeneratedSignature] = useState("");
  const [customSimWalletAddress, setCustomSimWalletAddress] = useState("");

  // Base Mainnet RPC status states
  const [showRpcModal, setShowRpcModal] = useState(false);
  const [rpcStatus, setRpcStatus] = useState<{
    status: string;
    networkName: string;
    description: string;
    rpcUrl: string;
    chainId: number;
    currencySymbol: string;
    blockExplorer: string;
    blockNumber: number | null;
    gasPriceGwei: number | null;
    timestamp: string;
  } | null>(null);
  const [isPlayingRpcLoading, setIsPlayingRpcLoading] = useState(false);

  const fetchRpcStatus = async () => {
    setIsPlayingRpcLoading(true);
    try {
      const response = await fetch("/api/rpc-status");
      if (response.ok) {
        const data = await response.json();
        setRpcStatus(data);
      } else {
        throw new Error("RPC check endpoint failure");
      }
    } catch (err) {
      console.error("Error fetching live RPC status:", err);
    } finally {
      setIsPlayingRpcLoading(false);
    }
  };

  // Background Auto-Refresh and Settings States
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(() => {
    return localStorage.getItem("base_auto_refresh_enabled") !== "false";
  });
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);

  const [largeTxAlertsEnabled, setLargeTxAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("base_large_tx_alerts_enabled") === "true";
  });

  const handleToggleAlerts = (enabled: boolean) => {
    setLargeTxAlertsEnabled(enabled);
    localStorage.setItem("base_large_tx_alerts_enabled", enabled ? "true" : "false");

    if (enabled) {
      if (!("Notification" in window)) {
        triggerToast("Browser notifications not supported in this browser. Falling back to simple alerts.", "error");
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            triggerToast("Browser notifications enabled!", "success");
            try {
              new Notification("Base Ecosystem Hub", {
                body: "Large transaction alerts enabled successfully! You will be notified of transactions > $5,000 USD.",
              });
            } catch (e) {
              console.warn("Notification failed to send:", e);
            }
          } else {
            triggerToast("Notification permission was denied. Falling back to inline alerts.", "error");
          }
        });
      } else if (Notification.permission === "denied") {
        triggerToast("Notification permission is blocked. Please enable it in browser settings.", "error");
      } else {
        triggerToast("Large transaction notifications active!", "success");
      }
    } else {
      triggerToast("Large transaction alerts disabled.", "success");
    }
  };

  const checkAndAlertLargeTx = (tx: Transaction) => {
    if (!largeTxAlertsEnabled || tx.amountUSD <= 5000) return;

    const msg = `🚨 High-Value Outflow Recorded: $${tx.amountUSD.toLocaleString()} USD | Category: ${tx.category} | ${tx.description}`;

    // 1. Browser Notification API
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Large Outflow on Base!", {
          body: msg,
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.warn("Notification constructor failed:", e);
      }
    }

    // 2. Fallback alert box
    try {
      alert(msg);
    } catch (e) {
      console.warn("window.alert blocked:", e);
    }

    // 3. Dual UI visual Toast indication
    triggerToast(`Large Transaction Registered: $${tx.amountUSD.toLocaleString()} USD!`, "error");
  };

  // Run on mount
  useEffect(() => {
    fetchRpcStatus();
    fetchTokenPrices();
  }, []);

  // Sync background auto-refresh interval
  useEffect(() => {
    localStorage.setItem("base_auto_refresh_enabled", autoRefreshEnabled ? "true" : "false");
    
    if (!autoRefreshEnabled) {
      return;
    }

    const interval = setInterval(() => {
      fetchRpcStatus();
      fetchTokenPrices();
    }, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  // Custom DAO input modal / form
  const [showDaoModal, setShowDaoModal] = useState(false);
  const [newDaoName, setNewDaoName] = useState("");
  const [newDaoAddress, setNewDaoAddress] = useState("");
  const [newDaoDesc, setNewDaoDesc] = useState("");
  const [daoInputError, setDaoInputError] = useState("");
  const [isAddingDao, setIsAddingDao] = useState(false);

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem("base_daos_list", JSON.stringify(daos));
  }, [daos]);

  useEffect(() => {
    localStorage.setItem("base_daos_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("base_daos_budgets_map", JSON.stringify(budgetsMap));
  }, [budgetsMap]);

  useEffect(() => {
    localStorage.setItem("base_daos_proposals", JSON.stringify(proposals));
  }, [proposals]);

  // Track currently selected DAO
  const currentDao = daos.find((d) => d.id === currentDaoId) || daos[0];
  const currentBudgets = budgetsMap[currentDaoId] || [];

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Wallet Interaction Handlers (MetaMask, Coinbase Wallet, Base Wallet, Rabby, Phantom etc)
  const connectProvider = async (providerName: string, simAddress: string) => {
    // 1. Try real injection if present
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const eth = (window as any).ethereum;
        // Request accounts
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          const addr = accounts[0];
          setWalletAddress(addr);
          setWalletProvider(providerName);
          localStorage.setItem("connected_wallet_address", addr);
          localStorage.setItem("connected_wallet_provider", providerName);
          triggerToast(`Successfully connected real ${providerName} wallet: ${addr.substring(0, 6)}...${addr.substring(38)}!`);
          setShowWalletModal(false);
          return;
        }
      } catch (err: any) {
        console.warn("Real provider connect failed (or rejected), starting smart sandbox emulator...", err);
      }
    }

    // 2. Fallback simulation (interactive experience)
    triggerToast(`Connecting ${providerName} extension...`, "success");
    await new Promise((resolve) => setTimeout(resolve, 850)); // realistic extension lookup latency
    
    setWalletAddress(simAddress);
    setWalletProvider(providerName);
    localStorage.setItem("connected_wallet_address", simAddress);
    localStorage.setItem("connected_wallet_provider", providerName);
    triggerToast(`[Simulator] Connected ${providerName} Secure Session: ${simAddress.substring(0, 6)}...${simAddress.substring(38)}`);
    setShowWalletModal(false);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletProvider(null);
    setLoggedInEmail(null);
    localStorage.removeItem("connected_wallet_address");
    localStorage.removeItem("connected_wallet_provider");
    localStorage.removeItem("utils_logged_in_email");
    setShowActiveWalletMenu(false);
    triggerToast("Wallet session disconnected successfully.");
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    const email = emailInput.trim();
    const password = passwordInput.trim();

    if (!email || !password) {
      setAuthError("Email and Password fields are required.");
      return;
    }
    
    if (!email.includes("@") || email.length < 5) {
      setAuthError("Please insert a valid email address.");
      return;
    }
    
    if (password.length < 5) {
      setAuthError("Password must be at least 5 characters long.");
      return;
    }

    const savedAccountsStr = localStorage.getItem("base_daos_email_accounts");
    const accounts = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};

    if (emailSignUpMode) {
      // Sign Up action
      if (accounts[email.toLowerCase()]) {
        setAuthError("An account with this email address already exists.");
        return;
      }
      
      // Register account
      accounts[email.toLowerCase()] = password;
      localStorage.setItem("base_daos_email_accounts", JSON.stringify(accounts));
      
      const derived = deriveAddressFromEmail(email);
      setWalletAddress(derived);
      setWalletProvider("Email Login");
      setLoggedInEmail(email.toLowerCase());
      localStorage.setItem("connected_wallet_address", derived);
      localStorage.setItem("connected_wallet_provider", "Email Login");
      localStorage.setItem("utils_logged_in_email", email.toLowerCase());
      
      triggerToast("Account registered and authenticated successfully!", "success");
      setShowWalletModal(false);
      resetAuthForm();
    } else {
      // Sign In action
      const registeredPassword = accounts[email.toLowerCase()];
      if (!registeredPassword || registeredPassword !== password) {
        setAuthError("Invalid email or password combination.");
        return;
      }
      
      const derived = deriveAddressFromEmail(email);
      setWalletAddress(derived);
      setWalletProvider("Email Login");
      setLoggedInEmail(email.toLowerCase());
      localStorage.setItem("connected_wallet_address", derived);
      localStorage.setItem("connected_wallet_provider", "Email Login");
      localStorage.setItem("utils_logged_in_email", email.toLowerCase());
      
      triggerToast(`Welcome back, ${email}!`, "success");
      setShowWalletModal(false);
      resetAuthForm();
    }
  };

  const resetAuthForm = () => {
    setEmailInput("");
    setPasswordInput("");
    setAuthError("");
  };

  const handleWalletVerificationSign = async () => {
    setSignStatus("signing");
    setGeneratedSignature("");

    // Look for real provider if matches
    if (typeof window !== "undefined" && (window as any).ethereum && walletAddress) {
      try {
        const eth = (window as any).ethereum;
        // Standard personal sign request
        // Hex encode message
        const utf8Encoder = new TextEncoder();
        const hexMsg = "0x" + Array.from(utf8Encoder.encode(signMessage))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
          
        const sig = await eth.request({
          method: "personal_sign",
          params: [hexMsg, walletAddress],
        });
        
        setGeneratedSignature(sig);
        setSignStatus("success");
        triggerToast("Secured real cryptographic signature successfully!", "success");
        return;
      } catch (err: any) {
        console.warn("Real browser sign rejected or unavailable. Falling back on secure simulation.", err);
      }
    }

    // Interactive simulator delay
    await new Promise((resolve) => setTimeout(resolve, 1400));
    
    // Simulate ECDSA signature hash
    const fakeHash = "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setGeneratedSignature(fakeHash);
    setSignStatus("success");
    triggerToast("Challenge cryptographically simulated & verified!");
  };

  const adoptConnectedWalletAsDAO = () => {
    if (!walletAddress) return;
    
    // Check if DAO already exists
    const existing = daos.find((d) => d.address.toLowerCase() === walletAddress.toLowerCase());
    if (existing) {
      setCurrentDaoId(existing.id);
      triggerToast(`Switched active workspace scope to: ${existing.name}`);
      setShowActiveWalletMenu(false);
      return;
    }

    // Otherwise, generate a custom linked DAO configuration!
    const shortAddress = walletAddress.substring(0, 6) + "..." + walletAddress.substring(38);
    const newDaoName = `${walletProvider || "Web3"} Wallet (${shortAddress})`;
    const generatedId = `wallet-${Date.now().toString()}`;

    const createdDao: BaseDAO = {
      id: generatedId,
      name: newDaoName,
      address: walletAddress,
      description: `Active linked personal sandbox multisig account of connected ${walletProvider || "Web3"} user.`,
      network: "base-mainnet",
      ethBalance: 3.42, // default test funding
      usdcBalance: 1250.00,
      aeroBalance: 400.00,
      budgetCapUSD: 50000.00,
      isCustom: true,
    };

    const defaultBudgets: Budget[] = [
      { category: "Developer Grant", allocatedUSD: 15000, spentUSD: 0 },
      { category: "Marketing & Growth", allocatedUSD: 10000, spentUSD: 0 },
      { category: "Liquidity Provision", allocatedUSD: 10000, spentUSD: 0 },
      { category: "Security Audit", allocatedUSD: 5000, spentUSD: 0 },
      { category: "Core Contributors", allocatedUSD: 5000, spentUSD: 0 },
      { category: "Operations & Legal", allocatedUSD: 3000, spentUSD: 0 },
      { category: "Uncategorized", allocatedUSD: 2000, spentUSD: 0 }
    ];

    setDaos((prev) => [...prev, createdDao]);
    setBudgetsMap((prev) => ({ ...prev, [generatedId]: defaultBudgets }));
    setCurrentDaoId(generatedId);
    setShowActiveWalletMenu(false);
    triggerToast(`Custom interactive workspace built for linked wallet: ${shortAddress}!`);
  };

  // Add customized manually tracked transaction
  const handleAddTransaction = (newTx: Omit<Transaction, "id" | "timestamp" | "status">) => {
    const fullTx: Transaction = {
      ...newTx,
      id: "tx-" + Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: "Completed",
    };

    setTransactions((prev) => [fullTx, ...prev]);
    checkAndAlertLargeTx(fullTx);

    // Update corresponding category budget spending
    setBudgetsMap((prevMap) => {
      const currentDaoBudgets = prevMap[currentDaoId] || [];
      const updated = currentDaoBudgets.map((b) => {
        if (b.category === newTx.category) {
          return { ...b, spentUSD: b.spentUSD + newTx.amountUSD };
        }
        return b;
      });
      return { ...prevMap, [currentDaoId]: updated };
    });

    triggerToast(`Transaction recorded. Budget spent increased by $${newTx.amountUSD.toLocaleString()} USD!`);
  };

  const handleUpdateTransactionTags = (txId: string, tags: string[]) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, tags } : tx))
    );
  };

  const handleCreateProposal = (newProp: Omit<ProposalPlan, "id" | "votesSupport" | "votesOppose" | "votesAbstain" | "voterReceipts">) => {
    const fresh: ProposalPlan = {
      ...newProp,
      id: "prop-" + Date.now().toString(),
      votesSupport: 0,
      votesOppose: 0,
      votesAbstain: 0,
      voterReceipts: {}
    };
    setProposals(prev => [fresh, ...prev]);
    triggerToast(`Proposal "${fresh.title}" submitted to voting registry!`);
  };

  const handleVoteProposal = (propId: string, choice: "Support" | "Oppose" | "Abstain", voter: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== propId) return p;
      const receipts = { ...(p.voterReceipts || {}) };
      
      const prior = receipts[voter];
      if (prior === choice) return p;
      
      let vSupport = p.votesSupport;
      let vOppose = p.votesOppose;
      let vAbstain = p.votesAbstain;
      
      if (prior) {
        if (prior === "Support") vSupport--;
        if (prior === "Oppose") vOppose--;
        if (prior === "Abstain") vAbstain--;
      }
      
      if (choice === "Support") vSupport++;
      if (choice === "Oppose") vOppose++;
      if (choice === "Abstain") vAbstain++;
      
      receipts[voter] = choice;
      
      return {
        ...p,
        votesSupport: vSupport,
        votesOppose: vOppose,
        votesAbstain: vAbstain,
        voterReceipts: receipts
      };
    }));
    triggerToast(`Vote "${choice}" successfully cast!`);
  };

  const handleRejectProposalId = (propId: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id !== propId) return p;
      return { ...p, status: "Rejected" };
    }));
    triggerToast(`Proposal rejected successfully.`);
  };

  // Approve proposal and backlog into standard transaction history
  const handleApproveProposal = (
    proposal: ProposalPlan,
    evaluation: { category: TransactionCategory; riskScore: "Low" | "Medium" | "High"; explanation: string }
  ) => {
    // Translate value in USD
    let computedUSD = proposal.amountETH;
    if (proposal.tokenSymbol === "ETH") computedUSD = proposal.amountETH * ethPriceUSD;
    if (proposal.tokenSymbol === "AERO") computedUSD = proposal.amountETH * aeroPriceUSD;

    const mockHash = "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...dc" + Math.floor(Math.random() * 9 + 1);

    const newTx: Transaction = {
      id: "tx-prop-" + Date.now().toString(),
      daoId: currentDaoId,
      hash: mockHash,
      timestamp: proposal.occurredAt || new Date().toISOString(),
      recipient: proposal.recipient,
      amountETH: proposal.tokenSymbol === "ETH" ? proposal.amountETH : 0,
      amountUSD: Number(computedUSD.toFixed(2)),
      tokenSymbol: proposal.tokenSymbol,
      category: evaluation.category,
      description: `Disbursal approved for proposal: "${proposal.title}". AI evaluation note: ${evaluation.explanation}`,
      proposalId: "AID-" + Math.floor(Math.random() * 900 + 100),
      status: "Completed",
      riskScore: evaluation.riskScore,
      spentBy: proposal.spentBy || "DAO Core Team Member",
      occurredAt: proposal.occurredAt || new Date().toISOString()
    };

    setTransactions((prev) => [newTx, ...prev]);
    checkAndAlertLargeTx(newTx);

    // Update corresponding category spent value
    setBudgetsMap((prevMap) => {
      const currentDaoBudgets = prevMap[currentDaoId] || [];
      const updated = currentDaoBudgets.map((b) => {
        if (b.category === evaluation.category) {
          return { ...b, spentUSD: b.spentUSD + computedUSD };
        }
        return b;
      });
      return { ...prevMap, [currentDaoId]: updated };
    });

    triggerToast(`Approved & Outflow recorded successfully under hash: ${mockHash}!`);
    setActiveTab("transactions");
  };

  const handleExecuteProposal = (proposal: ProposalPlan) => {
    // Translate value in USD
    let computedUSD = proposal.amountETH;
    if (proposal.tokenSymbol === "ETH") computedUSD = proposal.amountETH * ethPriceUSD;
    if (proposal.tokenSymbol === "AERO") computedUSD = proposal.amountETH * aeroPriceUSD;

    const mockHash = "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...dc" + Math.floor(Math.random() * 9 + 1);

    const newTx: Transaction = {
      id: "tx-prop-" + Date.now().toString(),
      daoId: currentDaoId,
      hash: mockHash,
      timestamp: proposal.occurredAt || new Date().toISOString(),
      recipient: proposal.recipient,
      amountETH: proposal.tokenSymbol === "ETH" ? proposal.amountETH : 0,
      amountUSD: Number(computedUSD.toFixed(2)),
      tokenSymbol: proposal.tokenSymbol,
      category: proposal.category,
      description: `Disbursal approved after successful voting consensus: "${proposal.title}". AI evaluation note: ${proposal.riskExplanation || "Evaluated Safe"}`,
      proposalId: proposal.id,
      status: "Completed",
      riskScore: proposal.riskScore || "Low",
      spentBy: proposal.spentBy || "DAO Core Team Member",
      occurredAt: proposal.occurredAt || new Date().toISOString()
    };

    setTransactions((prev) => [newTx, ...prev]);
    checkAndAlertLargeTx(newTx);

    // Update corresponding category spent value
    setBudgetsMap((prevMap) => {
      const currentDaoBudgets = prevMap[currentDaoId] || [];
      const updated = currentDaoBudgets.map((b) => {
        if (b.category === proposal.category) {
          return { ...b, spentUSD: b.spentUSD + computedUSD };
        }
        return b;
      });
      return { ...prevMap, [currentDaoId]: updated };
    });

    // Mark proposal status as Approved
    setProposals(prev => prev.map(p => {
      if (p.id === proposal.id) {
        return { ...p, status: "Approved" };
      }
      return p;
    }));

    triggerToast(`Proposal executed! Outflow recorded: ${mockHash}!`);
    setActiveTab("transactions");
  };

  // 4. Load real-world balance from Base blockchain RPC via server endpoint!
  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false);

  const refreshOnChainBalances = async () => {
    setIsRefreshingBalances(true);
    try {
      const response = await fetch(`/api/onchain-balances?address=${currentDao.address}`);
      if (!response.ok) {
        throw new Error("Unable to contact live blockchain rpc node.");
      }
      const data = await response.json();
      
      // Update targeted DAO values
      setDaos((prev) =>
        prev.map((d) => {
          if (d.address.toLowerCase() === currentDao.address.toLowerCase()) {
            return {
              ...d,
              ethBalance: data.ethBalance,
              usdcBalance: data.usdcBalance,
              aeroBalance: data.aeroBalance,
            };
          }
          return d;
        })
      );
      triggerToast(`Flashed latest Base blockchain block balances for multisig vault!`);
    } catch (error: any) {
      console.error(error);
      triggerToast(`Could not query Base Mainnet: falling back on cached balances.`, "error");
    } finally {
      setIsRefreshingBalances(false);
    }
  };

  // Run on DAO profile transitions
  useEffect(() => {
    if (currentDao) {
      refreshOnChainBalances();
    }
  }, [currentDaoId]);

  // Hook input to craft new custom DAO profiles
  const handleAddNewDao = async (e: React.FormEvent) => {
    e.preventDefault();
    setDaoInputError("");
    setIsAddingDao(true);

    if (!newDaoName.trim()) {
      setDaoInputError("Please supply a recognizable DAO title name.");
      setIsAddingDao(false);
      return;
    }

    if (!newDaoAddress.startsWith("0x") || newDaoAddress.length !== 42) {
      setDaoInputError("Valid Base Address must start with 0x and be 42 chars long.");
      setIsAddingDao(false);
      return;
    }

    try {
      // Direct lookup from Base public blockchain RPC during creation!
      const response = await fetch(`/api/onchain-balances?address=${newDaoAddress}`);
      let ethBal = 0;
      let usdcBal = 0;
      let aeroBal = 0;

      if (response.ok) {
        const data = await response.json();
        ethBal = data.ethBalance;
        usdcBal = data.usdcBalance;
        aeroBal = data.aeroBalance;
      }

      const generatedId = newDaoName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const createdDao: BaseDAO = {
        id: generatedId,
        name: newDaoName,
        address: newDaoAddress,
        description: newDaoDesc.trim() || "User connected custom on-chain contract.",
        network: "base-mainnet",
        ethBalance: ethBal,
        usdcBalance: usdcBal,
        aeroBalance: aeroBal,
        budgetCapUSD: 100000.00,
        isCustom: true,
      };

      // Set empty categories budget for custom entries
      const defaultBudgets: Budget[] = [
        { category: "Developer Grant", allocatedUSD: 30000, spentUSD: 0 },
        { category: "Marketing & Growth", allocatedUSD: 20000, spentUSD: 0 },
        { category: "Liquidity Provision", allocatedUSD: 20000, spentUSD: 0 },
        { category: "Security Audit", allocatedUSD: 10000, spentUSD: 0 },
        { category: "Core Contributors", allocatedUSD: 10000, spentUSD: 0 },
        { category: "Operations & Legal", allocatedUSD: 5000, spentUSD: 0 },
        { category: "Uncategorized", allocatedUSD: 5000, spentUSD: 0 }
      ];

      setDaos((prev) => [...prev, createdDao]);
      setBudgetsMap((prev) => ({ ...prev, [generatedId]: defaultBudgets }));
      setCurrentDaoId(generatedId);
      
      triggerToast(`DAO "${newDaoName}" linked. Real-time balance synced from Base!`);
      
      // Cleanup
      setNewDaoName("");
      setNewDaoAddress("");
      setNewDaoDesc("");
      setShowDaoModal(false);
    } catch (e: any) {
      setDaoInputError("Failed to fetch balance. Verify network internet connectivity.");
    } finally {
      setIsAddingDao(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="base-dao-tracker-root">
      {/* Toast notifications */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border transition-all duration-300 flex items-center gap-2.5 animate-in slide-in-from-top-4 ${
            toast.type === "success" 
              ? "bg-white border-emerald-500/30 text-emerald-800 shadow-md" 
              : "bg-white border-rose-500/30 text-rose-800 shadow-md"
          }`}
          id="system-notification-toast"
        >
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span className="text-xs font-semibold font-mono tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Main Header navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 group relative cursor-pointer" onClick={() => setCurrentDaoId(daos[0]?.id || "purple-dao")}>
              <svg viewBox="0 0 40 40" fill="none" className="w-full h-full transition-transform duration-500 group-hover:rotate-180">
                <circle cx="20" cy="20" r="20" fill="#0052FF"/>
                <circle cx="20" cy="20" r="10" stroke="white" strokeWidth="3.5" fill="none"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 font-sans flex items-center gap-1">
                  <span className="text-[#0052FF]">BASE</span>
                  <span className="text-slate-900 font-bold font-mono tracking-tight text-[15px] uppercase">Ecosystem Hub</span>
                </h1>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/50 font-mono tracking-wide">
                  Mainnet L2
                </span>
              </div>
              <p className="text-xs text-slate-505 font-sans mt-0.5">Visualized multisig treasuries, active allocations, and instant AI financial audits.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live RPC Status Badge */}
            <button
              onClick={() => {
                fetchRpcStatus();
                setShowRpcModal(true);
              }}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
              title="Click to view Base Mainnet RPC configuration"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-700">Base RPC {rpcStatus?.blockNumber ? `#${rpcStatus.blockNumber}` : ""}</span>
            </button>

            {/* Real asset prices ticker */}
            <div className="hidden md:flex items-center gap-3 text-[10px] font-mono bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 shadow-sm relative group">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isPriceLoading ? "animate-pulse bg-amber-500" : ""}`} />
                <span className="text-slate-500 font-bold">ETH:</span>
                <span className="text-slate-850 font-bold">${ethPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-cyan-500 ${isPriceLoading ? "animate-pulse bg-amber-500" : ""}`} />
                <span className="text-slate-500 font-bold">AERO:</span>
                <span className="text-slate-855 font-bold">${aeroPriceUSD.toFixed(3)}</span>
              </div>
              <span className="text-slate-300">|</span>
              <button 
                onClick={fetchTokenPrices} 
                disabled={isPriceLoading}
                title={`Last updated ${priceTimestamp || "just now"} via ${priceSource}. Click to refresh current live market rates.`}
                className="hover:text-indigo-600 focus:outline-none flex items-center gap-1 font-bold text-[9.5px] text-indigo-500 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isPriceLoading ? "animate-spin text-amber-500" : ""}`} />
                <span className="text-[10px] hidden lg:inline tracking-wider uppercase">{isPriceLoading ? "Syncing..." : "Live"}</span>
              </button>
            </div>

            {walletAddress ? (
              <div className="relative">
                <button
                  onClick={() => setShowActiveWalletMenu(!showActiveWalletMenu)}
                  className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-semibold font-mono transition cursor-pointer shadow-sm"
                  title={`Connected via ${walletProvider}`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[11.5px] font-bold tracking-tight">
                    {renderWalletIcon(walletProvider || "", "w-3.5 h-3.5 flex-shrink-0")}
                    <span className="text-slate-700">{walletProvider ? walletProvider.split(' ')[0] : "Wallet"}:</span>
                    <span className="text-indigo-600 font-bold">{walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</span>
                  </div>
                </button>
                
                {showActiveWalletMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in-95 slide-in-from-top-2 duration-150">
                    <div className="text-center pb-2.5 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                        {walletProvider === "Email Login" ? "Authenticated Session" : "Active Wallet Connection"}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        {renderWalletIcon(walletProvider || "", "w-4 h-4 flex-shrink-0")}
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                          {walletProvider === "Email Login" && loggedInEmail ? loggedInEmail : `${walletProvider} Node`}
                        </p>
                      </div>
                      <p className="text-[9px] font-mono text-slate-500 truncate bg-slate-50 border border-slate-100 p-1 mt-1.5 rounded select-all font-semibold" title={walletAddress || ""}>
                        {walletAddress}
                      </p>
                    </div>
                    
                    <div className="space-y-1.5 text-xs">
                      <button
                        onClick={adoptConnectedWalletAsDAO}
                        className="w-full text-left font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span>Observe Treasury balances</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowSignModal(true);
                          setShowActiveWalletMenu(false);
                        }}
                        className="w-full text-left font-semibold text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Key className="w-4 h-4 text-indigo-500" />
                        <span>Sign verification challenge</span>
                      </button>

                      <button
                        onClick={disconnectWallet}
                        className="w-full text-left font-semibold text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition flex items-center gap-2 border-t border-slate-100 pt-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm font-mono tracking-wide"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connect Wallet</span>
              </button>
            )}

            <button
              onClick={() => setShowDaoModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Link Custom Address</span>
            </button>

            {/* Custom Settings Gear & Dropdown popover */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                className={`p-2 rounded-lg border text-slate-700 transition cursor-pointer shadow-sm ${
                  showSettingsPopover ? "bg-slate-100 border-indigo-300 text-indigo-600" : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                }`}
                title="Application Settings & Custom Refreshes"
                id="application-settings-trigger"
              >
                <Settings className={`w-4 h-4 ${showSettingsPopover ? "rotate-45" : ""} transition-transform duration-200`} />
              </button>

              {showSettingsPopover && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in-95 slide-in-from-top-2 duration-150"
                  id="application-settings-dropdown"
                >
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-bold">Preferences</p>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 pb-2">
                    <div className="pr-2">
                      <span className="text-xs font-bold text-slate-800 block">30s Auto-Refresh</span>
                      <span className="text-[10px] text-slate-400 font-medium block leading-none mt-1">Background core updates</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={autoRefreshEnabled} 
                        onChange={(e) => {
                          setAutoRefreshEnabled(e.target.checked);
                          triggerToast(e.target.checked ? "Background updates active (30s)" : "Background updates suspended", "success");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 pb-2">
                    <div className="pr-2">
                      <span className="text-xs font-bold text-slate-800 block">Large Tx Alerts</span>
                      <span className="text-[10px] text-slate-400 font-medium block leading-none mt-1">Browser alerts for &gt;$5,000 USD</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={largeTxAlertsEnabled} 
                        onChange={(e) => {
                          handleToggleAlerts(e.target.checked);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">
                    When active, live spot rates refresh every 30s. Turn on Large Tx Alerts to receive instant browser notifications when transactions exceeds $5,000 USD.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Base Ecosystem Hub Hero Banner & Filters */}
        <div className="space-y-6" id="base-ecosystem-directory-panel">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0052FF] to-[#0038B8] text-white p-6 md:p-8 shadow-xl shadow-blue-500/10">
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-blue-400 opacity-20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-indigo-500 opacity-15 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Base Ecosystem Directory
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
                  Explore Projects Building on Base
                </h2>
                <p className="text-xs md:text-sm text-blue-105 max-w-xl font-sans font-medium">
                  Track dynamic treasury allocations, view verified multi-sig keys, and compile AI compliance reviews. Select any active collective workspace below to inspect detailed data sheets.
                </p>
              </div>
              <button
                onClick={() => setShowDaoModal(true)}
                className="bg-white hover:bg-slate-50 text-[#0052FF] font-bold text-xs font-mono px-4.5 py-3 rounded-xl transition shadow flex items-center gap-2 group cursor-pointer self-start md:self-auto shrink-0"
              >
                <Plus className="w-4 h-4 transition duration-300 group-hover:rotate-90" />
                <span>Track Custom Address</span>
              </button>
            </div>
          </div>

          {/* Search, filters, categories bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100/60 p-4 border border-slate-205 rounded-2xl">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-450" />
              </div>
              <input
                type="text"
                placeholder="Search collectives or contract strings..."
                value={daoSearchQuery}
                onChange={(e) => setDaoSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs pl-9 pr-8 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-sans shadow-sm"
              />
              {daoSearchQuery && (
                <button
                  onClick={() => setDaoSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-655 text-[10px] font-bold font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: "all", label: "All Collectives" },
                { id: "social", label: "Social & Media" },
                { id: "nft", label: "NFTs & Arts" },
                { id: "developers", label: "Developer Guilds" },
                { id: "custom", label: "Tracks ★" }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setDaoCategoryFilter(pill.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition cursor-pointer ${
                    daoCategoryFilter === pill.id
                      ? "bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/10 z-10"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Base collectives */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {daos.filter((dao) => {
              const matchesSearch = 
                dao.name.toLowerCase().includes(daoSearchQuery.toLowerCase()) || 
                dao.description.toLowerCase().includes(daoSearchQuery.toLowerCase()) ||
                dao.address.toLowerCase().includes(daoSearchQuery.toLowerCase());
              
              if (daoCategoryFilter === "all") return matchesSearch;
              if (daoCategoryFilter === "social") return matchesSearch && (dao.category === "social" || dao.id === "purple-dao");
              if (daoCategoryFilter === "nft") return matchesSearch && (dao.category === "nft" || dao.id === "based-nouns");
              if (daoCategoryFilter === "developers") return matchesSearch && (dao.category === "developers" || dao.id === "base-builders");
              if (daoCategoryFilter === "custom") return matchesSearch && dao.isCustom;
              return matchesSearch;
            }).map((dao) => {
              const isSelected = dao.id === currentDaoId;
              const category = 
                dao.id === "purple-dao" ? "Social Collective" : 
                dao.id === "based-nouns" ? "Meme & Art Studio" : 
                dao.id === "base-builders" ? "Developer Guild" : 
                dao.id === "aerodrome" ? "DeFi Liquidity Hub" : 
                dao.id === "virtuals" ? "AI Agent Network" : 
                dao.id === "warpcast" ? "Social Protocol" : 
                dao.id === "basepaint" ? "Collaborative Art" : 
                dao.id === "degen-dao" ? "Community L3" : 
                dao.id === "talent" ? "Builders Network" : "Personal Sandbox";
              
              const budgets = budgetsMap[dao.id] || [];
              const spentUSD = budgets.reduce((acc, b) => acc + b.spentUSD, 0);
              const allocatedUSD = budgets.reduce((acc, b) => acc + b.allocatedUSD, 0);
              const percentUsed = allocatedUSD > 0 ? (spentUSD / allocatedUSD) * 100 : 0;
              
              return (
                <div
                  key={dao.id}
                  onClick={() => {
                    setCurrentDaoId(dao.id);
                    triggerToast(`Active workspace connected: ${dao.name}`, "success");
                  }}
                  className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-tr from-white to-blue-50/20 border-2 border-[#0052FF] shadow-lg shadow-blue-500/5 ring-4 ring-[#0052FF]/5 scale-[1.01]"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-[#0052FF] text-white text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow flex items-center gap-1 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      Selected
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3.5">
                      {renderDaoAvatar(dao.id, "w-11 h-11 flex-shrink-0")}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 truncate font-sans">{dao.name}</h4>
                          {dao.isCustom && <span className="text-[10px] text-amber-500">★</span>}
                        </div>
                        <span className="text-[10px] font-mono text-slate-405 font-bold tracking-wider uppercase">
                          {category}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-sans mt-3 line-clamp-2 leading-relaxed">
                      {dao.description}
                    </p>

                    <div className="grid grid-cols-3 gap-1.5 mt-4 bg-slate-50 border border-slate-100 p-2 rounded-xl text-center">
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono block">ETH Balance</span>
                        <span className="text-[11px] font-mono font-bold text-slate-700">{dao.ethBalance.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono block">USDC Balance</span>
                        <span className="text-[11px] font-mono font-bold text-slate-700">
                          {dao.usdcBalance >= 1000 ? `${(dao.usdcBalance / 1000).toFixed(0)}k` : dao.usdcBalance}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono block">AERO Balance</span>
                        <span className="text-[11px] font-mono font-bold text-slate-700">
                          {dao.aeroBalance >= 1000 ? `${(dao.aeroBalance / 1000).toFixed(0)}k` : dao.aeroBalance}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[9.5px] font-mono">
                        <span className="text-slate-400">Budget Spent</span>
                        <span className="font-bold text-slate-700">
                          ${spentUSD.toLocaleString()} / ${allocatedUSD.toLocaleString()} ({Math.min(100, Math.round(percentUsed))}% Used)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentUsed > 80 ? "bg-rose-500" : percentUsed > 55 ? "bg-amber-500" : "bg-[#0052FF]"
                          }`}
                          style={{ width: `${Math.min(100, percentUsed)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
                    <span className="font-mono text-slate-450 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100" title={dao.address}>
                      {dao.address.substring(0, 6)}...{dao.address.substring(38)}
                    </span>
                    <span className="text-[#0052FF] font-bold group-hover:translate-x-1 transition duration-200 flex items-center gap-0.5 font-mono uppercase tracking-wider">
                      {isSelected ? "Active ✓" : "Enter Project Workspace →"}
                    </span>
                  </div>
                </div>
              );
            })}
            {daos.filter((dao) => {
              const matchesSearch = 
                dao.name.toLowerCase().includes(daoSearchQuery.toLowerCase()) || 
                dao.description.toLowerCase().includes(daoSearchQuery.toLowerCase()) ||
                dao.address.toLowerCase().includes(daoSearchQuery.toLowerCase());
              
              if (daoCategoryFilter === "all") return matchesSearch;
              if (daoCategoryFilter === "social") return matchesSearch && (dao.category === "social" || dao.id === "purple-dao");
              if (daoCategoryFilter === "nft") return matchesSearch && (dao.category === "nft" || dao.id === "based-nouns");
              if (daoCategoryFilter === "developers") return matchesSearch && (dao.category === "developers" || dao.id === "base-builders");
              if (daoCategoryFilter === "custom") return matchesSearch && dao.isCustom;
              return matchesSearch;
            }).length === 0 && (
              <div className="col-span-1 md:col-span-3 text-center py-10 bg-slate-100/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-sans font-bold text-slate-500">No matching Base collectives registered.</p>
                <p className="text-xs text-slate-400 mt-1">Refine your search term or register a customized workspace wallet.</p>
                <button
                  onClick={() => {
                    setDaoSearchQuery("");
                    setDaoCategoryFilter("all");
                  }}
                  className="mt-3.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 transition cursor-pointer font-sans"
                >
                  Reset Directory
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Workspace Operations Detail Area */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-5 shadow-sm" id="active-workspace-operations-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              {renderDaoAvatar(currentDao.id, "w-11 h-11 flex-shrink-0")}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-sans">
                    {currentDao.name} Workspace
                  </h3>
                  <span className="text-[10px] font-mono bg-blue-50 text-[#0052FF] border border-blue-105 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                    Live Session
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 text-xs font-mono text-slate-500 mt-0.5">
                  <span className="text-indigo-600 font-bold select-all">{currentDao.address}</span>
                  <span className="text-slate-200">|</span>
                  <span className="font-sans font-medium">{currentDao.description}</span>
                </div>
              </div>
            </div>

            {/* Premium Workspace tab selector buttons */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "overview" ? "bg-slate-900 text-white shadow-md animate-fade-in" : "text-slate-605 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("transactions")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "transactions" ? "bg-slate-900 text-white shadow-md animate-fade-in" : "text-slate-605 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Block Ledger</span>
              </button>

              <button
                onClick={() => setActiveTab("proposal")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "proposal" ? "bg-slate-900 text-white shadow-md animate-fade-in" : "text-slate-605 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Proposal Assessment</span>
              </button>

              <button
                onClick={() => setActiveTab("ai-analyst")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "ai-analyst" ? "bg-slate-900 text-white shadow-md animate-fade-in" : "text-slate-605 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Audit</span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "analytics" ? "bg-slate-900 text-white shadow-md animate-fade-in" : "text-slate-605 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Financial Analytics</span>
              </button>
            </div>
          </div>

        {/* Tab content routing switches */}
        <div id="routed-tab-display">
          {activeTab === "overview" && (
            <TreasuryOverview
              currentDao={currentDao}
              budgets={currentBudgets}
              transactions={transactions}
              ethPriceUSD={ethPriceUSD}
              aeroPriceUSD={aeroPriceUSD}
              onRefreshOnChain={refreshOnChainBalances}
              isRefreshingBalances={isRefreshingBalances}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionPanel
              currentDao={currentDao}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onUpdateTransactionTags={handleUpdateTransactionTags}
              ethPriceUSD={ethPriceUSD}
              aeroPriceUSD={aeroPriceUSD}
              connectedWalletAddress={walletAddress}
            />
          )}

          {activeTab === "proposal" && (
            <ProposalAssessment
              currentDaoId={currentDao.id}
              onApproveProposal={handleApproveProposal}
              ethPriceUSD={ethPriceUSD}
              aeroPriceUSD={aeroPriceUSD}
              proposals={proposals}
              onCreateProposal={handleCreateProposal}
              onVoteProposal={handleVoteProposal}
              onExecuteApprovedProposal={handleExecuteProposal}
              onRejectProposal={handleRejectProposalId}
              connectedWalletAddress={walletAddress}
            />
          )}

          {activeTab === "ai-analyst" && (
            <AIAnalyst
              currentDao={currentDao}
              transactions={transactions}
              budgets={currentBudgets}
              isApiKeyConfigured={true}
            />
          )}

          {activeTab === "analytics" && (
            <ReportingAnalytics
              currentDao={currentDao}
              transactions={transactions}
              budgets={currentBudgets}
              ethPriceUSD={ethPriceUSD}
              aeroPriceUSD={aeroPriceUSD}
            />
          )}
        </div>
      </div>

      </main>

      {/* Custom DAO Setup overlay modal popup */}
      {showDaoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200 relative shadow-xl text-slate-800"
            id="link-address-modal-popup"
          >
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 font-sans">Track Custom Base Wallet Address</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter any valid Ethereum / Base contract, multisig, or developer wallet address to scan and pull actual live balances dynamically.
              </p>
            </div>

            <form onSubmit={handleAddNewDao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">DAO Workspace Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Based Developers Guild"
                  value={newDaoName}
                  onChange={(e) => setNewDaoName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Contract / Multi-sig Address</label>
                <input
                  type="text"
                  required
                  placeholder="0x..."
                  value={newDaoAddress}
                  onChange={(e) => setNewDaoAddress(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 font-mono">Workspace Description</label>
                <input
                  type="text"
                  placeholder="e.g. Creator fund for Base scaling art works."
                  value={newDaoDesc}
                  onChange={(e) => setNewDaoDesc(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 w-full focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {daoInputError && (
                <p className="text-xs text-rose-600 font-mono">{daoInputError}</p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDaoModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-mono transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isAddingDao}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isAddingDao ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Reading Base RPC...</span>
                    </>
                  ) : (
                    <span>Register Wallet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Base Mainnet Status Footer & Stats Bar */}
      <footer className="mt-auto border-t border-slate-250 bg-white px-6 py-4 shadow-sm" id="application-status-footer-bar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500 font-sans">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center md:justify-start font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Network: <strong className="text-slate-800 font-bold">Base Mainnet</strong> (Chain: <span className="font-bold text-blue-600">8453</span>)</span>
            </div>
            <span className="hidden sm:inline text-slate-200">|</span>
            <div className="flex items-center gap-1.5" title="Base RPC node address">
              <span>RPC Hub:</span>
              <span className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-600 select-all">https://mainnet.base.org</span>
            </div>
            {rpcStatus && rpcStatus.blockNumber !== null && rpcStatus.blockNumber !== undefined && (
              <>
                <span className="hidden sm:inline text-slate-200">|</span>
                <div className="flex items-center gap-1">
                  <span>Block Height:</span>
                  <span className="text-slate-800 font-bold">#{rpcStatus.blockNumber.toLocaleString()}</span>
                </div>
              </>
            )}
            {rpcStatus && rpcStatus.gasPriceGwei !== null && rpcStatus.gasPriceGwei !== undefined && (
              <>
                <span className="hidden sm:inline text-slate-200">|</span>
                <div className="flex items-center gap-1" title="Gas price in Gwei">
                  <span>Gas:</span>
                  <span className="text-amber-600 font-bold">{rpcStatus.gasPriceGwei} Gwei</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-5 justify-center font-mono">
            <a 
              href="https://base.blockscout.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-850 hover:underline transition flex items-center gap-1 text-[11px] font-semibold"
            >
              <span>Block Explorer</span>
              <span className="text-[10px]">↗</span>
            </a>
            <span className="text-slate-200">|</span>
            <span className="text-[10px] text-slate-400">© On-chain Planner & Auditor</span>
          </div>
        </div>
      </footer>

      {/* Base RPC Configuration Detail Modal */}
      {showRpcModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg animate-in zoom-in-95 duration-200 relative shadow-2xl text-slate-800 font-sans"
            id="base-rpc-config-modal"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 font-mono tracking-wide uppercase">On-chain L2 Connection details</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Current State: Connected & Synchronized</p>
                </div>
              </div>
              <button
                onClick={() => setShowRpcModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Core parameter card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase block">Network Name</span>
                    <span className="text-xs font-bold text-slate-800">Base Mainnet</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase block">Chain Identifier</span>
                    <span className="text-xs font-bold font-mono text-blue-600">8453</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/65 pt-2">
                  <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase block">Network Description</span>
                  <span className="text-xs text-slate-600 leading-relaxed block">
                    The public mainnet for Base. Flashblocks-enabled. Rate limited and not for production systems.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200/65 pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase block">Currency Symbol</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 font-sans">ETH</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase block">Block Explorer</span>
                    <a 
                      href="https://base.blockscout.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition font-mono flex items-center gap-1 mt-0.5"
                    >
                      <span>base.blockscout.com</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Dynamic RPC live telemetry metrics */}
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden font-mono text-xs">
                <div className="bg-slate-50/50 p-3 flex justify-between items-center">
                  <span className="text-slate-500">RPC Endpoint URL</span>
                  <span className="font-semibold text-slate-800 select-all">https://mainnet.base.org</span>
                </div>
                
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-500">Dynamic Block Height</span>
                  <span className="font-bold text-slate-800 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                    {isPlayingRpcLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : rpcStatus?.blockNumber ? (
                      `#${rpcStatus.blockNumber.toLocaleString()}`
                    ) : (
                      "Offline"
                    )}
                  </span>
                </div>

                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-500">Current L2 Gas Price</span>
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                    {isPlayingRpcLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : rpcStatus && rpcStatus.gasPriceGwei !== null && rpcStatus.gasPriceGwei !== undefined ? (
                      `${rpcStatus.gasPriceGwei} Gwei`
                    ) : (
                      "Unavailable"
                    )}
                  </span>
                </div>

                <div className="p-3 flex justify-between items-center bg-slate-50/50">
                  <span className="text-slate-500">Last Evaluated</span>
                  <span className="text-slate-400 text-[10px]">
                    {rpcStatus?.timestamp ? new Date(rpcStatus.timestamp).toLocaleString() : "Never"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={fetchRpcStatus}
                disabled={isPlayingRpcLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-705 px-4 py-2 rounded-lg text-xs font-mono font-medium tracking-wide transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPlayingRpcLoading ? "animate-spin" : ""}`} />
                <span>Test Endpoint</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRpcModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Provider Wallet Connect Center Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200 relative shadow-2xl text-slate-800 font-sans"
            id="multi-provider-wallet-connect-modal"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Wallet className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 font-mono tracking-wide uppercase">DAO Authenticator</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Sign in with Web3 or securely using your email</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  resetAuthForm();
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Custom Tab Selection Header */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 border border-slate-200 bg-slate-50 rounded-xl mb-5 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => {
                  setConnectModalTab("wallet");
                  resetAuthForm();
                }}
                className={`py-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  connectModalTab === "wallet" 
                    ? "bg-white text-indigo-600 shadow" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-slate-550" />
                <span>Web3 Connect</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setConnectModalTab("email");
                  resetAuthForm();
                }}
                className={`py-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  connectModalTab === "email" 
                    ? "bg-white text-indigo-600 shadow" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-slate-550" />
                <span>Email Sign In</span>
              </button>
            </div>

            {connectModalTab === "wallet" ? (
              <div className="space-y-4">
                {/* Check browser extension detection */}
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 font-mono ${
                  typeof window !== "undefined" && (window as any).ethereum 
                    ? "bg-emerald-50 border border-emerald-250/30 text-emerald-800" 
                    : "bg-amber-50 border border-amber-250/30 text-amber-800"
                }`}>
                  <div className="w-2 h-2 rounded-full animate-ping bg-current" />
                  <span>
                    {typeof window !== "undefined" && (window as any).ethereum 
                      ? "✓ Injected Provider detected in browser." 
                      : "ℹ Sandboxed Sandbox Mode: Simulating secure provider handshakes."}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* MetaMask Option */}
                  <button
                    onClick={() => connectProvider("MetaMask", "0x64c8E681d6B29618f2D898399Cc640A0D3b20755")}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition text-left cursor-pointer group animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      {renderWalletIcon("MetaMask", "w-7 h-7 group-hover:scale-110 transition duration-200 flex-shrink-0")}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block font-sans">MetaMask Wallet</span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">Connect standard browser extension</span>
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-slate-600 text-xs font-semibold font-mono">→</span>
                  </button>

                  {/* Coinbase Wallet Option */}
                  <button
                    onClick={() => connectProvider("Coinbase Wallet", "0xcDed5f36eE27A2F6dbE341B88B2c5A3beD1D5f36")}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {renderWalletIcon("Coinbase Wallet", "w-7 h-7 group-hover:scale-110 transition duration-200 flex-shrink-0")}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block font-sans">Coinbase Wallet</span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">Ecosystem hub & mobile app link</span>
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-slate-600 text-xs font-semibold font-mono">→</span>
                  </button>

                  {/* Base Wallet Option */}
                  <button
                    onClick={() => connectProvider("Base Wallet", "0x8453b36ee27A2F6DbE341B88B2c5A3bed1d5E19A")}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {renderWalletIcon("Base Wallet", "w-7 h-7 group-hover:scale-110 transition duration-200 flex-shrink-0")}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block font-sans">Base Developer Wallet</span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">Optimized L2 developer gateway account</span>
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-slate-600 text-xs font-semibold font-mono">→</span>
                  </button>
                </div>

                {/* Paste custom wallet address */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <label className="block text-[10px] font-mono text-slate-405 uppercase font-bold mb-1.5">Or connect custom Base Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x..."
                      value={customSimWalletAddress}
                      onChange={(e) => setCustomSimWalletAddress(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (customSimWalletAddress.startsWith("0x") && customSimWalletAddress.length === 42) {
                          connectProvider("Custom Address", customSimWalletAddress);
                          setCustomSimWalletAddress("");
                        } else {
                          triggerToast("Please enter a valid 42-character Hex address starting with 0x", "error");
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
                    >
                      Link
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Email Credentials authentication portal */
              <form onSubmit={handleEmailAuth} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="space-y-1">
                  <p className="text-[10.5px] text-slate-705 font-mono bg-indigo-50 border border-indigo-120/40 p-2.5 rounded-lg leading-relaxed">
                    ⚙️ Email registrations are stored inside sandbox local session structures. A secure, distinct Base EVM key address is derived deterministically from your credentials.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1.5">Corporate or Personal Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-450" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="e.g. member@basedao.org"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1.5 flex justify-between">
                    <span>Secured Password String</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-450" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs pl-9 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <p className="text-[11px] font-mono font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                    ⚠️ {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs font-mono py-2.5 rounded-lg transition cursor-pointer shadow flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{emailSignUpMode ? "Register & Instantiate Member Keys" : "Unlock Workspace Access"}</span>
                </button>

                <div className="text-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailSignUpMode(!emailSignUpMode);
                      setAuthError("");
                    }}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-sans font-medium hover:underline cursor-pointer"
                  >
                    {emailSignUpMode 
                      ? "Already have an email credential? Sign In instead" 
                      : "First time here? Register / Sign Up a new email account"}
                  </button>
                </div>
              </form>
            )}

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowWalletModal(false);
                  resetAuthForm();
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-705 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Verification Challenge Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg animate-in zoom-in-95 duration-200 relative shadow-2xl text-slate-800 font-sans"
            id="signature-verification-modal"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Key className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-955 font-mono tracking-wide uppercase">Cryptographic Message Board</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Secure ECDSA challenge verification</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSignModal(false);
                  setSignStatus("idle");
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-100 p-3.5 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Signer Origin:</span>
                  <span className="font-bold text-slate-800">{walletProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Address:</span>
                  <span className="font-bold text-blue-600 truncate max-w-[200px]">{walletAddress}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wide mb-1.5">Verification Message</label>
                <textarea
                  rows={3}
                  value={signMessage}
                  onChange={(e) => setSignMessage(e.target.value)}
                  className="w-full bg-slate-50 font-mono text-xs p-3 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="Insert challenge text to cryptographically hash..."
                />
              </div>

              {signStatus === "signing" && (
                <div className="bg-indigo-50/55 border border-indigo-150 p-4 rounded-xl text-center space-y-2 animate-pulse">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-indigo-850 font-mono font-semibold animate-pulse">Broadcasting handshake request to {walletProvider} host...</p>
                </div>
              )}

              {signStatus === "success" && generatedSignature && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  <div className="bg-emerald-50 border border-emerald-250 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-850 text-xs font-bold animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Authorization Code Verified successfully</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">ECDSA checksum verified with connected public key.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wide mb-1.5 flex justify-between">
                      <span>Cryptographic Signature Hash</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedSignature);
                          triggerToast("Signature hash copied to clipboard!");
                        }}
                        className="text-[9px] text-blue-600 hover:underline cursor-pointer lowercase"
                      >
                        copy hash
                      </button>
                    </label>
                    <div className="bg-slate-900 text-amber-400 font-mono text-[9px] p-3 rounded-lg break-all select-all leading-relaxed shadow-inner max-h-24 overflow-y-auto">
                      {generatedSignature}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-mono text-slate-400">Security Standard: EIP-191</span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignModal(false);
                    setSignStatus("idle");
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-705 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleWalletVerificationSign}
                  disabled={signStatus === "signing"}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{signStatus === "success" ? "Re-sign Challenge" : "Sign Message"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
