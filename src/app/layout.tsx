import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Operator — Terminal FBI",
  description: "Jeu d'enquête : résolvez des affaires depuis votre bureau d'opérateur du FBI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
