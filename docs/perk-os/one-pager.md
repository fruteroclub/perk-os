# PerkOS

PerkOSThe Operating System for Community Rewards

One agent per community • Every platform • Pay-per-use • Fully open infrastructureEvent Presentation Document – November 30, 2025

(8–10 minute talk or one-pager handout)

1. The Problem – 2025 RealityIn 2025, every serious community has a treasury (tokens, USDC, revenue share), but almost none of them can actually use it without pain.

- Rewarding top contributors → manual spreadsheets + custom scripts
- Running a tournament or prediction game → 5–12 different tools that don’t talk to each other
- Tracking who is active across Discord, Telegram, Twitch, and Kick → basically impossible
- Existing tools charge $99–$999/month even if you run one event per quarter
- 87 % of community treasuries are still sitting idle (2025 on-chain data)

Admins are burned out. Momentum dies. Treasuries rot.

2. The Vision – PerkOS Is Becoming the Infrastructure Layer (Live Today)PerkOS is the open, x402-native operating system that turns any treasury into real-time, automated engagement.Two tightly integrated layers – both shipping today:Layer 1 – PerkOS AgentEvery community launches its own fully sovereign AI agent in under 60 seconds.

- Community-owned wallet, memory, rules, and on-chain ERC-8004 reputation
- Single identity across Discord • Telegram • Twitch • Kick • Twitter/X (more added monthly)
- Speaks and acts like the best human mod you’ve ever had
- Accepts natural-language instructions from admins and members

Layer 2 – PerkOS Marketplace (the x402 services bazaar) – Live November 2025Open directory where any developer registers payable APIs in <5 minutes.

Agents discover, compare, and consume services on the fly – paying only for what they use via x402 micropayments.Services already live or in final testing (November 30, 2025):

- Instant airdrops (1–100 000 wallets) – 4 competing providers
- Real-time leaderboards & streak detectors
- Tournament & prediction game engines
- GitHub / GitLab contribution auto-scoring
- Twitch + Kick raid / view milestone trackers
- On-chain achievement NFTs (multiple styles)
- Sybil-resistant analytics (Passport, Worldcoin, on-chain history)
- Automated revenue-share splitters

3. Live Demo Flow – Works Identically on Every PlatformAdmin types (in Discord, Telegram, or Twitch chat):

“PerkOS, run a $1 000 USDC weekend tournament – top 3 split 70/20/10”PerkOS Agent instantly:

1. Posts registration + rules across all connected platforms
2. Spins up live leaderboard (Marketplace cost: $0.04)
3. Tracks results in real time
4. Calls the current cheapest airdrop provider on Base ($0.019)
5. Pays winners and posts on-chain receipts
6. Updates every member’s cross-platform profile

Total cost to community: ~$0.06 + prize pool

Total admin time: one sentence

4. Technical Architecture – Shipping Today

```
Community Treasury (any EVM + Solana)
          ↓
PerkOS Agent (sovereign instance per community)
          ↓
x402 Middleware (open-source facilitator)
          ↓
PerkOS Marketplace (Bazaar – live discovery registry)
          ↓
Vendor APIs (30+ services live, 100+ in pipeline)
          ↓
Instant x402 settlement + ERC-8004 reputation update
```

- Primary chain: Base (USDC) – lowest x402 fees in 2025
- Multi-chain live: Arbitrum, Polygon, Optimism, Solana (added Oct 2025)
- Middleware & spec: github.com/perkos-protocol (MIT license)

5. Competitive Landscape – 2025| Feature | PerkOS | Zealy/Galxe/TaskOn | Guild.xyz | Collab.Land | Custom dev team |
   |-------------------------------------------|-------------|----------------————|-----------|-------------|-----------------|
   | Sovereign agent per community | Yes | No | No | No | Sometimes |
   | Discord + TG + Twitch + Kick + X | Yes | No | Partial | Discord only| Manual |
   | Real pay-per-use via x402 | Yes | No | No | No | — |
   | Open third-party service marketplace | Yes | No | No | No | No |
   | Natural language commands in chat | Yes | No | No | No | Rare |
   | ERC-8004 reputation for agents | Yes | No | No | No | No |
   | Treasury-native from day 1 | Yes | No | No | No | Yes |

6. Business Model – Pure Alignment

- PerkOS takes 8–12 % on every x402 transaction flowing through the Marketplace (standard marketplace take rate)
- Agents & middleware are completely free and open-source
- Revenue scales 1:1 with actual community activity – no one pays when idle

7. One SentencePerkOS is becoming the AWS + Stripe + Zapier for onchain communities – the infrastructure layer every treasury will run on in 2026.

Launch your agent → PerkOS.xyz

Build a service → docs.PerkOS.xyz
