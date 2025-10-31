import express, { type Express, type Response } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { ENV } from "./env";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// Helper function to inject config into HTML
function injectConfigIntoHtml(html: string): string {
  const config = {
    VITE_APP_ID: process.env.VITE_APP_ID || "proj_stcd_067vinhos",
    VITE_OAUTH_PORTAL_URL: process.env.VITE_OAUTH_PORTAL_URL || "https://api.manus.im",
    VITE_APP_TITLE: process.env.VITE_APP_TITLE || "STCD - Sistema de Controle de Diaristas",
    VITE_APP_LOGO: process.env.VITE_APP_LOGO || "https://067vinhos.com.br/logo-067vinhos.png",
  };
  
  const configScript = `<script>window.__config__ = ${JSON.stringify(config)};</script>`;
  return html.replace("</head>", `${configScript}</head>`);
}

export function serveStatic(app: Express) {
  // Tentar múltiplos caminhos possíveis
  let distPath = path.resolve(import.meta.dirname, "../..", "dist", "public");
  
  // Se não encontrar, tentar a partir do diretório de trabalho
  if (!fs.existsSync(distPath)) {
    distPath = path.resolve(process.cwd(), "dist", "public");
  }
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  } else {
    console.log(`Serving static files from: ${distPath}`);
  }

  // Middleware to intercept and modify HTML responses
  app.use((req, res, next) => {
    // Store the original send function
    const originalSend = res.send.bind(res);
    
    // Override the send function
    res.send = function(data: any) {
      // Check if this is HTML content
      if (typeof data === "string" && data.includes("</head>")) {
        // Inject config into HTML
        data = injectConfigIntoHtml(data);
      }
      
      // Call the original send function
      return originalSend(data);
    };
    
    next();
  });

  // Serve static files
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    res.sendFile(indexPath);
  });
}

