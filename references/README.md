# Reference database — Elektryk Symulator

This directory is the source-of-truth for real-world visual and layout references used to improve the training simulator.

## Files

- `schema.json` — data structure used by reference models.
- `switchboards.json` — switchboard/enclosure references supplied by the project owner.
- `apparatus.json` — design rules for the fictional XYZ DIN apparatus family.

## Rules

1. Source facts and inferred simulator settings are kept separate.
2. Unknown dimensions, module counts or apparatus details remain `null` until visually verified.
3. Real manufacturers are references only. The simulator uses fictional XYZ branding.
4. These records are for a training simulator and visual realism; they are not execution drawings or proof of standards compliance.
5. Future free-build templates should be generated from these records rather than hard-coded per screen.

## Next implementation target

Build a **FREE BUILD / LEARNING** mode that reads a template catalog derived from `switchboards.json`, beginning with:
- compact starter board,
- 3x12 board,
- 5x12 board,
- 5x24 board.

