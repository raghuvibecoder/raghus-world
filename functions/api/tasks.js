// functions/api/tasks.js

async function checkAuth(request, env, requireAdmin = false) {
  const adminPassword = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_password'").first("value");
  
  if (requireAdmin) {
    const adminToken = request.headers.get('X-Admin-Token');
    return adminToken === adminPassword;
  }

  const sitePassword = await env.DB.prepare("SELECT value FROM settings WHERE key = 'site_password'").first("value");
  const authToken = request.headers.get('Authorization');
  return authToken === sitePassword || authToken === adminPassword;
}

export async function onRequestGet(context) {
  const { request, env } = context;

  if (!(await checkAuth(request, env, false))) {
    return new Response(JSON.stringify({ error: 'Unauthorized access' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await env.DB.prepare("SELECT * FROM tasks ORDER BY id ASC").all();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!(await checkAuth(request, env, false))) {
    return new Response(JSON.stringify({ error: 'Unauthorized access' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { text, completed } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await env.DB.prepare(
      "INSERT INTO tasks (text, completed) VALUES (?, ?)"
    )
    .bind(text, completed ? 1 : 0)
    .run();

    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;

  if (!(await checkAuth(request, env, false))) {
    return new Response(JSON.stringify({ error: 'Unauthorized access' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { id, completed } = await request.json();

    if (id === undefined || completed === undefined) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare("UPDATE tasks SET completed = ? WHERE id = ?")
      .bind(completed ? 1 : 0, id)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;

  // Only admin can delete tasks
  if (!(await checkAuth(request, env, true))) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing task ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
