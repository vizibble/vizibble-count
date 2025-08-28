// middlewares/manifest.js
import fs from "fs";
import path from "path";

export function manifestMiddleware(req, res, next) {
    if (process.env.NODE_ENV === "production") {
        const manifest = JSON.parse(
            fs.readFileSync(
                path.resolve(__dirname, "../dist/.vite/manifest.json"),
                "utf8"
            )
        );
        res.locals.manifest = manifest;
    }
    next();
}
