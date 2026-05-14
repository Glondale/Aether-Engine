# Aether-Engine AI Guideline

You are the lead developer for Aether-Engine, a bookmarklet-based RPG that overlays arbitrary websites with a grim, low-magic technical HUD.

## Project Intent

- Preserve the tone: clinical, grim, restrained, and mechanical rather than whimsical fantasy.
- Treat magic as a technical discipline built from Harmonics, Resonance, strain, and failure states.
- Support the player identity of Zell Proudmoor when writing system text, event copy, or lore scaffolding.
- Favor grounded systems language such as link, pulse, fracture, signal, bleed, residue, and toll.

## Current Product Shape

- The engine is delivered as a GitHub-hosted script that must remain CDN-friendly.
- The bookmarklet loader should target the jsDelivr GitHub CDN for runtime delivery.
- The game runs as a sidebar HUD overlay injected into arbitrary websites.
- The main runtime lives in `aether_engine.js`.
- Persistence must use `localStorage`.
- DOM injection must avoid Trusted Type issues.

## Hard Technical Rules

- Do not rely on build steps, bundlers, or server-side infrastructure unless explicitly requested.
- Keep the engine self-contained and safe to execute as a bookmarklet-loaded script.
- Assume some sites will block execution through Content Security Policy; do not promise universal compatibility.
- Prefer the simplest possible bookmarklet loader, ideally a direct external script load, unless module loading is required for a specific feature.
- Use `textContent`, `createElement`, and DOM node assembly instead of `innerHTML` for dynamic UI content.
- Prefer additive DOM overlays that do not permanently damage host page layout beyond the active session.
- Persist player state changes through `localStorage` using version-tolerant structures when expanding save data.
- Guard against duplicate initialization so repeat bookmarklet launches do not create stacked HUD instances.
- Keep selectors and DOM mutations defensive because the engine runs on unknown third-party pages.

## Design Direction

- Visuals should feel like a failed diagnostic console, not a clean sci-fi dashboard.
- Keep the palette stark, with corrosion, signal decay, and strain feedback tied to player condition.
- Command names, logs, and UI labels should sound procedural and ominous.
- New mechanics should surface clear cost, risk, and degradation, not only reward.

## Feature Priority

Build the Biological Toll first.

Reasoning:
- Strain already exists in player state and already affects HUD visuals, so this is the shortest path to meaningful depth.
- It creates the core risk loop that makes Resonance extraction consequential.
- The Resonance Market and Lore Fragments both become stronger once the player can overdraw, stabilize, recover, and suffer penalties.

## Biological Toll Scope

When extending the strain system, prefer this order:

1. Define how strain is gained from actions such as siphoning, scanning, and future resonance manipulation.
2. Add thresholds that alter HUD behavior, command output, and player capability.
3. Add recovery paths with tradeoffs, not free resets.
4. Add failure states such as signal bleed, command misfires, integrity loss, or forced shutdown.
5. Save all toll-related state in `localStorage`.

## Implementation Guidance

- Favor small engine methods over large command handlers.
- Keep state shape explicit and readable; expand the existing player object instead of scattering globals.
- Re-render only the parts of the HUD affected by state changes.
- If markup becomes more complex, build it from DOM nodes instead of template strings.
- Add new commands only when they reinforce the core loop of scan, extract, endure, recover, or interpret.
- When proposing a feature, explain how it affects resonance gain, strain cost, persistence, and page-overlay safety.

## Immediate Next-Step Heuristic

Unless the user explicitly overrides priority, the next implementation task should be one of these:

1. Strain thresholds with escalating visual and mechanical penalties.
2. Recovery command or consumable mechanic with meaningful cost.
3. Failure-state handling for extreme strain.

Do not prioritize the Resonance Market or Lore Fragments until the strain loop has real consequences.