import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry headers
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// Base Mainnet public RPC node selector
const BASE_RPC_URL = "https://mainnet.base.org";
const USDC_CONTRACT = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const AERO_CONTRACT = "0x940181a94a35a4569e4529a3cdfb74e38fd98631";

// Helper to perform fetch requests with a specific milliseconds timeout limit (prevents backend hanging)
async function fetchWithTimeout(url: string, options: any = {}) {
  const { timeout = 2500, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: controller.signal
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Helper to check valid hex addresses
function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

// Fetch balance helper
async function queryBaseRPC(method: string, params: any[]) {
  try {
    const response = await fetchWithTimeout(BASE_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: Date.now()
      }),
      timeout: 5000
    });
    const json = await response.json();
    return json?.result;
  } catch (error) {
    console.error(`Error querying Base RPC method ${method}:`, error);
    return null;
  }
}

// ERC20 Balance query
async function queryERC20Balance(contractAddress: string, walletAddress: string) {
  try {
    const cleanWallet = walletAddress.toLowerCase().replace("0x", "").padStart(64, "0");
    const data = "0x70a08231" + cleanWallet; // balanceOf(address) selector
    const result = await queryBaseRPC("eth_call", [
      { to: contractAddress, data },
      "latest"
    ]);
    if (!result || result === "0x") return 0;
    return BigInt(result);
  } catch (err) {
    console.error("ERC20 lookup error:", err);
    return BigInt(0);
  }
}

// 1. API: Get DAO live on-chain balances
app.get("/api/onchain-balances", async (req, res) => {
  const account = req.query.address as string;
  
  if (!account || !isValidAddress(account)) {
    return res.status(400).json({ error: "Invalid or missing Base address format." });
  }

  try {
    // 1. Fetch ETH balance
    const ethHex = await queryBaseRPC("eth_getBalance", [account, "latest"]);
    let ethBalance = 0;
    if (ethHex) {
      ethBalance = Number(BigInt(ethHex)) / 1e18;
    }

    // 2. Fetch USDC (Decimals: 6)
    const usdcRaw = await queryERC20Balance(USDC_CONTRACT, account);
    const usdcBalance = Number(usdcRaw) / 1e6;

    // 3. Fetch AERO (Decimals: 18)
    const aeroRaw = await queryERC20Balance(AERO_CONTRACT, account);
    const aeroBalance = Number(aeroRaw) / 1e18;

    res.json({
      address: account,
      ethBalance: Number(ethBalance.toFixed(4)),
      usdcBalance: Number(usdcBalance.toFixed(2)),
      aeroBalance: Number(aeroBalance.toFixed(2))
    });
  } catch (error: any) {
    console.error("Failed to fetch on-chain balances", error);
    res.status(500).json({ error: "Could not read data from Base Blockchain." });
  }
});

// 1ab. API: Fetch actual live transaction logs from Blockscout for a specified wallet address
app.get("/api/address-transactions", async (req, res) => {
  const account = req.query.address as string;
  if (!account || !isValidAddress(account)) {
    return res.status(400).json({ error: "Invalid or missing Base address format." });
  }

  try {
    const url = `https://base.blockscout.com/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&page=1&offset=40&sort=desc`;
    const response = await fetchWithTimeout(url, { timeout: 4000 });
    if (!response.ok) {
      throw new Error(`Blockscout API returned HTTP code ${response.status}`);
    }
    const data = await response.json();
    
    if (data && Array.isArray(data.result)) {
      const formattedTxns = data.result.map((item: any) => {
        const valETH = Number(BigInt(item.value || "0")) / 1e18;
        const gasPriceGwei = Number(BigInt(item.gasPrice || "0")) / 1e9;
        
        let txMethod = "Transfer";
        if (item.functionName) {
          txMethod = item.functionName.split("(")[0];
        } else if (item.input && item.input !== "0x") {
          txMethod = item.input.slice(0, 10);
        }

        return {
          hash: item.hash,
          blockNumber: Number(item.blockNumber),
          timestamp: Number(item.timeStamp) * 1000, 
          from: item.from,
          to: item.to || "Contract Creation",
          valueETH: Number(valETH.toFixed(6)),
          gasUsed: Number(item.gasUsed || "0"),
          gasPriceGwei: Number(gasPriceGwei.toFixed(2)),
          isError: item.isError === "1",
          status: item.isError === "1" ? "Failed" : "Success",
          methodName: txMethod
        };
      });
      return res.json({ status: "Success", transactions: formattedTxns });
    } else {
      return res.json({ status: "Empty", transactions: [], message: data?.message || "No transactions found." });
    }
  } catch (err: any) {
    console.error("Failed to fetch Blockscout transaction history:", err);
    res.status(500).json({ error: "Could not fetch dynamic transactions from Blockscout." });
  }
});

// 1b. API: Fetch Base Mainnet RPC connection status & block details
app.get("/api/rpc-status", async (req, res) => {
  try {
    const blockHex = await queryBaseRPC("eth_blockNumber", []);
    const gasHex = await queryBaseRPC("eth_gasPrice", []);
    
    const blockNumber = blockHex ? Number(BigInt(blockHex)) : null;
    const gasPriceGwei = gasHex ? Number(BigInt(gasHex)) / 1e9 : null;
    
    res.json({
      status: "Ok",
      networkName: "Base Mainnet",
      description: "The public mainnet for Base. Flashblocks-enabled. Rate limited and not for production systems.",
      rpcUrl: BASE_RPC_URL,
      chainId: 8453,
      currencySymbol: "ETH",
      blockExplorer: "https://base.blockscout.com",
      blockNumber,
      gasPriceGwei: gasPriceGwei ? Number(gasPriceGwei.toFixed(2)) : null,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Failed to query Base RPC status:", error);
    res.status(500).json({ 
      status: "Error", 
      message: "Could not fetch active block data from Base RPC." 
    });
  }
});

// 1c. API: Fetch active token prices (ETH & AERO) with fallback safety
app.get("/api/token-prices", async (req, res) => {
  let ethPrice = 3254.80;
  let aeroPrice = 0.84;
  let source = "Fallback presets";

  try {
    // Attempt 1: Fetch from Coinbase API with AbortTimeout safety
    const ethRes = await fetchWithTimeout("https://api.coinbase.com/v2/prices/ETH-USD/spot", { timeout: 2000 }).catch(() => null);
    const aeroRes = await fetchWithTimeout("https://api.coinbase.com/v2/prices/AERO-USD/spot", { timeout: 2000 }).catch(() => null);

    if (ethRes && ethRes.ok && aeroRes && aeroRes.ok) {
      const ethJson = await ethRes.json();
      const aeroJson = await aeroRes.json();

      const parsedEth = parseFloat(ethJson?.data?.amount);
      const parsedAero = parseFloat(aeroJson?.data?.amount);

      if (!isNaN(parsedEth) && !isNaN(parsedAero) && parsedEth > 0 && parsedAero > 0) {
        ethPrice = parsedEth;
        aeroPrice = parsedAero;
        source = "Coinbase Spot API";
      }
    } else {
      // Attempt 2: CoinGecko simple price with fallback safety
      const cgRes = await fetchWithTimeout("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,aerodrome&vs_currencies=usd", { timeout: 2000 }).catch(() => null);
      if (cgRes && cgRes.ok) {
        const cgJson = await cgRes.json();
        const parsedEth = parseFloat(cgJson?.ethereum?.usd);
        const parsedAero = parseFloat(cgJson?.aerodrome?.usd);

        if (!isNaN(parsedEth) && !isNaN(parsedAero) && parsedEth > 0 && parsedAero > 0) {
          ethPrice = parsedEth;
          aeroPrice = parsedAero;
          source = "CoinGecko API";
        }
      }
    }
  } catch (error) {
    console.error("Error fetching token prices:", error);
  }

  res.json({
    status: "Success",
    ethPrice: Number(ethPrice.toFixed(2)),
    aeroPrice: Number(aeroPrice.toFixed(4)),
    source,
    timestamp: new Date().toISOString()
  });
});

// 2. API: Gemini Treasury Audit
app.post("/api/gemini/analyze-treasury", async (req, res) => {
  if (!ai) {
    return res.status(500).json({ 
      error: "Gemini API key is not configured. Please supply a key in Settings > Secrets." 
    });
  }

  const { daoName, balances, transactions, budgets } = req.body;

  const prompt = `
    You are an expert on-chain Financial Risk Analyst for Web3 DAOs, specialized in the Base Ecosystem structure (Layer 2, Aerodrome/AERO utility, grants-driven growth).
    
    Review this DAO state:
    DAO Name: ${daoName}
    Current Treasury Balances:
    - ETH: ${balances.ethBalance}
    - USDC: ${balances.usdcBalance}
    - AERO: ${balances.aeroBalance}
    
    Category Budgets Allocation & Spending (USD):
    ${JSON.stringify(budgets)}

    Recent Transactions (historical and planned):
    ${JSON.stringify(transactions)}

    Please perform a detailed, executive Treasury Audit in markdown:
    1. **Overview & Treasury Health**: Grade the stability (diversity of assets, reliance on AERO, stablecoin reserves).
    2. **Budget Safety Analysis**: Identify categories exceeding limits or nearing exhausting budgets.
    3. **On-chain Transaction Audit**: Point out any higher-risk transactions (e.g. transfers of huge size without accompanying proposals, or unexplained high outflows).
    4. **Smart Expense Recommendations**: Suggest 3 tactical treasury rebalancings or policies tailored specifically for the Base network (like deploying liquidity pools on Aerodrome for yield generation or increasing stablecoin margins).
    
    Keep the tone highly professional, precise, clean, and directly constructive.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional blockchain treasury officer and corporate auditor for decentralized autonomous organizations."
      }
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini context run failed:", error);
    res.status(500).json({ error: "AI review failed to generate: " + (error?.message || error) });
  }
});

// 3. API: Gemini Proposal Assessment & Category Suggestion
app.post("/api/gemini/evaluate-payout", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API Key is not configured in Settings > Secrets."
    });
  }

  const { proposal } = req.body;

  const prompt = `
    Analyze the following proposed treasury disbursal from a DAO:
    - Title: "${proposal.title}"
    - Recipient Address: "${proposal.recipient}"
    - Amount: ${proposal.amountETH} ${proposal.tokenSymbol}
    - Stated Rationale: "${proposal.rationale}"
    - Category Input: "${proposal.category}"

    Analyze and output a brief analysis:
    - **Suggested Category Adjustment** (validate if the chosen category is optimal, if not suggest from 'Developer Grant', 'Marketing & Growth', 'Liquidity Provision', 'Security Audit', 'Core Contributors', 'Operations & Legal', 'Uncategorized')
    - **Risk Flag** (Low, Medium, or High, stating reasons like missing milestones, unverified recipient, or amount relative to general standards)
    - **Audit Feedback**: A 2-3 sentence financial review of the disbursement risk and merit.

    Compile your answer into a valid JSON object structure with the following fields:
    {
      "recommendedCategory": string,
      "riskScore": "Low" | "Medium" | "High",
      "riskExplanation": string,
      "auditMeritAnalysis": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a JSON financial risk evaluator. Always yield stringified valid JSON mapping to the requested schema. Do not output wrappers outside JSON."
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini evaluative task failed:", error);
    res.status(500).json({ error: "Failed to evaluate transaction draft." });
  }
});

// Setup development server or production assets
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully at http://localhost:${PORT}`);
  });
}

bootstrap();
