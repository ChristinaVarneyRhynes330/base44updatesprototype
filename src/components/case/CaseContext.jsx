import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { base44 } from "@/api/base44Client";
import { ensureDemoWorkspace } from "@/lib/server-fns";
import { asItems } from "@/lib/queryHelpers";

const CaseContext = createContext(null);

export function CaseProvider({ children }) {
  const ensureWorkspace = useServerFn(ensureDemoWorkspace);
  const [state, setState] = useState({
    cases: [],
    activeCase: null,
    records: [],
    citations: [],
    timeline: [],
    issues: [],
    tasks: [],
    drafts: [],
    hearingNotes: [],
    progress: [],
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const retryRef = useRef(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const workspaceResult = await ensureWorkspace({ data: {} });
        const cases = workspaceResult?.cases || [];
        const active =
          cases.find((item) => item.id === activeCaseId) || workspaceResult?.activeCase || cases[0] || null;

        if (!active) {
          if (alive) {
            setState((current) => ({ ...current, cases, activeCase: null, loading: false }));
          }
          return;
        }

        const [records, citations, timeline, issues, tasks, drafts, hearingNotes, progress] =
          await Promise.all([
            base44.entities.EvidenceRecord.filter(
              { case_id: active.id },
              { sort: "-event_date", limit: 100 }
            ),
            base44.entities.StatementCitation.filter({ case_id: active.id }, { limit: 200 }),
            base44.entities.TimelineEvent.filter(
              { case_id: active.id },
              { sort: "event_date", limit: 200 }
            ),
            base44.entities.InvestigativeIssue.filter(
              { case_id: active.id },
              { sort: "-created_date", limit: 60 }
            ),
            base44.entities.ActionTask.filter({ case_id: active.id }, { limit: 200 }),
            base44.entities.DraftDocument.filter(
              { case_id: active.id },
              { sort: "-created_date", limit: 60 }
            ),
            base44.entities.HearingNote.filter(
              { case_id: active.id },
              { sort: "-hearing_date", limit: 40 }
            ),
            base44.entities.LearningModuleProgress.filter({}, { limit: 40 }),
          ]);

        if (!alive) return;
        if (asItems(records).length === 0 && retryRef.current < 2) {
          retryRef.current += 1;
          setTimeout(() => setReloadKey((key) => key + 1), 900);
        }
        setState({
          cases,
          activeCase: active,
          records: asItems(records),
          citations: asItems(citations),
          timeline: asItems(timeline),
          issues: asItems(issues),
          tasks: asItems(tasks),
          drafts: asItems(drafts),
          hearingNotes: asItems(hearingNotes),
          progress: asItems(progress),
          loading: false,
          error: null,
        });
      } catch (error) {
        if (alive) {
          setState((current) => ({ ...current, loading: false, error }));
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [ensureWorkspace, activeCaseId, reloadKey]);

  const createCase = useCallback(
    async (payload) => {
      const workspace = await base44.entities.CaseWorkspace.create(payload);
      setActiveCaseId(workspace.id);
      setReloadKey((key) => key + 1);
      return workspace;
    },
    []
  );

  const selectCase = useCallback((workspace) => {
    setActiveCaseId(workspace.id);
  }, []);

  const value = useMemo(
    () => ({ ...state, reload, createCase, selectCase, setActiveCaseId }),
    [state, reload, createCase, selectCase]
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCase() {
  const context = useContext(CaseContext);
  if (!context) throw new Error("useCase must be used inside CaseProvider");
  return context;
}