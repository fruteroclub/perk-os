# Community Directory Feature - Implementation Specification

> **Project**: Frutero Community Agent (kukulcán/k7)
> **Epic**: Community Member Registration & Directory
> **Hackathon**: Avalanche (with EVM-compatibility support)
> **Timeline**: 5-day MVP implementation

---

## 📋 User Story

**Primary**:
*As a Community Manager, I want to allow Community Members to register through the Community Agent, so we can have a Member directory.*

**Secondary** (Post-MVP):
*As a Community Manager, I want to identify the most active members of my community, so that I can reward them with community tokens.*

---

## 🎯 Requirements (From Discovery Q&A)

### Platform
- **Primary**: Telegram (MVP)
- **Future**: Discord, Twitch, Kick, GitHub (database schema ready)

### Registration Approach
- **Hybrid**: Command trigger + conversational data collection
- **Flow**: User types `/register` → Agent guides through conversation
- **Data Collection**: Single message with structured format

### Data Fields
Required information from members:
1. **Name**: Alias, nickname, or pseudonym
2. **Telegram Username**: Captured automatically
3. **Role**: student, developer, growth, creator, founder, community, designer, artist
4. **Organization**: Company/community/project affiliation
5. **Country**: Member's country
6. **Favorite Fruit**: Community-specific fun question 🍎
7. **Wallet Address**: EVM address for onchain verification

### Onchain Verification
- **Network**: Avalanche C-Chain (primary), support for other EVM chains
- **ERC20 Token Check**: Minimum balance requirement
- **NFT Ownership**: Bonus verification for POAPs, community NFTs
- **Payment**: x402 registration fee in community token

### Privacy & Compliance
- **Privacy Policy**: Acceptance required before registration
- **Data Rights**: Request deletion anytime
- **Transparency**: Clear data usage explanation

---

## 🗂️ Data Model

### Member Profile

```typescript
interface CommunityMember {
  // Core Identity
  id: string;                          // UUID
  member_id: string;                   // Human-readable ID (e.g., #247)

  // Platform Identities
  telegram_id: string;                 // Telegram user ID (primary for MVP)
  telegram_username: string;           // @username
  discord_id?: string;                 // Future
  twitch_id?: string;                  // Future
  kick_id?: string;                    // Future
  github_username?: string;            // Future

  // Public Profile
  name: string;                        // Alias/nickname
  primary_role: MemberRole;
  organization: string;
  country: string;
  favorite_fruit: string;              // Community custom field

  // Onchain Verification
  wallet_address?: string;             // Primary EVM address
  chain: string;                       // "avalanche", "ethereum", etc.
  chain_id: number;                    // Avalanche C-Chain: 43114 (mainnet), 43113 (testnet)
  token_balance: number;
  nft_holdings: NFTHolding[];
  verification_status: VerificationStatus;
  verification_date?: Date;

  // Privacy & Compliance
  privacy_policy_accepted: boolean;
  privacy_policy_accepted_at: Date;
  privacy_policy_version: string;

  // Registration Metadata
  registered_at: Date;
  registration_source: PlatformType;   // "telegram"
  registration_fee_paid: boolean;
  registration_fee_amount: number;
  registration_fee_tx?: string;        // Transaction hash
  registration_fee_chain_id?: number;  // Chain ID where registration fee was paid

  // Engagement & Rewards (Foundation)
  engagement_score: number;
  platform_engagement: PlatformEngagement[];
  last_active_at: Date;
  contribution_count: number;
  total_rewards_received: number;

  // System
  status: MemberStatus;                // active, suspended, pending
  created_at: Date;
  updated_at: Date;
}

enum MemberRole {
  STUDENT = "student",
  DEVELOPER = "developer",
  GROWTH = "growth",
  CREATOR = "creator",
  FOUNDER = "founder",
  COMMUNITY = "community",
  DESIGNER = "designer",
  ARTIST = "artist",
}

enum PlatformType {
  TELEGRAM = "telegram",
  DISCORD = "discord",
  TWITCH = "twitch",
  KICK = "kick",
  GITHUB = "github",
}

enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  FAILED = "failed",
}

enum MemberStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

interface NFTHolding {
  contract_address: string;
  token_id?: string;
  type: "POAP" | "ERC721" | "ERC1155";
  chain: string;                       // "avalanche", "ethereum", etc.
  chain_id: number;                    // Network chain ID
  verified_at: Date;
}

interface PlatformEngagement {
  platform: PlatformType;
  score: number;
  last_active: Date;
  contribution_count: number;
  metadata: Record<string, any>;
}
```

---

## 💬 Conversational Flow

### Design Principles
- **kukulcán Personality**: Warm, welcoming, tech-chamanic energy
- **Hybrid Approach**: Command trigger + conversational guidance
- **Clear Instructions**: Show format examples
- **Error Handling**: Helpful corrections, retry options
- **Transparency**: Explain onchain operations

### Registration Flow

#### 1. Trigger Detection

**User initiates**:
- Command: `/register`, `!register`, `register`
- Natural language: "I want to join", "how do I sign up?"

**Agent Response**:
```
¡Hola! Welcome to Frutero 🍉

I'm kukulcán (k7), your Community Agent.

Let's get you registered. This is quick and opens the door to:
• Member profile in our directory
• Eligibility for community rewards
• Recognition for your contributions
• Access to exclusive features

The process takes about 2 minutes. I'll guide you step by step.

Ready? Type 'yes' to continue or 'cancel' anytime.
```

#### 2. Privacy & Overview

**User**: `yes`

**Agent**:
```
Perfect! Let me explain what happens:

**Registration Process:**
1. **Privacy Policy**: Quick acceptance (required)
   - Your data is yours, request deletion anytime
   - Policy: https://frutero.com/privacy

2. **Your Info**: One message with all details
   - Name, role, organization, country, favorite fruit
   - Your wallet address for verification

3. **Onchain Verification** (Avalanche C-Chain):
   - Minimum token balance check
   - NFT ownership (POAPs, community tokens) - bonus!

4. **Registration Fee**: Small payment in community tokens
   - Keeps spam away, goes to community treasury
   - Processed via x402 micropayments

**Why this matters**: You're not just joining a chat. You get a unified identity that works across all our platforms (Discord, Telegram, Twitch coming soon!). Your contributions anywhere earn recognition everywhere.

Type 'accept' to agree to privacy terms, or 'cancel' to stop.
```

#### 3. Data Collection

**User**: `accept`

**Agent**:
```
✅ Privacy policy accepted! Recorded at [timestamp]

Now, let's collect your info in one go:

**Format:**
Name: [your alias/nickname]
Role: [student/developer/growth/creator/founder/community/designer/artist]
Organization: [company/community/project]
Country: [your country]
Favorite fruit: [fun question! 🍎]
Wallet: [your EVM address - Avalanche C-Chain or compatible]

**Example:**
Name: Digital Quetzal
Role: developer
Organization: Frutero
Country: Mexico
Favorite fruit: mango
Wallet: 0x1234567890abcdef1234567890abcdef12345678

Reply with your info in this format!
```

#### 4. Verification & Completion

**User submits data**:
```
Name: CryptoBuilder
Role: developer
Organization: BuildDAO
Country: Argentina
Favorite fruit: strawberry
Wallet: 0xABCD1234567890abcdef1234567890ABCDEF5678
```

**Agent Processing**:
```
Excelente! Verifying your info...

🔍 **Parsing data...**
✅ Name: CryptoBuilder
✅ Role: Developer
✅ Organization: BuildDAO
✅ Country: Argentina
✅ Favorite fruit: Strawberry 🍓

📡 **Connecting to Avalanche C-Chain...**
⏳ Checking wallet: 0xABCD...5678

[Onchain verification...]

✅ **Wallet verified!**
- Address: 0xABCD...5678 (Avalanche C-Chain)
- Token Balance: 150 tokens ✨
- Required minimum: 10 tokens ✅
- NFT Holdings found: 2 POAPs 🎫

💸 **Processing registration fee...**
Charging 10 tokens to community treasury...
Transaction: 0x8f9e2...abc123
Status: Confirmed ✅

🎉 **Welcome to Frutero, CryptoBuilder!**

You're now member #247!

**Your profile:**
- Member ID: #247
- Telegram: @CryptoBuilder
- Wallet: 0xABCD...5678 (verified ✅)
- Status: Active Member
- Engagement Score: 10 points (starting)

**What's next:**
📂 View profile: https://frutero.com/members/CryptoBuilder
🏆 Leaderboard: https://frutero.com/leaderboard

¡Bienvenido to the community! 🍉✨
```

---

## 🔧 Technical Architecture

### Plugin Structure

```
src/plugins/communityDirectory/
├── index.ts                      # Plugin export
├── actions/
│   ├── register.ts              # Registration flow
│   └── directory.ts             # Directory queries
├── services/
│   ├── verification.ts          # Onchain verification (Avalanche)
│   └── payment.ts               # x402 payment processing
├── providers/
│   └── analytics.ts             # Member statistics
├── types/
│   └── index.ts                 # TypeScript interfaces
└── utils/
    ├── validation.ts            # Input validation
    └── formatting.ts            # Response formatting
```

### Plugin Definition

```typescript
// src/plugins/communityDirectory/index.ts
import { Plugin } from "@elizaos/core";
import { registrationAction } from "./actions/register";
import { directoryAction } from "./actions/directory";
import { verificationService } from "./services/verification";
import { paymentService } from "./services/payment";
import { analyticsProvider } from "./providers/analytics";

export const communityDirectoryPlugin: Plugin = {
  name: "community-directory",
  description: "Community member registration and directory with onchain verification",

  actions: [
    registrationAction,        // /register command & flow
    directoryAction,          // /directory, /members commands
  ],

  providers: [
    analyticsProvider,        // Member stats & engagement
  ],

  services: [
    verificationService,      // Avalanche onchain verification
    paymentService,           // x402 payment processing
  ],
};
```

### Conversation State Machine

```typescript
enum RegistrationState {
  IDLE = "idle",
  AWAITING_CONFIRMATION = "awaiting_confirmation",
  AWAITING_PRIVACY_ACCEPT = "awaiting_privacy_accept",
  AWAITING_DATA = "awaiting_data",
  VERIFYING = "verifying",
  PROCESSING_PAYMENT = "processing_payment",
  COMPLETED = "completed",
  ERROR = "error",
}

interface RegistrationSession {
  userId: string;
  telegramId: string;
  state: RegistrationState;
  data?: Partial<RegistrationData>;
  errors?: string[];
  startedAt: Date;
  expiresAt: Date;           // 15 minutes timeout
}
```

---

## 🔗 Blockchain Integration

### Network Configuration

**Primary Chain**: Avalanche C-Chain
- **Chain ID**: 43114 (Mainnet) / 43113 (Fuji Testnet)
- **RPC**: https://api.avax.network/ext/bc/C/rpc
- **Explorer**: https://snowtrace.io

**EVM Compatibility**: Architecture supports other EVM chains
- Ethereum, Polygon, Base, Arbitrum, etc.
- Chain detection via wallet address format
- Multi-chain NFT verification

**Supported Chain IDs**:
| Network | Chain ID (Mainnet) | Chain ID (Testnet) |
|---------|-------------------|-------------------|
| Avalanche C-Chain | 43114 | 43113 (Fuji) |
| Ethereum | 1 | 11155111 (Sepolia) |
| Polygon | 137 | 80002 (Amoy) |
| Base | 8453 | 84532 (Sepolia) |
| Arbitrum One | 42161 | 421614 (Sepolia) |
| Optimism | 10 | 11155420 (Sepolia) |

### Onchain Verification Service

```typescript
class OnchainVerificationService extends Service {
  static serviceType = "onchain-verification";

  private provider: ethers.JsonRpcProvider;
  private tokenContract: ethers.Contract;

  async initialize(runtime: IAgentRuntime): Promise<void> {
    // Connect to Avalanche C-Chain
    this.provider = new ethers.JsonRpcProvider(
      process.env.AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc"
    );

    // Initialize community token contract
    this.tokenContract = new ethers.Contract(
      process.env.COMMUNITY_TOKEN_ADDRESS!,
      ERC20_ABI,
      this.provider
    );
  }

  async verifyTokenBalance(
    address: string,
    minBalance: number
  ): Promise<{ valid: boolean; balance: number }> {
    const balance = await this.tokenContract.balanceOf(address);
    const formattedBalance = parseFloat(ethers.formatEther(balance));

    return {
      valid: formattedBalance >= minBalance,
      balance: formattedBalance,
    };
  }

  async verifyNFTOwnership(
    address: string,
    contracts: string[]
  ): Promise<NFTHolding[]> {
    const holdings: NFTHolding[] = [];

    for (const contractAddress of contracts) {
      const nfts = await this.queryNFTBalance(address, contractAddress);
      holdings.push(...nfts);
    }

    return holdings;
  }

  async getVerificationStatus(address: string): Promise<VerificationResult> {
    const [tokenCheck, nftCheck] = await Promise.all([
      this.verifyTokenBalance(address, MIN_TOKEN_BALANCE),
      this.verifyNFTOwnership(address, COMMUNITY_NFT_CONTRACTS),
    ]);

    return {
      wallet: address,
      chain: "avalanche",
      chainId: 43114,  // Avalanche C-Chain mainnet
      tokenBalance: tokenCheck.balance,
      tokenVerified: tokenCheck.valid,
      nftHoldings: nftCheck,
      verified: tokenCheck.valid,
      verifiedAt: new Date(),
    };
  }
}
```

### x402 Payment Service

```typescript
class X402PaymentService extends Service {
  static serviceType = "x402-payment";

  async processRegistrationFee(
    fromWallet: string,
    amount: number,
    metadata: RegistrationMetadata
  ): Promise<PaymentResult> {
    const payment = await this.x402Client.createPayment({
      from: fromWallet,
      to: COMMUNITY_TREASURY_ADDRESS,
      amount: amount,
      token: COMMUNITY_TOKEN_SYMBOL,
      chain: "avalanche",
      chainId: 43114,  // Avalanche C-Chain mainnet
      description: "Community registration fee",
      metadata: {
        member_telegram_id: metadata.telegram_id,
        registration_timestamp: metadata.timestamp,
        service: "community-registration",
      },
    });

    const receipt = await payment.wait();

    return {
      success: receipt.status === "confirmed",
      txHash: receipt.transactionHash,
      amount: amount,
      chain: "avalanche",
      chainId: 43114,
      explorerUrl: `https://snowtrace.io/tx/${receipt.transactionHash}`,
    };
  }
}
```

---

## 💾 Database Schema

### PostgreSQL Tables

```sql
-- Main members table
CREATE TABLE community_members (
  -- Core Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id VARCHAR(50) UNIQUE NOT NULL,

  -- Platform Identities
  telegram_id VARCHAR(100) UNIQUE NOT NULL,
  telegram_username VARCHAR(100),
  discord_id VARCHAR(100) UNIQUE,
  twitch_id VARCHAR(100) UNIQUE,
  kick_id VARCHAR(100) UNIQUE,
  github_username VARCHAR(100),

  -- Public Profile
  name VARCHAR(200) NOT NULL,
  primary_role VARCHAR(50) NOT NULL,
  organization VARCHAR(300),
  country VARCHAR(100),
  favorite_fruit VARCHAR(100),

  -- Onchain Verification
  wallet_address VARCHAR(42),
  chain VARCHAR(50) DEFAULT 'avalanche',
  chain_id INTEGER,                                    -- Chain ID (e.g., 43114 for Avalanche C-Chain mainnet)
  token_balance DECIMAL(20, 8) DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'pending',
  verification_date TIMESTAMP,

  -- Privacy & Compliance
  privacy_policy_accepted BOOLEAN DEFAULT false,
  privacy_policy_accepted_at TIMESTAMP,
  privacy_policy_version VARCHAR(20),

  -- Registration Metadata
  registered_at TIMESTAMP DEFAULT NOW(),
  registration_source VARCHAR(50) NOT NULL,
  registration_fee_paid BOOLEAN DEFAULT false,
  registration_fee_amount DECIMAL(10, 2),
  registration_fee_tx VARCHAR(100),
  registration_fee_chain_id INTEGER,                   -- Chain ID where registration fee was paid

  -- Engagement
  engagement_score INTEGER DEFAULT 0,
  last_active_at TIMESTAMP DEFAULT NOW(),
  contribution_count INTEGER DEFAULT 0,
  total_rewards_received DECIMAL(20, 8) DEFAULT 0,

  -- System
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_telegram_id ON community_members(telegram_id);
CREATE INDEX idx_wallet_address ON community_members(wallet_address);
CREATE INDEX idx_status ON community_members(status);
CREATE INDEX idx_engagement_score ON community_members(engagement_score DESC);

-- Platform engagement tracking
CREATE TABLE member_platform_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES community_members(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW(),
  contribution_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',

  UNIQUE(member_id, platform)
);

CREATE INDEX idx_platform_engagement_member ON member_platform_engagement(member_id);

-- NFT holdings
CREATE TABLE member_nft_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES community_members(id) ON DELETE CASCADE,
  contract_address VARCHAR(42) NOT NULL,
  token_id VARCHAR(100),
  nft_type VARCHAR(20) NOT NULL,
  chain VARCHAR(50) NOT NULL DEFAULT 'avalanche',
  chain_id INTEGER NOT NULL,                           -- Network chain ID
  verified_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(member_id, contract_address, token_id, chain_id)
);

CREATE INDEX idx_nft_member ON member_nft_holdings(member_id);
```

---

## 🌐 Web Interface

### Member Directory

**URL**: `/members`

**Features**:
- Grid view of member cards
- Search by name, organization
- Filter by role, country, verification status
- Sort by engagement score, join date
- Pagination (50 per page)

**Member Card**:
```
┌─────────────────────────────────────┐
│  🍓 CryptoBuilder                   │
│  Developer • Argentina              │
│  BuildDAO                           │
│                                     │
│  ✅ Verified on Avalanche           │
│  💎 150 tokens • 2 NFTs             │
│  🏆 Score: 87 | Joined: Dec 3      │
│                                     │
│  [View Profile]                     │
└─────────────────────────────────────┘
```

### Analytics Dashboard

**URL**: `/admin/analytics`

**Sections**:

1. **Overview**
   - Total members
   - Active members (7d)
   - New registrations (30d)
   - Verification rate

2. **Demographics**
   - Members by role (pie chart)
   - Members by country (map)
   - Organizations (bar chart)

3. **Engagement**
   - Top 10 contributors
   - Score distribution
   - Activity timeline

4. **Export**
   - CSV: Member list
   - JSON: Complete data
   - PDF: Analytics report

---

## 📊 PerkOS Context (Reference)

This feature aligns with PerkOS vision as documented in [docs/perk-os/](./perk-os/):

- **Unified Identity**: Foundation for cross-platform member profiles
- **Treasury-Native**: x402 micropayments for registration fees
- **Service Marketplace**: Member analytics as future marketplace offering
- **Multi-Platform**: Schema ready for Discord, Twitch, Kick integration
- **Agent-Driven**: Conversational UX powered by kukulcán personality

See [one-pager.md](./perk-os/one-pager.md) and [PerkOS.pdf](./perk-os/PerkOS.pdf) for full vision.

---

## 🚀 5-Day Implementation Roadmap

### Day 1: Database & Core Plugin
- [ ] PostgreSQL schema creation
- [ ] Plugin structure setup
- [ ] TypeScript interfaces
- [ ] Database connection service

### Day 2: Registration Flow
- [ ] Registration action implementation
- [ ] Conversation state machine
- [ ] Data parsing & validation
- [ ] Error handling

### Day 3: Blockchain Integration
- [ ] Avalanche RPC connection
- [ ] ERC20 balance verification
- [ ] NFT ownership checks
- [ ] x402 payment integration

### Day 4: Web Interface
- [ ] Member directory page
- [ ] Search & filter functionality
- [ ] Analytics dashboard
- [ ] Mobile responsive design

### Day 5: Testing & Polish
- [ ] End-to-end testing
- [ ] Error scenario validation
- [ ] kukulcán personality refinement
- [ ] Demo preparation

---

## ✅ Acceptance Criteria

### Core Functionality
- [ ] User can register via `/register` in Telegram
- [ ] Privacy policy acceptance recorded
- [ ] All data fields collected correctly
- [ ] Avalanche wallet verification succeeds
- [ ] x402 payment processes successfully
- [ ] Welcome message includes profile link
- [ ] Member appears in directory

### Onchain Verification
- [ ] ERC20 balance check works on Avalanche
- [ ] NFT ownership verification works
- [ ] Transaction hash stored correctly
- [ ] Explorer links provided

### User Experience
- [ ] Conversation flow feels natural
- [ ] Error messages are helpful
- [ ] kukulcán personality shines through
- [ ] Registration completes in <30 seconds

### Web Interface
- [ ] Directory loads in <2 seconds
- [ ] Search and filters work
- [ ] Mobile responsive
- [ ] Analytics dashboard accurate

---

## 🔧 Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/frutero_community

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Avalanche Network
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43114                              # 43114=mainnet, 43113=testnet (Fuji)
AVALANCHE_EXPLORER=https://snowtrace.io

# Community Token
COMMUNITY_TOKEN_ADDRESS=0x...
COMMUNITY_TOKEN_SYMBOL=PULPA
COMMUNITY_TOKEN_DECIMALS=18
MIN_TOKEN_BALANCE=10

# Community NFTs (comma-separated)
COMMUNITY_NFT_ADDRESSES=0x...,0x...,0x...

# Treasury
COMMUNITY_TREASURY_ADDRESS=0x...

# x402
X402_API_KEY=your-x402-api-key
X402_NETWORK=avalanche

# Configuration
REGISTRATION_FEE=10
PRIVACY_POLICY_URL=https://frutero.com/privacy
DIRECTORY_URL=https://frutero.com/members
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "@elizaos/core": "latest",
    "@elizaos/plugin-sql": "latest",
    "@elizaos/plugin-telegram": "latest",

    "ethers": "^6.9.0",
    "viem": "^2.0.0",

    "x402-sdk": "latest",

    "pg": "^8.11.0",
    "postgres": "^3.4.0"
  }
}
```

---

## 🎯 Success Metrics

**MVP Launch**:
- 25+ test registrations completed
- 95%+ verification success rate
- <30 second registration time
- 100% payment completion rate
- Zero duplicate registrations

**Hackathon Demo**:
- Live registration on Avalanche testnet
- Real transaction confirmed during demo
- Judges understand the value proposition
- Technical architecture impresses
- Natural conversational UX

---

## 🔮 Post-MVP Roadmap

### Phase 2: Multi-Platform (Week 2)
- Discord integration
- Profile linking UI
- Unified engagement tracking

### Phase 3: Automated Rewards (Week 3-4)
- Top contributor identification
- Scheduled reward distribution
- Tournament management

### Phase 4: Advanced Analytics (Month 2)
- Predictive engagement models
- Contribution pattern analysis
- Community health metrics

---

**Ready for Implementation!** 🚀🍉
