# Session Directory Structure

## Per-Developer Isolation

Each day's session directory is split by developer to prevent context pollution:

```
docs/sessions/
└── YYYY-MM-DD/
    ├── danial/           # Danial's session artifacts
    │   ├── MISSION.md
    │   ├── NOTES.md
    │   ├── checkpoints/
    │   └── artifacts/
    │
    └── shafan/           # Shafan's session artifacts
        ├── MISSION.md
        ├── NOTES.md
        ├── checkpoints/
        └── artifacts/
```

## Usage

### For Danial

All session artifacts go in `docs/sessions/{date}/danial/`:
- Mission files
- Planning notes
- Agent checkpoints
- Screenshots, diagrams, outputs

**Can read from:** Both `danial/` and `shafan/` folders
**Writes to:** Only `danial/` folder

### For Shafan

All session artifacts go in `docs/sessions/{date}/shafan/`:
- Mission files
- Planning notes
- Agent checkpoints
- Screenshots, diagrams, outputs

**Can read from:** Both `shafan/` and `danial/` folders
**Writes to:** Only `shafan/` folder

## Benefits

1. **No context pollution** - Each developer's Claude instance maintains clean context
2. **Cross-reference** - Can read other developer's notes without contaminating own context
3. **Parallel work** - Both can work simultaneously without conflicts
4. **Clear ownership** - Easy to see who did what

## File Types

### MISSION.md
- Current objectives
- Success criteria
- Side quests

### NOTES.md
- Freeform notes
- Discoveries
- Decisions

### checkpoints/
- Agent state snapshots
- Resume pointers

### artifacts/
- Screenshots
- Diagrams
- Generated outputs
- Test results
