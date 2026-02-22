export function appendImportExportLog(container, message, payload = null) {
  if (!container) return;

  const timestamp = new Date().toISOString();
  const serializedPayload = payload ? `\n${JSON.stringify(payload, null, 2)}` : '';
  const line = `[${timestamp}] ${message}${serializedPayload}`;

  container.textContent = `${line}\n${container.textContent || ''}`.trim();
}
