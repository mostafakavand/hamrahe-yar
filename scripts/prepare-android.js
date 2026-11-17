
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
    throw new Error("Native Android source or destination directory not found.");
  }

  fs.cpSync(source, destination, {
    recursive: true,
    force: true
  });

  console.log("Native Android files copied successfully.");

  // Generate Android launcher icons
  const logo = path.join(root, "icons", "icon-512.png");
  const res = path.join(root, "android", "app", "src", "main", "res");

  if (!fs.existsSync(logo)) {
    throw new Error("App logo not found: icons/icon-512.png");
  }

  const densities = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
  };

  for (const [folder, size] of Object.entries(densities)) {
    const dir = path.join(res, folder);
    fs.mkdirSync(dir, { recursive: true });

    for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) {
      await sharp(logo)
        .resize(size, size, { fit: "contain" })
        .png()
        .toFile(path.join(dir, name));
    }
  }

  // Generate adaptive icon foreground
  const foregroundDir = path.join(res, "drawable-nodpi");
  fs.mkdirSync(foregroundDir, { recursive: true });

  await sharp(logo)
    .resize(180, 180, { fit: "contain" })
    .extend({
      top: 126,
      bottom: 126,
      left: 126,
      right: 126,
      background: { r: 0, g: 59, b: 42, alpha: 0 }
    })
    .png()
    .toFile(path.join(foregroundDir, "ic_launcher_foreground.png"));

  // Adaptive icon background color
  const valuesDir = path.join(res, "values");
  fs.mkdirSync(valuesDir, { recursive: true });

  fs.writeFileSync(
    path.join(valuesDir, "ic_launcher_background.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#003B2A</color>
</resources>
`,
    "utf8"
  );

  // Adaptive icon XML files
  const adaptiveDir = path.join(res, "mipmap-anydpi-v26");
  fs.mkdirSync(adaptiveDir, { recursive: true });

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
`;

  for (const name of ["ic_launcher.xml", "ic_launcher_round.xml"]) {
    fs.writeFileSync(path.join(adaptiveDir, name), adaptiveXml, "utf8");
  }

  console.log("Hamrah-e-Yar Android launcher icons generated successfully.");
}

prepareAndroid().catch(error => {
  console.error(error);
  process.exit(1);
});
