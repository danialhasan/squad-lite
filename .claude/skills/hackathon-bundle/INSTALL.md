# Hackathon Bundle Installation

**Time required:** 10-15 minutes

---

## Prerequisites

- **Claude Code CLI** installed and working
- **Node.js 18+** (for MCP servers)
- **Chrome browser** (for Playwriter)

---

## Step 1: Copy the Bundle

```bash
# From the Squad repo
cp -r .claude/skills/hackathon-bundle ~/.claude/skills/

# Verify
ls ~/.claude/skills/hackathon-bundle/
# Should see: CLAUDE.md, INSTALL.md, README.md, skills/, templates/, mcp.json.example
```

---

## Step 2: Configure MCP Servers

### Option A: Use the Example Config (Recommended)

```bash
# Copy the example MCP config to your project
cp ~/.claude/skills/hackathon-bundle/mcp.json.example ~/your-hackathon-project/.mcp.json
```

Then edit `.mcp.json` and add your Morph API key:

```json
{
  "mcpServers": {
    "filesystem-with-morph": {
      "command": "npx",
      "args": ["-y", "@morphllm/morphmcp"],
      "env": {
        "MORPH_API_KEY": "your-actual-key-here"
      }
    },
    ...
  }
}
```

### Option B: Add to Existing Config

If you already have a `.mcp.json`, merge these servers:

```json
{
  "mcpServers": {
    "filesystem-with-morph": {
      "command": "npx",
      "args": ["-y", "@morphllm/morphmcp"],
      "env": {
        "MORPH_API_KEY": "your-key"
      }
    },
    "playwriter": {
      "command": "npx",
      "args": ["playwriter"]
    }
  }
}
```

---

## Step 3: Get a Morph API Key

WarpGrep (semantic code search) requires a Morph API key:

1. Go to https://morphllm.com
2. Sign up / log in
3. Navigate to API Keys
4. Create a new key
5. Add to your `.mcp.json`

**Without this key:** `/hack-discover` will use manual fallback (slower but works)

---

## Step 4: Set Up Playwriter

Playwriter needs Chrome with remote debugging:

```bash
# macOS - Open Chrome with debugging enabled
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 &

# Or use the Playwriter extension (recommended)
# Install from Chrome Web Store: "Playwriter MCP"
```

**Alternative:** If Playwriter doesn't work, use `chrome-devtools` MCP instead.

---

## Step 5: Enable Skills in Project

Create or update `.claude/settings.local.json` in your project:

```json
{
  "permissions": {
    "allow": [
      "mcp__filesystem-with-morph__*",
      "mcp__playwriter__*",
      "mcp__chrome-devtools__*"
    ]
  }
}
```

---

## Step 6: Copy CLAUDE.md to Project

```bash
# Copy the hackathon CLAUDE.md to your project root
cp ~/.claude/skills/hackathon-bundle/CLAUDE.md ~/your-hackathon-project/CLAUDE.md
```

---

## Step 7: Test the Setup

Start Claude Code in your project:

```bash
cd ~/your-hackathon-project
claude
```

Then test each component:

```
# Test 1: Skills are loaded
> /hack-interview
(Should start asking interview questions)

# Test 2: WarpGrep works
> Use warp_grep to find the main entry point
(Should return semantic search results)

# Test 3: Playwriter works
> Take a screenshot of localhost:5173
(Should capture browser screenshot)
```

---

## Troubleshooting

### "MCP server not found"

```bash
# Verify MCP config is in project root
ls -la .mcp.json

# Restart Claude Code
exit
claude
```

### "MORPH_API_KEY not set"

Check your `.mcp.json` has the key in the right place:

```json
{
  "mcpServers": {
    "filesystem-with-morph": {
      "env": {
        "MORPH_API_KEY": "your-key"  // <-- Must be here
      }
    }
  }
}
```

### "Playwriter can't connect"

1. Make sure Chrome is running with `--remote-debugging-port=9222`
2. Or install the Playwriter Chrome extension
3. Click the extension icon on the tab you want to control

### "Skills not invoking"

Skills should be in `~/.claude/skills/hackathon-bundle/skills/`.

Verify with:
```bash
ls ~/.claude/skills/hackathon-bundle/skills/
# Should show: build.md, discover.md, interview.md, loop.md, plan.md, verify.md
```

---

## Quick Verification Checklist

- [ ] Bundle copied to `~/.claude/skills/hackathon-bundle/`
- [ ] `.mcp.json` created in project root
- [ ] Morph API key added (for WarpGrep)
- [ ] Chrome running with debugging OR Playwriter extension installed
- [ ] `CLAUDE.md` copied to project root
- [ ] Claude Code starts without errors
- [ ] `/hack-interview` responds

---

## Ready to Hack!

Once setup is complete:

1. Start with `/hack-interview` to capture requirements
2. Use `/hack-discover` to map the codebase
3. Run `/hack-plan` to design tiers
4. Execute `/hack-build` + `/hack-verify` per tier
5. Or use `/hack-loop` for full automation

**Good luck at the hackathon!**
