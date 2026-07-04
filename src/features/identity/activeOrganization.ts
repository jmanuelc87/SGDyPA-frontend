const activeOrganizationStorageKey = 'sgdypa.activeOrganizationId';

let activeOrganizationId: string | undefined = readStoredActiveOrganizationId();

export function getActiveOrganizationId() {
  return activeOrganizationId;
}

export function setActiveOrganizationId(organizationId: string | undefined) {
  activeOrganizationId = organizationId;

  if (!organizationId) {
    localStorage.removeItem(activeOrganizationStorageKey);
    return;
  }

  localStorage.setItem(activeOrganizationStorageKey, organizationId);
}

function readStoredActiveOrganizationId() {
  return localStorage.getItem(activeOrganizationStorageKey) ?? undefined;
}
