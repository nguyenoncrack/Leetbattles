import { createApp } from "./app";
import { env } from "./utils/env";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(
    `CodeClash API listening on http://localhost:${env.PORT} ` +
      `(LeetCode mode: ${env.LEETCODE_MODE})`
  );
});
