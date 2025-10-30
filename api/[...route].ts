import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    console.log("Request URL:", req.url);
    console.log("CWD:", process.cwd());
    
    // Try to serve the requested file from dist/public
    const urlPath = req.url.split("?")[0];
    const filePath = path.join(process.cwd(), "dist", "public", urlPath === "/" ? "index.html" : urlPath);
    
    console.log("Requested file path:", filePath);
    
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      console.log("File exists, is file:", stat.isFile());
      
      if (stat.isFile()) {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath);
        
        // Set appropriate content type
        const contentTypes: { [key: string]: string } = {
          ".html": "text/html; charset=utf-8",
          ".js": "application/javascript; charset=utf-8",
          ".css": "text/css; charset=utf-8",
          ".json": "application/json",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".svg": "image/svg+xml",
          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".ttf": "font/ttf",
          ".eot": "application/vnd.ms-fontobject",
        };
        
        const contentType = contentTypes[ext] || "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", ext === ".html" ? "no-cache" : "public, max-age=31536000");
        return res.status(200).send(content);
      }
    }
    
    console.log("File not found, trying index.html");
    
    // Fallback to index.html for SPA routing
    const indexPath = path.join(process.cwd(), "dist", "public", "index.html");
    console.log("Index path:", indexPath);
    
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      return res.status(200).send(content);
    }
    
    console.log("Index.html not found!");
    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error("Error serving file:", error);
    return res.status(500).json({ error: "Internal server error", message: String(error) });
  }
};

