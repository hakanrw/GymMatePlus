import { createContext, useContext } from "react";

export const AppContext = createContext({
    ping: () => {}
});
  
export const useAppContext = () => useContext(AppContext);