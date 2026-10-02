export interface JurisdictionRuleResponse {
  id: string;
  province: string;
  ruleType: string;
  description: string;
  effectiveDate: string;
  source: string;
  version: number;
  createdAt: string;
}

export interface CreateJurisdictionRuleRequest {
  province: string;
  ruleType: string;
  description: string;
  effectiveDate: string;
  source: string;
  version: number;
}

export interface AuditLogResponse {
  id: string;
  organizationId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  occurredAt: string;
}
