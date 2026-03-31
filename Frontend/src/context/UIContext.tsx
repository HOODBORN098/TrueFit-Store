import { useState, createContext, useContext, ReactNode } from 'react';
interface UIContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  toggleFilter: () => void;
}
const UIContext = createContext<UIContextType | undefined>(undefined);
export function UIProvider({ children }: {children: ReactNode;}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const toggleFilter = () => setFilterOpen((prev) => !prev);
  return (
    <UIContext.Provider
      value={{
        mobileMenuOpen,
        setMobileMenuOpen,
        toggleMobileMenu,
        filterOpen,
        setFilterOpen,
        toggleFilter
      }}>

      {children}
    </UIContext.Provider>);

}
export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}