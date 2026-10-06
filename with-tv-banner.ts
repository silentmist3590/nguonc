import {
  ConfigPlugin,
  withAndroidManifest,
  withDangerousMod,
} from "@expo/config-plugins";
import fs from "node:fs/promises";
import path from "node:path";

const withTvBanner: ConfigPlugin = (config) => {
  if (process.env.EXPO_TV !== "1") return config;

  config = withAndroidManifest(config, (modConfig) => {
    const application = modConfig.modResults.manifest.application?.[0];
    if (!application) throw new Error("Android application manifest entry is missing");
    application.$ = application.$ ?? {};
    application.$["android:banner"] = "@drawable/phimviet_tv_banner";
    return modConfig;
  });

  return withDangerousMod(config, ["android", async (modConfig) => {
    const source = path.join(modConfig.modRequest.projectRoot, "assets/images/android-tv-banner.png");
    const destinationDirectory = path.join(
      modConfig.modRequest.platformProjectRoot,
      "app/src/main/res/drawable-xhdpi",
    );
    await fs.mkdir(destinationDirectory, { recursive: true });
    await fs.copyFile(source, path.join(destinationDirectory, "phimviet_tv_banner.png"));
    return modConfig;
  }]);
};

export default withTvBanner;
