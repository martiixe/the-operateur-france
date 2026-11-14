"use client";
import { createContext, useContext } from "react";
import type { Mission } from "@/game/missions";
import type { Save } from "@/game/save";
import type { Clue, VType } from "@/game/world";

export type WinType =
  | "explorer"
  | "video"
  | "scan"
  | "photo"
  | "doc"
  | "list"
  | "humandb"
  | "registry"
  | "terminal"
  | "notes"
  | "profile"
  | "manage"
  | "help";

export interface GameCtx {
  mission: Mission;
  revealed: Record<string, boolean>;
  visibleCount: number;
  reveal: (id: string) => void;
  openEv: (id: string) => void;
  openApp: (type: WinType, props?: Record<string, unknown>) => void;
  openProfile: (id: number) => void;
  openRegistry: (vtype: VType, plate?: string) => void;
  listIds: number[] | null;
  setListIds: (ids: number[]) => void;
  listFilter: boolean;
  setListFilter: (b: boolean) => void;
  clues: Clue[];
  penalize: (n: number) => void;
  save: Save;
  updateSave: (f: (s: Save) => Save) => void;
  grade: number;
  clearance: number;
  opName: string;
}

export const GameContext = createContext<GameCtx | null>(null);

export function useGame(): GameCtx {
  const c = useContext(GameContext);
  if (!c) throw new Error("no game ctx");
  return c;
}
