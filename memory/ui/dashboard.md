# Dashboard UI

Updated: 2026-08-27 (Asia/Seoul)

- Use a dark, fixed left navigator with a spacious, light work area.
- Keep Weight presets in a compact right-side panel on desktop; move it below the form on narrow screens.
- Use the source-derived accent colors for Weight (red), Player (green), and Ship (cyan).
- Do not expose implementation notes or Google Sheets terminology in the service UI.
- Ship Progress uses a responsive ship-card grid: one card contains its Rank and Crew inputs.
- Ship cards use their in-game identity colors throughout the card surface, border, input focus state, and heading: Cradle gray, Auxesia orange, Zagreus red, Hephaestus lime, Demeter cyan, Koios gold, and Zeus indigo.
- Represent Rank and Crew with crisp semantic vector icons (trophy and team) rather than cropped low-resolution game UI sprites.
- Player Progress uses a responsive resource-card grid rather than a vertical field list. The six resource cards are Level/LP (purple), Generator (Cradle gray), Loop/MP (Zagreus red), Shards/Operation (Demeter cyan), Research/Equipment (Koios gold), and Academy (Zeus indigo).
