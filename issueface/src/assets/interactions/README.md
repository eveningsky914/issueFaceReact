# Interaction Images

This folder contains country-pair interaction images for the ResultHero area.

## Folder Naming Rule

Use two country codes sorted alphabetically, lowercase, joined with a hyphen.

Examples:

- `CN + JP` -> `cn-jp`
- `JP + CN` -> `cn-jp`
- `KR + US` -> `kr-us`
- `AU + BR` -> `au-br`

Country order in the UI does not change the image folder. `JP vs CN` and `CN vs JP` both use `cn-jp`.

## Required Image Files

Each country-pair folder can contain these three files:

- `positive_positive.png`
- `positive_negative.png`
- `negative_negative.png`

Do not add neutral images. If either country's tone state is neutral, the Hero interaction image is not shown.

## Example Structure

```txt
src/assets/interactions/
  cn-jp/
    positive_positive.png
    positive_negative.png
    negative_negative.png
  kr-us/
    positive_positive.png
    positive_negative.png
    negative_negative.png
```

## Adding New Images

1. Find the country-pair folder.
2. Add the three PNG files using the exact required names.
3. Register the files in `src/utils/interactionImages.js`.

## Runtime Behavior

- If `neutral` is included in either country tone state, the interaction image area is not rendered.
- If an image is not registered or does not exist for a country pair, the Hero center interaction area is not rendered.
- Placeholder PNG files should not be added because they can make the app think a real interaction image exists.
