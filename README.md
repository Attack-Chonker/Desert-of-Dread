The Desert Looks Back
A short, atmospheric horror experience built with Three.js.

Description
You find yourself on a desolate desert road. In the distance, the flickering lights of a lonely tavern and a gas station offer the only break in the oppressive darkness. But you are not alone. The desert is watching.

This project is an experiment in creating a narrative-driven, first-person experience using procedural generation for many of the assets and a dynamic event system to build suspense.

File Structure
The project is organized into the following directories and files:

index.html: The main entry point for the application. Contains the basic HTML structure and links to the CSS and JavaScript files.

README.md: This file.

css/: Contains all the stylesheets.

style.css: Handles all UI styling for the crosshair, prompts, and warnings.

js/: Contains all the JavaScript modules.

main.js: The primary script that initializes the entire application, loads assets, and starts the game loop.

state.js: Manages the global state of the game, exporting shared variables and constants.

scene.js: Handles the setup of the Three.js scene, camera, renderer, and contains helper functions for creating procedural textures.

actors.js: Contains all functions for creating the objects and environments in the world (e.g., the saloon, gas station, cat, etc.).

controls.js: Manages player input, pointer lock, movement, and collision detection.

gameLoop.js: Contains the main animate function, which updates all game logic, animations, and special effects each frame.

audio.js: Manages the Web Audio API for sound effects and ambient noise.

Door.js: A class definition for the interactable door objects.

Changelog
This branch introduces a major overhaul and expansion of the game's environment, focusing on creating a more detailed, atmospheric, and narratively rich world.

Major Features & Changes:
Complete Gas Station Remodel:

The original gas station building has been replaced with a new model inspired by classic roadside stations, featuring a smaller main building with large glass windows.

Added a full gas pump area with a large canopy, support pillars, and four gas pumps, all styled to match the new building.

The lighting has been completely redone with red neon trim on the exterior and dim, static, eerie fluorescent lighting inside.

New Environmental Assets:

Roadside Neon Sign: A large, custom-built neon sign has been added for the gas station, featuring "GAS" and "LAST STOP" text.

Enterable Car: A new car model with a basic interior is now parked at the gas station. The driver's side door is interactable.

Water Tower: A large, rusty water tower has been added to the skyline.

Telephone Poles: A line of telephone poles now follows the highway.

Environmental Storytelling:

Saloon: The interior is now furnished with tables and chairs. One table features an abandoned poker hand, and a nearby chair is knocked over to suggest a hasty departure.

Gas Station: A newspaper with the headline "Strange Lights Over Desert" has been placed on the interior counter.

Bug Fixes & Layout Adjustments:

Corrected the interior layout of the gas station to ensure a logical flow.

Relocated the cat and trash cans to more sensible positions.