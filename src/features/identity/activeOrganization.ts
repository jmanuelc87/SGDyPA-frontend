const activeOrganizationStorageKey = 'sgdypa.activeOrganization';
const legacyOrganizationIdKey = 'sgdypa.activeOrganizationId';

export type ActiveOrganizationSelection = {
  // Identificador de la fila elegida (organización + rol).
  selectionId: string;
  organizationId: string;
  role?: string;
};

let activeSelection: ActiveOrganizationSelection | undefined = readStoredSelection();

export function getActiveOrganizationSelection() {
  return activeSelection;
}

export function getActiveOrganizationId() {
  return activeSelection?.organizationId;
}

export function getActiveOrganizationRole() {
  return activeSelection?.role;
}

export function setActiveOrganizationSelection(selection: ActiveOrganizationSelection | undefined) {
  activeSelection = selection;

  if (!selection) {
    localStorage.removeItem(activeOrganizationStorageKey);
    localStorage.removeItem(legacyOrganizationIdKey);
    return;
  }

  localStorage.setItem(activeOrganizationStorageKey, JSON.stringify(selection));
  // Mantiene el esquema anterior (solo id) por compatibilidad con lectores externos.
  localStorage.setItem(legacyOrganizationIdKey, selection.organizationId);
}

function readStoredSelection(): ActiveOrganizationSelection | undefined {
  const raw = localStorage.getItem(activeOrganizationStorageKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<ActiveOrganizationSelection>;
      if (parsed && typeof parsed.organizationId === 'string' && parsed.organizationId) {
        return {
          selectionId: parsed.selectionId ?? parsed.organizationId,
          organizationId: parsed.organizationId,
          role: typeof parsed.role === 'string' ? parsed.role : undefined,
        };
      }
    } catch {
      // Valor corrupto: se ignora y se intenta la migración desde el esquema anterior.
    }
  }

  const legacyId = localStorage.getItem(legacyOrganizationIdKey);
  return legacyId ? { selectionId: legacyId, organizationId: legacyId } : undefined;
}
