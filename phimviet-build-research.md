# Phim Việt Android build references (2026-10-04)

## Official Manus Help — Expo build quota
URL: https://help.manus.im/en/articles/16997172-why-do-i-see-expo-build-quota-exceeded-when-building-an-android-apk
- Manus uses the connected personal Expo token to request Android builds on Expo cloud.
- A Manus "Build APK" action is separate from Expo Preview and is subject to the connected Expo account's own quota.
- The article says the Free Expo plan currently includes 15 Android builds/calendar month, shared by projects on that account; mention/act on this only if the actual build returns a quota error.
- The official text says the user should return to the app in Manus and select "Build APK"; do not ask for or inspect Expo tokens in chat/files.

## Official Manus mobile app sharing/publishing documentation
URL: https://manus.im/docs/website-builder/app-publishing
Official blog: https://manus.im/blog/manus-app-publishing
- The "Publish to Google Play" / App Sharing workflow packages Android as AAB for upload to Play Console, not a sideloadable APK.
- It is a store-testing workflow requiring the user's Play Console credentials and is outside the current request; do not use it for this APK task.
- The separate "Build APK" action for sideloadable output is the relevant workflow.

## Official Expo build setup
URL: https://docs.expo.dev/build/setup/
- EAS cloud builds require an Expo account. The build details page/dashboard provides installation/download once an installable APK is built.
- Project profile must set Android `buildType: apk` for sideloadable APK; do not run EAS/Gradle release builds from this Sandbox per the WebDev template.


## EAS project linking requirement (2026-10-05)
- Official Expo EAS CLI docs: https://docs.expo.dev/eas/cli/ — `eas init` creates or links an EAS project; `eas build` accepts a named profile and otherwise defaults to `production` when present.
- Official Expo tutorial: https://docs.expo.dev/tutorial/eas/configure-development-build/ — initializing an EAS project generates a unique `projectId` and links it in app configuration under `extra.eas.projectId`.
- Current Phim Việt `app.config.ts` has dynamic `extra: publicRuntime` with no `extra.eas.projectId`; `eas.json` has `preview` (internal phone APK) and `preview_tv` (internal TV APK, `EXPO_TV=1`). Dashboard shows generic `The build failed. Please try again.`
- Dashboard build token is sensitive; never inspect, copy to shell, or expose it. The user approved creating a new EAS project; authentication must occur in the browser.

## Official Manus Help — distinguish quota failure from generic build failure (2026-10-06)
URL: https://help.manus.im/en/articles/16997172-why-do-i-see-expo-build-quota-exceeded-when-building-an-android-apk
- The documented quota-specific UI text is “Expo build quota exceeded, please upgrade your Expo plan.” Do not infer quota exhaustion from a generic “The build failed. Please try again.”
- Manus uses the connected personal Expo token to request Android builds on Expo cloud; the article says the Expo Free plan includes 15 Android builds/calendar month and that account's projects share quota.
- If quota is not exhausted but the specific quota message persists, the article directs the user to Manus Support with the error screenshot/project details and says not to share the Expo access token.
- Current observation: Manus showed only the generic failure twice; the EAS Builds list for the linked team project displayed no job. This does not establish quota exhaustion or a build log cause.
