import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SourceViewerContext = createContext(null);

export function SourceViewerProvider({ children }) {
  const [source, setSource] = useState(null);

  const openSource = useCallback((record, options = {}) => {
    if (!record) return;
    setSource({
      record,
      page: options.page || 1,
      quote: options.quote || "",
      citationId: options.citationId || null,
    });
  }, []);

  const closeSource = useCallback(() => setSource(null), []);

  const setPage = useCallback((page) => {
    setSource((current) => (current ? { ...current, page, quote: "" } : current));
  }, []);

  const value = useMemo(
    () => ({ source, openSource, closeSource, setPage }),
    [source, openSource, closeSource, setPage]
  );

  return <SourceViewerContext.Provider value={value}>{children}</SourceViewerContext.Provider>;
}

export function useSourceViewer() {
  const context = useContext(SourceViewerContext);
  if (!context) throw new Error("useSourceViewer must be used inside SourceViewerProvider");
  return context;
}