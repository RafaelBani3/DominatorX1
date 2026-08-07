import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("→ Running prisma generate...");
run("npx", ["prisma", "generate"]);

const markers = [
  path.join("node_modules", ".prisma", "client", "default.js"),
  path.join("node_modules", "@prisma", "client", "default.js"),
  path.join("node_modules", ".prisma", "client", "index.js"),
];

if (!markers.some((file) => existsSync(file))) {
  console.error("✗ Prisma Client was not generated. Aborting build.");
  process.exit(1);
}

console.log("✓ Prisma Client ready");
console.log("→ Running next build...");
run("npx", ["next", "build"]);
