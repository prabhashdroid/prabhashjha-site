/* `local_backend: true` is what lets the admin run on this Mac with no GitHub
   login. It must NOT be in the deployed config — the live admin would try to
   reach localhost:8081 and fail. So it is injected here, for local use only,
   and the file is restored on exit. */
import fs from "node:fs";
const P = "public/admin/config.yml";
const MARK = "local_backend: true";
let s = fs.readFileSync(P, "utf8");
if (!s.includes(MARK)) {
  fs.writeFileSync(P, s.replace(/^(publish_mode:.*)$/m, `$1\n${MARK}`));
  console.log("  local_backend enabled for this session");
}
const restore = () => {
  const cur = fs.readFileSync(P, "utf8");
  if (cur.includes(MARK)) fs.writeFileSync(P, cur.replace(new RegExp(`\\n${MARK}`), ""));
};
process.on("exit", restore);
process.on("SIGINT", () => { restore(); process.exit(0); });
process.on("SIGTERM", () => { restore(); process.exit(0); });
