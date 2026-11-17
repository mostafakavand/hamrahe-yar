
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = process.cwd();

async function prepareAndroid() {
  // Copy native Java files
  const source = path.join(
    root,
    "native",
    "android",
    "app",
    "src",
    "main",
    "java"
  );

  const destination = path.join(
    root,
    "android",
    "app",
    "src",
    "main",
    "java"
  );

  if (!fs.existsSync(source) || !fs.existsSync(destination)) {
    throw new Error(
      "Native Android source or destination directory not found."
    );
  }

  fs.cpSync(source, destination, {
    recursive: true,
    force: true
  });

  console.log("Native Android files copied successfully.");

  // Original app icons
  const icon192 = path.join(root, "icons", "icon-192.png");
  const icon512 = path.join(root, "icons", "icon-512.png");

  if (!fs.existsSync(icon192) || !fs.existsSync(icon512)) {
    throw new Error(
      "Original app icons were not found in the icons folder."
    );
  }

  const res = path.join(
    root,
    "android",
    "app",
    "src",
    "main",
    "res"
  );

  // Generate square launcher icons directly from original images.
  // Both source images are square, so no cropping is required.
  const densities = {
    "mipmap-mdpi": {
      size: 48,
      source: icon192
    },
    "mipmap-hdpi": {
      size: 72,
      source: icon192
    },
    "mipmap-xhdpi": {
      size: 96,
      source: icon192
    },
    "mipmap-xxhdpi": {
      size: 144,
      source: icon512
    },
    "mipmap-xxxhdpi": {
      size: 192,
      source: icon512
    }
  };

  for (const [folder, config] of Object.entries(densities)) {
    const dir = path.join(res, folder);

    fs.mkdirSync(dir, {
      recursive: true
    });

    for (const name of [
      "ic_launcher.png",
      "ic_launcher_round.png"
    ]) {
      await sharp(config.source)
        .resize(config.size, config.size, {
          fit: "fill"
        })
        .png()
        .toFile(path.join(dir, name));
    }

    // Remove obsolete adaptive foreground resources.
    fs.rmSync(
      path.join(dir, "ic_launcher_foreground.png"),
      { force: true }
    );
  }

  // Remove adaptive launcher icon definitions.
  const adaptiveDir = path.join(
    res,
    "mipmap-anydpi-v26"
  );

  for (const name of [
    "ic_launcher.xml",
    "ic_launcher_round.xml"
  ]) {
    fs.rmSync(
      path.join(adaptiveDir, name),
      { force: true }
    );
  }

  // Remove obsolete foreground and background resources.
  const obsoleteFiles = [
    "drawable-nodpi/ic_launcher_foreground.png",
    "drawable-v24/ic_launcher_foreground.xml",
    "drawable/ic_launcher_background.xml",
    "values/ic_launcher_background.xml"
  ];

  for (const file of obsoleteFiles) {
    fs.rmSync(
      path.join(res, file),
      { force: true }
    );
  }

  // Remove roundIcon reference from AndroidManifest.
  // The launcher will use the original square ic_launcher.png.
  const manifestPath = path.join(
    root,
    "android",
    "app",
    "src",
    "main",
    "AndroidManifest.xml"
  );

  if (!fs.existsSync(manifestPath)) {
    throw new Error("AndroidManifest.xml was not found.");
  }

  let manifest = fs.readFileSync(manifestPath, "utf8");

  manifest = manifest.replace(
    /\s+android:roundIcon="[^"]*"/,
    ""
  );

  fs.writeFileSync(
    manifestPath,
    manifest,
    "utf8"
  );

  console.log(
    "Original square launcher icons generated successfully."
  );
}

prepareAndroid().catch((error) => {
  console.error("Android preparation failed:", error);
  process.exit(1);
});
