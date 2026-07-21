import { OpenPanel } from "@openpanel/nextjs";

/**
 * Instance OpenPanel pour le tracking côté serveur
 *
 * ⚠️ IMPORTANT: Ne pas utiliser ce fichier côté client car il contient le clientSecret
 * Utilisez le hook useOpenPanel() dans les composants client
 */
export const op = new OpenPanel({
  clientId: process.env.OPENPANEL_CLIENT_ID || "",
  clientSecret: process.env.OPENPANEL_CLIENT_SECRET || "",
});
