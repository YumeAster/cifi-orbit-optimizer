# Dashboard UI

Updated: 2026-08-27 (Asia/Seoul)

- Use a dark, fixed left navigator with a spacious, light work area.
- Keep Weight presets in a compact right-side panel on desktop; move it below the form on narrow screens.
- The left navigator has one expanded parent menu, `플레이어 진행도 입력`, with icon-labelled children for Weights, Player Progress, and Ship Progress. The sidebar child selection is the only group switcher; do not duplicate it with content tabs.
- Keep each group description as a compact horizontal heading row: colored marker, title, then one short helper line. Do not use a tall explanatory banner.
- Use the source-derived accent colors for Weight (red), Player (green), and Ship (cyan).
- Do not expose implementation notes or Google Sheets terminology in the service UI.
- Ship Progress uses a responsive ship-card grid: one card contains its Rank and Crew inputs.
- Ship cards use their in-game identity colors throughout the card surface, border, input focus state, and heading: Cradle gray, Auxesia orange, Zagreus red, Hephaestus lime, Demeter cyan, Koios gold, and Zeus indigo.
- Represent Rank and Crew with crisp semantic vector icons (trophy and team) rather than cropped low-resolution game UI sprites.
- Player Progress uses a responsive resource-card grid rather than a vertical field list. The seven resource cards are Level/LP (purple), Generator (Cradle gray), Software Tech (Auxesia orange), Loop/MP (Zagreus red), Shards/Operation (Demeter cyan), Research/Equipment (Koios gold), and Academy (Zeus indigo).
- Software Tech is a separate Player Progress card using Auxesia orange; Generator contains only Manual mk1-8.
- The Weight editor uses a color-coded resource-card grid. The historical source palette is Cells green (`#37c979`), Mod Points red (`#ff5f66`), Shards cyan (`#25b9e7`), Research gold (`#9c9156`), Academy Points indigo (`#777ee8`), and Materials orange (`#f4a93a`). Cost Reduction remains gray and Rank Points uses a neutral white palette because it represents ship Rank Points.
- The header includes a persisted Korean/English selector. Korean is the default, translates generic UI terms such as Player Progress, Ship Progress, Long Run, Rank, and Crew, and retains game proper nouns in English.
