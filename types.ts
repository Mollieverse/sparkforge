export interface Project {
  name: string;
  ticker: string;
  description: string;
  vibe: string;
  audience: string;
  stage: string;
  website?: string;
  twitter?: string;
}

export interface GeneratedAsset {
  id: string;
  type: string;
  content: string;
  createdAt: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  assets: GeneratedAsset[];
  timestamp: number;
}

export interface AssetMeta {
  emoji: string;
  color: string;
  description: string;
}

export const ASSET_META: Record<string, AssetMeta> = {
  "Twitter Post":          { emoji: "🐦", color: "#1DA1F2", description: "X / Twitter content" },
  "Twitter Thread":        { emoji: "🧵", color: "#1DA1F2", description: "Multi-tweet thread" },
  "Pump.fun Description":  { emoji: "🚀", color: "#FF6B35", description: "Token launch copy" },
  "Launch Announcement":   { emoji: "📣", color: "#FF4D94", description: "Project announcement" },
  "Discord Message":       { emoji: "💬", color: "#5865F2", description: "Discord community post" },
  "Telegram Blast":        { emoji: "✈️", color: "#229ED9", description: "Telegram announcement" },
  "Mascot Concept":        { emoji: "🦊", color: "#00E5C0", description: "Brand mascot idea" },
  "Brand Story":           { emoji: "📖", color: "#7B2CBF", description: "Origin & narrative" },
  "Tokenomics Hook":       { emoji: "📊", color: "#FFD700", description: "Tokenomics narrative" },
  "Meme Concept":          { emoji: "😂", color: "#FF4500", description: "Viral meme idea" },
  "Community CTA":         { emoji: "🔥", color: "#FF4D94", description: "Call to action" },
  "Twitter Bio":           { emoji: "✨", color: "#00E5C0", description: "Profile bio copy" },
  "Whitepaper Summary":    { emoji: "📄", color: "#8888BB", description: "Executive summary" },
  "Airdrop Campaign":      { emoji: "🪂", color: "#00E5C0", description: "Airdrop announcement" },
  "VC Pitch":              { emoji: "💼", color: "#7B2CBF", description: "Investor pitch copy" },
};

export const getAssetMeta = (type: string): AssetMeta =>
  ASSET_META[type] ?? { emoji: "⚡", color: "#7B2CBF", description: "Marketing asset" };

export const VIBES = [
  "🌊 Smooth & Premium",
  "⚡ Aggressive Degen",
  "🧠 Intellectual Alpha",
  "🎮 Gamified & Fun",
  "🐉 Mythological Epic",
  "🤖 AI & Futuristic",
  "🌙 Mysterious & Cult",
  "💎 Luxury Diamond",
  "🦅 Bold & Patriotic",
  "🌿 Eco & Sustainable",
];

export const STAGES = [
  "Idea Stage",
  "Stealth Mode",
  "Pre-Launch",
  "Live on Pump.fun",
  "Raydium Listed",
  "Scaling Up",
  "Series A+",
];

export const QUICK_PROMPTS = [
  { label: "🚀 Launch Tweet", prompt: "Write me a viral launch tweet thread for my project. Make it hype and Solana-native." },
  { label: "🎯 Pump.fun Desc", prompt: "Write a killer Pump.fun token description that drives FOMO and makes people ape in." },
  { label: "🦊 Mascot Idea", prompt: "Design a detailed mascot concept for my brand including personality, backstory, and visual description." },
  { label: "📣 TG Announcement", prompt: "Write a Telegram community announcement blast for our upcoming launch." },
  { label: "💎 Brand Story", prompt: "Craft our brand origin story — something emotional and authentic that resonates with the Solana community." },
  { label: "📊 Tokenomics Hook", prompt: "Write a compelling tokenomics narrative that makes our distribution model sound bullish." },
  { label: "🔥 Discord CTA", prompt: "Write a Discord server announcement with CTAs to drive engagement and grow our community." },
  { label: "🧵 Twitter Thread", prompt: "Write a 10-tweet alpha thread explaining why our project is the best play on Solana right now." },
  { label: "🪂 Airdrop Campaign", prompt: "Write a full airdrop campaign announcement with tasks, eligibility, and hype copy." },
  { label: "💼 VC Pitch Blurb", prompt: "Write a 3-sentence investor pitch that we could use for a cold DM to crypto VCs." },
];
