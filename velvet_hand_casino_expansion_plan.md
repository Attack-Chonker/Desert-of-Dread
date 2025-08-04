# Design Document: Velvet Hand Casino Expansion

## 1. Overview

This document outlines the expansion of The Velvet Hand Casino, building upon the existing surrealist horror foundation. The goal is to add more interactive elements and deepen the psychological horror, while maintaining the established Lynchian atmosphere.

---

## 2. Enhanced Neon Signage

The casino's oppressive lighting will be enhanced with new, flickering neon signs. These signs will serve as environmental storytelling, adding to the sense of dread and unreality.

*   **"The Velvet Hand Casino" Main Sign:** A large, elaborate sign at the entrance. The "V" and "d" will flicker erratically, and the sign will emit a constant, low buzzing sound.
*   **Cryptic Message Signs:** Smaller signs scattered throughout the casino, displaying unsettling messages in sickly green and magenta neon.
    *   "PAYOUTS IN REGRET"
    *   "THE HOUSE ALWAYS WINS (YOUR SOUL)"
    *   "CHECK YOUR REFLECTION"
    *   "TIME IS A FLAT CIRCLE (OF DEBT)"

---

## 3. New Gambling Game: Blackjack with "The Dealer"

*   **Setup:** A standard blackjack table, but the dealer is a life-sized, seated mannequin with a fixed, painted-on smile and glassy, unblinking eyes. The mannequin's movements will be stiff and unnatural, controlled by a hidden mechanism.
*   **Cards:** The playing cards will not have standard suits. Instead, they will feature unsettling, hand-drawn images:
    *   A weeping eye
    *   A spiderweb
    *   A cracked mirror
    *   A screaming mouth
*   **Gameplay:** Standard blackjack rules apply. However, the stakes are not monetary.
*   **Consequences:**
    *   **Winning a hand:** The player feels a fleeting sense of relief, but the mannequin's smile seems to widen slightly.
    *   **Losing a hand:** The player experiences a minor psychological penalty. This could be a distorted audio cue (e.g., a faint whisper, a discordant piano chord), a brief visual glitch, or a fleeting glimpse of a shadowy figure at the edge of the screen.
    *   **Getting a "Blackjack":** The mannequin slowly turns its head to look directly at the player. A single, perfect tear rolls down its painted cheek. The player receives a "prize": a single, dead fly.

---

## 4. New Gambling Game: Roulette of Fate

*   **Setup:** A roulette wheel made of a dark, polished wood. The numbered slots are replaced with cryptic, occult symbols. The wheel is spun by a disembodied, gloved hand that appears from the shadows.
*   **The "Ball":** Instead of a traditional roulette ball, a realistic human eyeball is used. It rolls around the wheel with a wet, unsettling sound.
*   **Gameplay:** The player places a "bet" by choosing a symbol. The stakes are abstract and related to the player's psyche.
*   **Consequences:** The outcome of the spin is not a win or loss, but a specific event tied to the symbol the eyeball lands on.
    *   **Symbol of the Serpent:** A chorus of whispers surrounds the player, speaking in a forgotten language.
    *   **Symbol of the Broken Crown:** The player's vision blurs, and for a moment, the casino appears to be in ruins.
    *   **Symbol of the Empty Throne:** All sound in the casino ceases for ten seconds, replaced by the sound of a beating heart.
    *   **Symbol of the Black Star:** The lights in the casino flicker violently, and the player feels a profound sense of being watched.

---

## 5. Implementation Notes

*   **Asset Creation:** New textures will be required for the neon signs, the blackjack cards, and the roulette wheel symbols.
*   **Audio Design:** New sound effects will be needed for the card dealing, the eyeball rolling, and the various psychological consequences.
*   **Scripting:** The logic for the new games will be implemented in `js/VelvetHandCasino.js`. The new objects and their properties will be added to the scene in `js/scene.js`.
