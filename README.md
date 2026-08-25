# PulseType

<p align="center">
    <img src="src-tauri/icons/128x128.png" alt="PulseType icon" width="128"/>
</p>

PulseType is a local-first desktop app for learning touch typing and improving your typing speed.
It is based on the excellent [keybr.com](https://github.com/aradzie/keybr.com) project, converted
into an offline desktop application.

On the surface, it looks pretty simple: it shows you a piece of text, and you type it out.
But the devil is in the details:

* PulseType tracks every single keystroke and computes statistics for each individual key.
* It automatically generates lessons that focus on your weakest keys.
* You can set your own target typing speed, and it tracks your progress toward that goal.
* It starts with a small set of the most frequent letters in your language.
* More letters are added once you reach the target speed with the current ones.
* It can even predict how many more lessons you will need to complete to reach your target speed.
* It provides a beautiful profile page with detailed graphs showing your learning progress.
* It offers plenty of modes and configuration options.

**Everything is stored locally on your device.** There are no accounts, no servers,
no multiplayer, no ads and no tracking. All your settings and typing results live in
the app's local storage on your computer.

## Building

The app is built with [Tauri](https://tauri.app/). You don't need to build anything
locally — GitHub Actions builds everything. Push this repository to GitHub and:

* Every push is checked by the **CI** workflow, which compiles the web bundle.
* Push a tag like `v1.0.0` (or run the **Release desktop app** workflow manually from
  the Actions tab) and installers for Windows (`.msi`/`.exe`), macOS (Apple Silicon +
  Intel `.dmg`) and Linux (`.deb`/`.rpm`/`.AppImage`) are built and attached to a
  GitHub release.

### Develop locally

Local development requires Node.js 24+ and Rust.

```sh
npm install
npm run tauri dev        # build the web bundle and open the desktop window
```

### Build installers locally

```sh
npm install
npm run tauri build
```

Installers are written to `src-tauri/target/release/bundle/`.

## License

Released under the GNU General Public License v3.0, like the original project.
