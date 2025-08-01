# Design Document: The Velvet Hand Casino

## 1. Scene Overview

**The Velvet Hand Casino** is a surrealist horror location, a pocket dimension unstuck from linear time. It embodies a dreamlike, yet oppressive, atmosphere heavily inspired by the works of David Lynch. The player enters this space to find it sparsely populated by uncanny, looping figures, with the central point of interaction being a haunted antique slot machine.

---

## 2. Atmosphere

*   **Visuals:** The floor is a dizzying, sharp chevron pattern in black and white. The walls are completely obscured by heavy, floor-to-ceiling red velvet curtains that seem to absorb both light and sound, creating a claustrophobic and muffled environment. The only illumination comes from flickering neon signs, casting sickly green and magenta light that creates long, distorted, dancing shadows. The air is hazy with the thick, stale smell of old cigarettes and the sharp, electric scent of ozone.
*   **Audio:** A constant, low, discordant hum permeates the space. This is a blend of slow, arrhythmic jazz music (think Angelo Badalamenti), the unsettling drone of a faulty ventilation system, and a faint, high-frequency electronic whine. The soundscape is designed to be unnerving and hypnotic.
*   **Patrons:** The few other individuals in the casino are doppelgängers of the player or other characters. They are trapped in silent, repetitive behavioral loops: a woman endlessly pulling the lever of a slot machine that never spins, a man sipping from a perpetually empty martini glass, a couple staring blankly at each other across a small table. They are unresponsive and part of the scenery.

---

## 3. Key Object: "The One-Armed Dreamer"

This is a specific, haunted slot machine that serves as the primary interactive element.

*   **Appearance:** An antique, chrome-plated machine from the 1950s. It is unnaturally cold to the touch, with condensation beading on its metallic surface despite the stuffy air. The chrome is polished but seems to warp reflections in a subtle, nauseating way.
*   **Screen:** The display is a glitching CRT screen, not mechanical reels. It cycles between strange, symbolic images:
    *   Bleeding cherries
    *   An owl with stark, black eyes
    *   A cup of steaming black coffee
    *   Pure television static (white noise)
*   **Sound:** The sound of a spin is not a cheerful jingle. It is a slow, grinding, mechanical groan that sounds like a distorted, recorded human voice being played back at the wrong speed. The sound should be deeply unsettling.

---

## 4. Jackpot Event Sequence

The player can pull the lever of "The One-Armed Dreamer." There is a 15% chance of landing a triple 7 jackpot.

1.  **The Win:** The machine lands on 7-7-7. The grinding sound abruptly stops.
2.  **Silence:** All ambient sound in the casino cuts to absolute, deafening silence. The jazz, the humming, the ventilation—all gone.
3.  **The "Reward":** The machine dispenses not coins, but a single, scorched and twisted cigarette butt, which falls into the payout tray with a faint, dry clatter.
4.  **Temperature Drop:** The temperature in the immediate vicinity of the machine plummets, becoming noticeably, unnervingly cold.
5.  **The Arrival:** From the deepest shadow directly behind the player, a tall, gaunt figure materializes.

---

## 5. The Entity: The Woodsman

*   **Appearance:** A tall, gaunt entity covered in soot and grime, as if he has just stepped out of a chimney fire. His face is a pale, grinning mask, the smile fixed and unnatural. He wears the simple, dark clothing of a laborer or woodsman.
*   **Movement:** He moves with a disjointed, stop-motion gait, lurching forward one frame at a time. His movements are unnatural and jarring. He leans into the player's personal space, violating their comfort zone.
*   **Voice:** His voice is a dry, crackling whisper, like radio static or the sound of burning embers. It is hypnotic and repetitive.
*   **The Question:** He repeats a single, hypnotic question, his voice getting slightly more insistent with each repetition: **"Got a light? Got a light? Got a light?"**
*   **Environmental Effect:** With each repetition of the question, the green and magenta neon lights of the casino flicker violently, threatening to plunge the room into total, absolute darkness.

---

## 6. Player Choice & Consequences

The player is faced with a binary choice: provide a light or fail to do so.

### A. If the Player Provides a Light:

*(This assumes the player has a lighter or matches in their inventory)*

*   **The Action:** The player character produces a flame.
*   **The Woodsman's Reaction:** The Woodsman leans in slowly, his grinning face illuminated from below by the flame. The light reveals his eyes are just dark, empty sockets. He does not light the cigarette.
*   **The Consequence:** He inhales the flame itself. The light is extinguished, and the player is plunged into **total darkness and silence**. After a few seconds, a single, blood-red neon sign flickers to life directly in front of the player. It reads: **"YOU'RE NOT YOU ANYMORE."** The player has now been "marked" or possessed in some way. Their reflection in any subsequent surface may be distorted, or they may be haunted by the Woodsman's static whisper at random intervals. The game's narrative and objectives are now subtly altered towards a darker path.

### B. If the Player Fails to Provide a Light:

*(This occurs if the player has no light source or chooses not to act)*

*   **The Action:** The player does nothing. The Woodsman continues to repeat his question, the lights flickering more and more violently.
*   **The Consequence:** After the third repetition, the lights cut out completely. The player hears a final, close-up whisper of "Got a light?" directly in their ear. Then, the sound of a wet, tearing crunch. The lights snap back on to the normal, sickly green and magenta. The Woodsman is gone. The casino's ambient sound returns. However, the player is now fundamentally changed. They have a new, permanent item in their inventory: **"A Single Memory of a Face."** This item has no practical use, but its description reads: "You can't remember who it belonged to, but you remember their smile. And their terror." The player has lost something fundamental, a piece of their identity or soul, stolen by the Woodsman. This may lock them out of certain "good" endings or resolutions.

---

## 7. Implementation Notes for Developers

*   **Sound Design:** The audio is critical. The shift from the cacophonous hum to absolute silence must be jarring. The Woodsman's voice should be a layered audio effect, combining a human whisper with static and crackling fire sounds.
*   **Lighting:** The lighting is the main tool for tension. The flickering during the Woodsman's questioning should be synchronized with his speech, becoming more erratic. The final plunge into darkness needs to be absolute.
*   **Visual Effects:** The glitch effect on the slot machine screen can be a simple shader. The Woodsman's stop-motion movement can be achieved by forcing his animation to play at a very low, fixed frame rate.
*   **Player State:** The consequences should be tracked via a persistent state change in the player's data (e.g., a boolean flag for "Marked" or "Soul-Stolen").