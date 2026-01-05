# Location-Specific Visual Overhaul Backlog

High-level asset and FX tasks aligned with the visual direction in `visual_overhaul_strategy.md`. Budgets follow the stated polygon (poly) and texture targets; code touchpoints point to where integrations should land.

## Desert Road Corridor
- **Ground + Sandbreaks** — Higher-frequency grit and heat distortion overlays (2k albedo/roughness, tiled). **Poly:** N/A plane. **Code:** `js/actors.js:createLightingAndWorld` (ground material). *Placeholder:* procedural sand texture now in `js/textures.js`.
- **Cracked Asphalt & Lane Paint** — Cracking/patch decals and faded striping (2k set). **Poly:** N/A plane. **Code:** `js/actors.js:createLightingAndWorld` (road material), potential decal pass in `js/controls.js` camera-ground alignment. *Placeholder:* procedural asphalt texture now in `js/textures.js`.
- **Heat Haze Particle Sheet** — Billboarded distortion for mid-distance shimmer. **Poly:** <500, **Texture:** 1k normal/displacement. **Code:** add to `js/actors.js` near road creation.
- **Sky Gradient & Dust Particles** — Layered fog cards and drifting dust. **Poly:** <1k quads, **Texture:** 1k opacity mask. **Code:** `js/scene.js` fog, potential particle system in `js/actors.js`.

## Double R Diner Exterior/Interior
- **Facade Wear Pass** — Cracked stucco, rust streaks, peeling paint (2k trim sheet). **Poly:** existing shell (~10k) plus trim cards. **Code:** `js/actors.js:createDoubleRDiner` material swap + decals.
- **Neon Sign + Menu Board** — Flickering diner logo and weathered menu (1k emissive/opacity). **Poly:** <3k. **Code:** `js/actors.js:createDoubleRDiner` for light + text meshes.
- **Interior Booths & Counter** — Updated cushions/laminate (2k PBR). **Poly:** booths 3-5k each. **Code:** interior meshes in `js/actors.js:createDoubleRDiner`.
- **Diegetic UI (Order Slips/Checks)** — Paper props to display prompts. **Poly:** <500 per slip. **Code:** interaction prompts overlayed near booth meshes in `js/controls.js`.

## Gas Station / Garage
- **Forecourt Grime Decals** — Oil spills, tire marks (1k decals). **Poly:** decal cards <500 each. **Code:** `js/actors.js:createGasStation` ground overlays.
- **Window grime + interior glow** — Parallax dirt masks (1k) and subtle interior emission. **Poly:** existing glass. **Code:** gas station materials in `js/actors.js:createGasStation`.
- **Pump + Hose Upgrade** — Detailed pumps (5k poly each, 1k textures). **Code:** new meshes in `js/actors.js:createGasStation`.
- **Office Clutter Pass** — Papers, tools, calendar (512-1k textures). **Poly:** <2k per prop cluster. **Code:** `js/actors.js:createGasStation` interior groups.
- **Signage Weathering** — Rusted edges and flicker on Big Ed’s sign (1k emissive/metallic). **Code:** `js/actors.js:createGasStationSign`.

## Velvet Hand Casino
- **Enhanced Neon + Buzz** — High-contrast magenta/green sign set (1k emissive). **Poly:** existing planes. **Code:** `js/VelvetHandCasino.js:createNeonSigns`.
- **Blackjack Prop Set** — Custom card faces, dealer mannequin material pass (2k PBR). **Poly:** cards flat, mannequin 10k. **Code:** `js/VelvetHandCasino.js:createBlackjackTable`.
- **Roulette Wheel Symbols** — Engraved occult plates (1k textures). **Poly:** wheel rim + symbol cards <5k. **Code:** `js/VelvetHandCasino.js:createRouletteTable`.
- **Atmos FX (Whispers, Surveillance Lens)** — Light flicker, audio ducking, heartbeat silence hooks. **Code:** `js/VelvetHandCasino.js` consequence handlers; audio in `js/audio.js`.
- **Woodsman Encounter Dressing** — Soot/ash particle burst and smoke card where he stands (1k opacity). **Poly:** <1k. **Code:** `js/VelvetHandCasino.js:createWoodsman` for future VFX spawn.

## Tracking & Implementation Notes
- **Texture Budgets:** Main set pieces at 2k (albedo/normal/roughness), background props 512-1k. Aligns with `visual_overhaul_strategy.md` Section 2.
- **Performance:** Keep new props within listed poly caps. Reuse tileables for sand/asphalt to control memory.
- **Placeholders Added:** Procedural sand and asphalt materials now power the desert ground and highway; replace with scanned textures when available.
- **Logging:** When swapping materials, prefer named materials in constructors to simplify future profile captures.
