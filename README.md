# uragami

A plain text editor with the casualness of scrap paper.

In Japan, **裏紙** (uragami) means the blank back side of used paper — old flyers, printed ads, meeting handouts. People grab these for quick notes because the paper isn't precious. You can scribble freely without guilt.

This app captures that feeling. Three sheets of scrap paper. Swipe to flip between them. Everything auto-saves. No file dialogs, no Cmd+S, no friction.

![screenshot](https://github.com/user-attachments/assets/placeholder.png)

## Features

- **3 sheets of scrap paper** — swipe left/right (trackpad) to switch
- **Auto-save** — content persists silently to `~/Documents/uragami/`
- **No save dialogs** — Cmd+S is intentionally disabled
- **Paper stack UI** — sheets overlap with subtle shadows, like paper on a desk
- **Bleed-through texture** — each sheet has faint traces of "printing" from the other side, just like real scrap paper
- **Dark mode** — follows system preference
- **macOS native** — overlay titlebar, close-button-only chrome

## Install

Download the `.dmg` from [Releases](../../releases).

Or build from source:

```sh
git clone https://github.com/yourname/uragami.git
cd uragami
npm install
npm run build
open src-tauri/target/release/bundle/macos/uragami.app
```

### Prerequisites

- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) (v18+)

## Tech stack

- **Tauri v2** — Rust backend + system WebView
- **Vanilla HTML/CSS/JS** — no frameworks, no bundlers
- **`<textarea>`** — native undo/redo and IME support

## Data

Sheets are stored as plain text files:

```
~/Documents/uragami/
├── sheet_1.txt
├── sheet_2.txt
└── sheet_3.txt
```

## License

MIT
