# THW — Sheets & Leagues

A standalone game system for Foundry VTT **Version 14**, built for Two Hour Wargames games.

## What the system provides

- One Actor type: **Character**, with a Leader / Grunt / Creature role.
- Fields: `# Id number`, **REP**, **PEP**, **SAV**, **Race/Profession**, **Class**, **Weapon**,
  **AC** (2 → 8), a quote line and rich-text notes.
- Stats shown per role: a Leader has REP, PEP and SAV; a Grunt and a Creature have REP only.
  Hidden values stay stored and reappear if the role changes.
- Two Item types: **Attribute** and **Item**. Both are draggable documents that can be kept in
  compendiums and posted to chat.
- Configurable **dropdown lists** for Race/Profession, Class and Weapon.
- **League rosters**: a league is an Actor folder, and the window totals the slots used
  against a cost set per role.
- Test: click a stat → roll N d6 (2 by default) and compare **each die separately** against the
  value, never adding them together. All dice ≤ value → *Success*; some → *Partial success*;
  none → *Failure*.

## What the system does not provide

**No rules text.** No pre-filled Attributes, no tables, no reference values. You create your own
Attributes, Items and lists from your own copy of the game.

This is deliberate: the system is a sheet engine, not a publication of the game. The permission
granted by the publisher covers use of the name, and this choice keeps that permission valid
however the package evolves.

## Credits and permissions

"Two Hour Wargames", "THW" and the associated game titles are the property of Two Hour Wargames.
This system is published under permission granted by the publisher, and listed on foundryvtt.com
with the agreement of Foundry Gaming LLC.

The code is released under the MIT License (see `LICENSE`). The permission to use the name covers
this package and does not transfer to forks: if you build on this code to publish something else,
obtain your own.
