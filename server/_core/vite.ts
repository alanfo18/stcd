import express, { type Express } from "express";
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

  app.use(express.static(distPath));

  // Middleware to inject config into HTML
  app.use("*", (req, res, next) => {
    const originalSendFile = res.sendFile.bind(res);
    res.sendFile = function(filepath: string, options?: any, callback?: any) {
      if (filepath.endsWith("index.html")) {
        // Read and modify the HTML
        fs.readFile(filepath, "utf-8", (err, data) => {
          if (err) {
            return originalSendFile(filepath, options, callback);
          }
          
          // Create config object with environment variables
          const config = {
            VITE_APP_ID: process.env.VITE_APP_ID || "proj_stcd_067vinhos",
            VITE_OAUTH_PORTAL_URL: process.env.VITE_OAUTH_PORTAL_URL || "https://api.manus.im",
            VITE_APP_TITLE: process.env.VITE_APP_TITLE || "STCD - Sistema de Controle de Diaristas",
            VITE_APP_LOGO: process.env.VITE_APP_LOGO || "https://067vinhos.com.br/logo-067vinhos.png",
          };
          
          // Inject config script into HTML
          const configScript = `<script>window.__config__ = ${JSON.stringify(config)};</script>`;
          const modifiedHtml = data.replace("</head>", `${configScript}</head>`);
          
          res.set({ "Content-Type": "text/html" });
          res.send(modifiedHtml);
        });
      } else {
        return originalSendFile(filepath, options, callback);
      }
    };
    next();
  });

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
