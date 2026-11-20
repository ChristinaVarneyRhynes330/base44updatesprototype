import { base44 } from "@/api/base44Client";

export async function logAudit({ caseId, entityType, entityId, entityLabel, action, detail, previousValue }) {
  try {
    await base44.entities.AuditLog.create({
      case_id: caseId,
      entity_type: entityType,
      entity_id: entityId,
      entity_label: entityLabel || "",
      action,
      detail,
      previous_value: previousValue || "",
    });
  } catch {
    // The audit log must never block the parent's work.
  }
}