# The Desert Looks Back

*A short, atmospheric horror experience built with Three.js.*

## Description

You find yourself on a desolate desert road. In the distance, the flickering lights of a lonely tavern and a gas station offer the only break in the oppressive darkness. But you are not alone. The desert is watching. And sometimes, when the right song plays, the walls of reality grow thin.

This project is an experiment in creating a narrative-driven, first-person experience with a hidden secret inspired by the works of David Lynch.

---

## How to Run This Experience

**Important:** You cannot simply open the `index.html` file in your browser. Modern web browsers have security features that prevent JavaScript modules from loading correctly from your local file system (`file:///...`). To run this experience, you **must** serve the files using a local web server.

Here are two common ways to do this.

### Method 1: The Easy Way (Using a Code Editor Extension)

This is the recommended method for most users. We'll use the popular "Live Server" extension available for editors like VS Code or Cursor.

1.  **Open the Project:** Open the entire project folder in your code editor (e.g., Cursor or VS Code).
2.  **Install the Extension:**
    *   Go to the Extensions view (usually an icon with squares on the left sidebar).
    *   Search for `Live Server` by **Ritwick Dey**.
    *   Click "Install". You only need to do this once.
3.  **Go Live:** After the extension is installed, you have two options:
    *   **Option A:** In the file explorer, right-click on the `index.html` file and select **"Open with Live Server"**.
    *   **Option B:** Look in the bottom-right corner of your editor's window for a blue status bar. Click the **"Go Live"** button.

Your default browser will automatically open with the game running.

### Method 2: The Command Line Way

If you are comfortable using the command line and have [Node.js](https://nodejs.org/) installed, this is a quick and reliable method.

1.  **Install Node.js:** If you don't have it, download and install the "LTS" version from the [official Node.js website](https://nodejs.org/).
2.  **Install `live-server`:** Open your terminal or command prompt and run the following command. This installs the tool globally on your system so you can use it for any project.
    ```bash
    npm install -g live-server
    ```
3.  **Navigate to the Project Folder:** Use the `cd` command to navigate into the project's root directory (the folder containing `index.html`).
    ```bash
    # Example:
    cd path/to/your/Desert-of-Dread
    ```
4.  **Start the Server:** Once you're in the correct directory, simply run the command:
    ```bash
    live-server
    ```

Your browser will automatically open, and the experience will begin.

---

## Controls

*   **Look:** Move the mouse.
*   **Move:** `W`, `A`, `S`, `D` keys.
*   **Interact:** `E` key.
*   **Flashlight:** `F` key.
*   **Start / Lock Mouse:** Click anywhere on the screen.

## Hints

*   Not everything is as it seems. Explore the buildings.
*   Some objects respond to interaction. If you see a prompt, press 'E'.
*   The cat is more than just a cat. Pay attention to it.
*   Sometimes, a song is the key.
