import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Try to serve the requested file from dist/public
    const filePath = path.join(process.cwd(), "dist", "public", req.url.split("?")[0]);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      
      // Set appropriate content type
      const contentTypes: { [key: string]: string } = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
      };
      
      res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
      return res.status(200).send(content);
    }
    
    // Fallback to index.html for SPA routing
    const indexPath = path.join(process.cwd(), "dist", "public", "index.html");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath);
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(content);
    }
    
    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error("Error serving file:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

