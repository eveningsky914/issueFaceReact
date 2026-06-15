const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export async function analyzeNews(payload) {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    throw new Error(data?.message || data?.detail || `Analysis API failed: ${response.status}`);
  }

  return data;
}
