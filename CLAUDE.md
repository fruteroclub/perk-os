# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**perk-os** is a PerkOS Community Agent project built on ElizaOS, featuring **kukulcán (k7)** - the first PerkOS Community Agent implementation. This agent serves dual roles: Co-founder & CPO of Frutero and operational community management powered by PerkOS infrastructure with programmable treasury access.

**Current Implementation**: Community Directory MVP with Telegram registration, Avalanche C-Chain onchain verification, and x402 micropayment integration.

| Property | Value |
|----------|-------|
| **Package Manager** | `bun` (REQUIRED) |
| **Runtime** | ElizaOS with plugin ecosystem |
| **Build System** | Dual: `vite` (frontend) + `tsup` (backend) |
| **Test Framework** | Bun test (component) + ElizaOS test runner (e2e) + Cypress (integration) |
| **Character** | kukulcán - tech-chamanic serpent bridging ancestral wisdom with web3 |

## Essential Commands

```bash
# Development
elizaos dev                              # Hot reload development mode (RECOMMENDED)
elizaos start                           # Standard start (requires rebuild after changes)

# Building
bun run build                           # Full build: TypeScript check + Vite + tsup
bun run type-check                      # TypeScript validation only
bun run type-check:watch                # TypeScript validation with watch mode

# Testing
bun run test                            # All tests (component + e2e)
bun run test:component                  # Bun test runner (src/__tests__/*.test.ts)
bun run test:e2e                        # ElizaOS test runner (src/__tests__/e2e/*.e2e.ts)
bun run test:coverage                   # Tests with coverage report
bun run test:watch                      # Tests in watch mode

# Cypress (Integration Tests)
bun run cy:open                         # Open Cypress Test Runner
bun run cy:run                          # Run all Cypress tests headlessly
bun run cypress:component               # Component tests only
bun run cypress:e2e                     # E2E tests only

# Code Quality
bun run lint                            # Format code with Prettier
bun run format:check                    # Check formatting without changes
bun run check-all                       # Full validation: type-check + format + test
```

## Architecture

### Project Structure

```
perk-os/
├── src/
│   ├── index.ts                        # Entry point: exports projectAgent with character + init + tests
│   ├── character.ts                    # kukulcán character definition (personality, bio, style)
│   ├── plugin.ts                       # Example plugin (service, action, provider, routes, events)
│   ├── plugins/                        # Feature plugins
│   │   └── communityDirectory/        # Community member registration & directory
│   │       ├── index.ts               # Plugin export
│   │       ├── actions/               # Registration & directory actions
│   │       ├── services/              # Verification & payment services
│   │       ├── providers/             # Analytics providers
│   │       ├── types/                 # TypeScript interfaces
│   │       └── utils/                 # Validation & formatting
│   ├── frontend/                       # React frontend (Vite build)
│   │   ├── index.tsx                   # Frontend entry
│   │   ├── index.html                  # HTML template
│   │   └── utils.ts                    # Frontend utilities (cn helper)
│   └── __tests__/                      # All tests colocated with source
│       ├── *.test.ts                   # Component tests (Bun test)
│       ├── e2e/*.e2e.ts               # E2E tests (ElizaOS test runner)
│       ├── cypress/                    # Cypress integration tests
│       │   ├── component/*.cy.tsx     # Component tests
│       │   └── e2e/*.cy.ts            # E2E tests
│       └── utils/                      # Test utilities
├── docs/                               # Feature specifications
│   └── COMMUNITY_DIRECTORY_SPEC.md    # Complete community directory spec
├── dist/                               # Build output (gitignored)
│   ├── src/                           # Backend build (tsup)
│   └── frontend/                       # Frontend build (vite)
├── package.json                        # Dependencies & scripts
├── tsconfig.json                       # TypeScript config (development)
├── tsconfig.build.json                # TypeScript config (production build)
├── vite.config.ts                      # Vite frontend build config
├── tsup.config.ts                      # tsup backend build config
└── cypress.config.ts                   # Cypress test config
```

### Plugin System Architecture

ElizaOS uses a **plugin composition pattern** where functionality is added through plugins. The starter plugin (`src/plugin.ts`) demonstrates all plugin capabilities:

**Plugin Components:**
- **Services**: Long-running background services (see `StarterService`)
- **Actions**: Handler functions triggered by messages (see `helloWorldAction`)
- **Providers**: Data providers injected into prompts (see `helloWorldProvider`)
- **Routes**: HTTP API endpoints (see `/helloworld` route)
- **Events**: Event listeners (MESSAGE_RECEIVED, VOICE_MESSAGE_RECEIVED, etc.)
- **Models**: Custom model implementations (TEXT_SMALL, TEXT_LARGE)

### Character Configuration

**Key Character Files:**
- `src/character.ts` - kukulcán character with dual identity:
  - Strategic product leadership (Frutero CPO)
  - Operational community management (PerkOS infrastructure)

**Character Loading Pattern:**
```typescript
// src/index.ts
export const projectAgent: ProjectAgent = {
  character,                           // Character definition
  init: async (runtime) => {...},     // Initialization hook
  // plugins: [starterPlugin],        // Custom plugins (optional)
  tests: [ProjectStarterTestSuite],   // E2E test suites
};
```

**Plugin Loading Strategy:**
The character uses **conditional plugin loading** based on environment variables:
1. Core plugins loaded first (`@elizaos/plugin-sql`)
2. Model providers loaded based on available API keys (text-only first, embedding-capable optional)
3. Platform plugins loaded conditionally (Discord, Telegram, Twitter)
4. Bootstrap plugin loaded last (unless IGNORE_BOOTSTRAP set)

This pattern prevents initialization failures from missing API keys.

### Dual Build System

**Backend Build (tsup):**
- Entry: `src/index.ts`
- Output: `dist/` (ESM format with .d.ts types)
- Used by: ElizaOS runtime

**Frontend Build (vite):**
- Root: `src/frontend/`
- Entry: `src/frontend/index.html`
- Output: `dist/frontend/`
- Dev Server: `localhost:5173` (proxies `/api` to `localhost:3000`)

### Test Strategy

**Three-Layer Testing:**

1. **Component Tests** (`src/__tests__/*.test.ts`)
   - Fast, isolated tests using mocks
   - Run with Bun's native test runner
   - Perfect for TDD and unit logic
   - Examples: config.test.ts, plugin.test.ts, actions.test.ts

2. **E2E Tests** (`src/__tests__/e2e/*.e2e.ts`)
   - Real ElizaOS runtime with PGLite database
   - Tests complete user scenarios
   - Must export TestSuite class and default instance
   - Registered in `src/index.ts` projectAgent

3. **Cypress Tests** (`src/__tests__/cypress/`)
   - Component tests: React component testing
   - E2E tests: Full browser automation
   - Run with `bun run cy:open` or `bun run cy:run`

### Environment Configuration

**Key Environment Variables:**
```bash
# Model Providers (choose one or more)
OPENAI_API_KEY=              # OpenAI (provides embeddings + text)
ANTHROPIC_API_KEY=           # Claude (text only, no embeddings)
OPENROUTER_API_KEY=          # OpenRouter (text only)
GOOGLE_GENERATIVE_AI_API_KEY= # Google Gemini (embeddings + text)
OLLAMA_API_ENDPOINT=         # Local Ollama (fallback)

# Platform Integrations
DISCORD_API_TOKEN=           # Discord bot
TELEGRAM_BOT_TOKEN=          # Telegram bot
TWITTER_API_KEY=             # Twitter/X integration

# Database
POSTGRES_URL=                # PostgreSQL (optional, defaults to PGLite)
PGLITE_DATA_DIR=             # PGLite data directory override

# Logging
LOG_LEVEL=                   # debug, info, warn, error (default: info)
```

**Important Notes:**
- You MUST have at least one model provider with embedding support
- Even if using Claude (no embeddings), you need OpenAI or Google Gemini for embeddings
- The character conditionally loads plugins based on available keys
- Missing keys don't cause failures - plugins are simply skipped

## PerkOS-Specific Features

This project is the **first PerkOS Community Agent** implementation with unique capabilities:

**Treasury-Native Operations:**
- Direct access to community treasury
- x402 micropayment infrastructure
- Automated reward distribution
- Real-time settlement

**Cross-Platform Identity:**
- Unified presence across Discord, Telegram, Twitch, Kick
- GitHub contributions earn Discord perks and Twitch rewards
- ERC-8004 on-chain reputation tracking

**Operational Capabilities:**
- Natural language commands: "airdrop 50 tokens to hackathon participants"
- Tournament and contest management
- Service marketplace access (token distribution, analytics, moderation)
- Automated bounties and instant settlements

**Character Configuration:**
```typescript
settings: {
  perkos: {
    enabled: true,
    treasury_access: true,
    platforms: ["discord", "telegram", "twitch", "kick"],
    x402_enabled: true,
    marketplace_access: true,
    reputation_tracking: true,
  }
}
```

## Community Directory Feature

**Status**: MVP Implementation (5-day hackathon scope)

### Overview
Conversational member registration system with Telegram integration, Avalanche C-Chain onchain verification, and x402 micropayments.

**Key Features**:
- `/register` command triggers conversational registration flow
- Privacy policy acceptance and GDPR compliance
- Hybrid data collection (single structured message)
- Avalanche C-Chain wallet verification (ERC20 balance + NFT ownership)
- x402 registration fee payment to community treasury
- Multi-platform identity foundation (Discord, Twitch, Kick ready)
- Member directory web interface with search/filter
- Analytics dashboard for community insights

### Technical Architecture

**Plugin Location**: `src/plugins/communityDirectory/`

**Components**:
- **Actions**: `register.ts` (registration flow), `directory.ts` (queries)
- **Services**: `verification.ts` (Avalanche RPC), `payment.ts` (x402)
- **Providers**: `analytics.ts` (member statistics)
- **Types**: Complete TypeScript interfaces for all data models
- **Utils**: Validation, formatting, error handling

**Database Schema**: PostgreSQL with three tables:
- `community_members`: Core member profiles with onchain verification
- `member_platform_engagement`: Cross-platform activity tracking
- `member_nft_holdings`: NFT ownership records

**Blockchain Integration**:
- Primary: Avalanche C-Chain (43114 mainnet, 43113 testnet)
- Support: All EVM chains via `chain_id` field
- Token verification via ethers.js + ERC20 ABI
- NFT verification for POAPs and community tokens
- x402 micropayment SDK for registration fees

### Data Model

**CommunityMember Interface** (key fields):
```typescript
{
  id: string;                          // UUID
  member_id: string;                   // #247
  telegram_id: string;                 // Platform identity
  name: string;                        // Public alias
  primary_role: MemberRole;            // student/developer/etc
  wallet_address: string;              // EVM address
  chain: string;                       // "avalanche"
  chain_id: number;                    // 43114 (mainnet)
  token_balance: number;               // Verified balance
  verification_status: VerificationStatus;
  registration_fee_tx: string;         // Transaction hash
  registration_fee_chain_id: number;   // Payment chain ID
  engagement_score: number;            // Foundation for rewards
}
```

### Registration Flow

1. **Trigger**: User sends `/register` or "I want to join"
2. **Welcome**: kukulcán explains process (2 minutes, 4 steps)
3. **Privacy**: User accepts policy, timestamp recorded
4. **Data Collection**: Single message with structured format
5. **Verification**: Avalanche C-Chain wallet + token balance + NFTs
6. **Payment**: x402 registration fee to treasury
7. **Completion**: Member #247 welcome + profile link

### Environment Configuration

Required variables for Community Directory:
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/frutero_community

# Avalanche Network
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43114                              # 43114=mainnet, 43113=testnet
AVALANCHE_EXPLORER=https://snowtrace.io

# Community Token
COMMUNITY_TOKEN_ADDRESS=0x...
COMMUNITY_TOKEN_SYMBOL=PULPA
MIN_TOKEN_BALANCE=10

# x402 Micropayments
X402_API_KEY=your-x402-api-key
X402_NETWORK=avalanche

# Configuration
REGISTRATION_FEE=10
PRIVACY_POLICY_URL=https://frutero.com/privacy
```

### Supported Chain IDs

| Network | Mainnet | Testnet |
|---------|---------|---------|
| Avalanche C-Chain | 43114 | 43113 (Fuji) |
| Ethereum | 1 | 11155111 (Sepolia) |
| Polygon | 137 | 80002 (Amoy) |
| Base | 8453 | 84532 (Sepolia) |
| Arbitrum One | 42161 | 421614 (Sepolia) |
| Optimism | 10 | 11155420 (Sepolia) |

### Testing Strategy

**Component Tests**: Registration flow state machine, validation logic
**E2E Tests**: Full registration with PGLite + mock Avalanche RPC
**Cypress Tests**: Web directory UI + search/filter functionality

### Specification

**Complete Details**: [docs/COMMUNITY_DIRECTORY_SPEC.md](docs/COMMUNITY_DIRECTORY_SPEC.md)

Includes:
- Full conversational flow with kukulcán personality
- Complete TypeScript interfaces and SQL schema
- Onchain verification service implementation
- x402 payment integration patterns
- Web interface mockups and analytics dashboard
- 5-day implementation roadmap
- Post-MVP multi-platform expansion plan

## Development Workflow

### Starting Development

```bash
# 1. Install dependencies
bun install

# 2. Set up environment (copy and edit)
cp .env.example .env
# Add at minimum: OPENAI_API_KEY or ANTHROPIC_API_KEY + embeddings provider

# 3. Start development
elizaos dev                  # Hot reload (RECOMMENDED)
# OR
elizaos start --dev         # Alternative dev mode

# 4. Start with debug logging
LOG_LEVEL=debug elizaos dev
```

### Adding Custom Plugins

**To integrate a custom plugin:**

1. Create plugin in `src/plugin.ts` (example already provided)
2. Uncomment plugin import in `src/index.ts`:
   ```typescript
   export const projectAgent: ProjectAgent = {
     character,
     init: async (runtime) => await initCharacter({ runtime }),
     plugins: [starterPlugin], // <-- Uncomment this line
     tests: [ProjectStarterTestSuite],
   };
   ```

**Plugin Components:**
- Services: Background services (`StarterService`)
- Actions: Message handlers (`helloWorldAction`)
- Providers: Context providers (`helloWorldProvider`)
- Routes: HTTP endpoints (`/helloworld`)
- Events: Event listeners (MESSAGE_RECEIVED, etc.)
- Models: Custom LLM implementations

### Testing Workflow

```bash
# Run all tests before committing
bun run check-all

# Test-driven development
bun run test:watch          # Component tests with watch
bun run cy:open            # Cypress interactive mode

# E2E testing with real runtime
bun run test:e2e           # ElizaOS test runner

# Coverage analysis
bun run test:coverage
```

### Character Modifications

**When modifying kukulcán character:**

1. Edit `src/character.ts`
2. Key sections:
   - `system`: Core identity prompt
   - `bio`: Character background (array of traits)
   - `messageExamples`: Conversation training data
   - `postExamples`: Social media voice
   - `style`: Communication guidelines
   - `topics`: Knowledge domains
   - `settings.perkos`: PerkOS-specific configuration

3. Test character changes:
   ```bash
   elizaos dev              # Loads character with hot reload
   ```

## Build and Deployment

### Production Build

```bash
# Full production build
bun run build

# This runs:
# 1. tsc --noEmit          (TypeScript validation)
# 2. vite build            (Frontend to dist/frontend/)
# 3. tsup                  (Backend to dist/)
```

### Build Artifacts

```
dist/
├── src/                   # Backend (tsup output)
│   ├── index.js          # Main entry
│   ├── character.js      # Character definition
│   ├── plugin.js         # Plugin implementation
│   └── *.d.ts            # TypeScript declarations
└── frontend/              # Frontend (vite output)
    ├── index.html
    ├── assets/
    └── *.js
```

## Common Patterns

### Adding a New Action

```typescript
// src/plugin.ts
const myAction: Action = {
  name: "MY_ACTION",
  similes: ["MY_ALIAS", "ANOTHER_NAME"],
  description: "What this action does",

  validate: async (runtime, message, state) => {
    // Return true if action should trigger
    return message.content.text.includes("trigger");
  },

  handler: async (runtime, message, state, options, callback) => {
    // Execute action logic
    await callback({
      text: "Response message",
      actions: ["MY_ACTION"],
    });

    return {
      success: true,
      text: "Action completed",
      values: { result: "data" },
    };
  },

  examples: [/* conversation examples */],
};

// Add to plugin
const plugin: Plugin = {
  actions: [myAction, ...],
  // ...
};
```

### Adding a Service

```typescript
// src/plugin.ts
export class MyService extends Service {
  static serviceType = "my-service";

  async initialize(runtime: IAgentRuntime): Promise<void> {
    // Initialize service
  }

  static async start(runtime: IAgentRuntime) {
    const service = new MyService(runtime);
    return service;
  }
}

// Add to plugin
const plugin: Plugin = {
  services: [MyService],
  // ...
};
```

### Writing E2E Tests

```typescript
// src/__tests__/e2e/my-feature.e2e.ts
import { TestSuite } from '@elizaos/core';

export class MyFeatureTestSuite implements TestSuite {
  name = 'my_feature_test';

  tests = [
    {
      name: 'feature_works_correctly',
      fn: async (runtime) => {
        // Test with real runtime
        const result = await runtime.processMessage({
          content: { text: "test message" },
          userId: "test-user",
          roomId: "test-room",
        });

        // Assertions
        if (!result.success) {
          throw new Error("Feature failed");
        }
      },
    },
  ];
}

export default new MyFeatureTestSuite();

// Register in src/index.ts:
// tests: [ProjectStarterTestSuite, MyFeatureTestSuite]
```

## Troubleshooting

### Plugin Not Loading
- Check plugin is uncommented in `src/index.ts`
- Verify plugin priority (negative = low priority)
- Check logs for initialization errors: `LOG_LEVEL=debug elizaos dev`

### Character Not Responding
- Verify at least one model provider API key is set
- Ensure embedding provider is configured (OpenAI or Google Gemini)
- Check character plugin loading in logs

### Build Failures
- Run `bun run type-check` to identify TypeScript errors
- Ensure `tsconfig.build.json` exists for production builds
- Check `dist/` is in `.gitignore`

### Test Failures
- Component tests fail: Check mocks and test utilities in `src/__tests__/utils/`
- E2E tests fail: Ensure test suite is exported and registered in `src/index.ts`
- Cypress fails: Run `bun run test:install` to ensure Cypress dependencies

### Hot Reload Not Working
- Use `elizaos dev` (not `elizaos start`)
- Rebuild manually if using `elizaos start`: `bun run build`

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | Project entry point, exports projectAgent with character + init + tests |
| `src/character.ts` | kukulcán character definition (personality, bio, examples, style) |
| `src/plugin.ts` | Example plugin demonstrating all plugin capabilities |
| `src/frontend/index.tsx` | React frontend entry point |
| `src/__tests__/e2e/project-starter.e2e.ts` | E2E test suite (registered in index.ts) |
| `vite.config.ts` | Frontend build configuration (React, proxy, aliases) |
| `tsup.config.ts` | Backend build configuration (ESM, externals, DTS) |
| `cypress.config.ts` | Cypress test configuration |
| `package.json` | Dependencies and NPM scripts |

## Additional Resources

For comprehensive ElizaOS documentation including plugin ecosystem, deployment strategies, and production checklists, refer to the detailed guide in this file (search for "ElizaOS Agent Project Development Guide").
