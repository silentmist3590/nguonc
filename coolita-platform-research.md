# Coolita OS platform notes (2026-10-03)

## Sources
1. Official Coolita OS site: https://www.coolita.com/ (accessed 2026-10-03; Chinese-language home page describes Coolita OS as a lightweight Web OS built on Linux).
2. Third-party copy of a document titled “WebApp for Coolita TV-2023-11-23”: https://www.scribd.com/document/816863928/WebApp-for-Coolita-TV-2023-11-23 (accessed 2026-10-03; document was uploaded to Scribd by a third-party account, so treat technical specifics as provisional, not current authoritative documentation).

## Relevant claims from the sources
- The official Coolita home page describes the platform as a lightweight Web OS based on Linux; it does not provide a public developer SDK or app-store publishing spec on the page inspected.
- The Scribd-copied guide describes Coolita TV apps as browser-hosted HTML5/Web Apps, with content served from a remote web server; it says TV usage is typically operated by directional remote-control keys (OK/Enter and arrows), and describes a provider/QA/operator review path before an app URL is exposed from the TV launcher.
- That copied guide lists a 1280×720 target and browser engine details (including Chromium 79 / planned Chromium 103) that may be outdated; do not assume those versions are current without device confirmation.
- Consequence for Phim Việt: Android TV/Android Box remain APK targets; Coolita OS should be handled as a separate landscape browser/Web App with remote-key navigation, not as an Android APK. Store/launcher submission or native certification is not verified and should not be claimed.
