"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

export type LangAlternates = Partial<Record<Lang, string>>;

interface LangAlternatesContextValue {
  alternates: LangAlternates;
  setAlternates: (alternates: LangAlternates) => void;
}

const LangAlternatesContext = createContext<LangAlternatesContextValue | null>(null);

// Monté une fois dans le layout racine : porte les URLs alternates par
// langue de la page actuellement affichée, par défaut vide (le
// LangSwitcher retombe alors sur un simple remplacement du segment /{lang}).
export function LangAlternatesProvider({ children }: { children: React.ReactNode }) {
  const [alternates, setAlternates] = useState<LangAlternates>({});
  return (
    <LangAlternatesContext.Provider value={{ alternates, setAlternates }}>
      {children}
    </LangAlternatesContext.Provider>
  );
}

export function useLangAlternates() {
  const ctx = useContext(LangAlternatesContext);
  if (!ctx) throw new Error("useLangAlternates doit être utilisé dans LangAlternatesProvider");
  return ctx;
}

// À monter depuis une page dont l'URL change par langue (ex: page article,
// dont le slug est différent par traduction) pour déclarer ses vraies
// URLs alternates. Se réinitialise au démontage pour ne pas polluer la
// navigation suivante.
export function SetLangAlternates({ alternates }: { alternates: LangAlternates }) {
  const { setAlternates } = useLangAlternates();
  const key = JSON.stringify(alternates);

  useEffect(() => {
    setAlternates(alternates);
    return () => setAlternates({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
