import { createContext, ReactNode, useContext } from "react";

type AppContextValue = {
  organization: string;
};

const AppContext = createContext<AppContextValue>({ organization: "EcoSphere" });

export function AppProvider({ children }: { children: ReactNode }) {
  return <AppContext.Provider value={{ organization: "EcoSphere" }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
