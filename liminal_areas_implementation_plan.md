# Liminal Area Implementation Plan

This plan translates the prior high-level concepts into an ordered implementation approach.

1. **Create a reusable liminal-area framework**
   - Add shared state tracking for liminal areas (status, timers, modulation data).
   - Implement a `LiminalAreaManager` that handles entry triggers, transitions, active loops, and exits with consistent camera/movement resets.
   - Provide helpers for registering interactables and documenting missing assets/placeholders.

2. **Wire the framework into the main loop**
   - Instantiate the manager alongside the existing `GameLoop` and feed it `scene`, `camera`, and `controls` references.
   - Call the manager during the frame update so each area can run its logic without disturbing existing sequences.

3. **Build shared entry/exit affordances**
   - Spawn reusable entry markers near the main world path with prompts that invite interaction.
   - Ensure each area teleports the player into a contained space, with an explicit exit interactable that returns them to the desert and resets modulation.

4. **Implement the three areas using the shared pattern**
   - **Silt-Choked Radio Observatory:** half-buried dish scene with a tuning console; use placeholder radio hum + shader tints to modulate visuals.
   - **Salt Flat Mirage Arcade:** grid of ghostly arcade cabinets with screen mirage cycling; add a refresh lever that reshuffles colors/patterns.
   - **Forgotten Motel Basement:** flickering maintenance corridor with mismatched doors; include a maintenance clipboard to toggle corridor tilt/creak effects.

5. **Document assets and validation**
   - Note any placeholder meshes/tones that need bespoke art or audio in code comments.
   - Provide final run instructions and a per-area validation checklist.
