import test from 'node:test';
import assert from 'node:assert';
import { createAppServer } from '../server.js';

async function startServer() {
  const server = createAppServer();
  await new Promise((resolve) => server.listen(0, resolve));
  return server;
}

test('serves index and blocks directory traversal', async (t) => {
  const server = await startServer();
  t.after(() => server.close());

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const homeResponse = await fetch(`${baseUrl}/`);
  assert.strictEqual(homeResponse.status, 200);

  const traversalResponse = await fetch(`${baseUrl}/..%2Fpackage.json`);
  assert.strictEqual(traversalResponse.status, 403);
  const traversalBody = await traversalResponse.text();
  assert.match(traversalBody, /403/);
});
