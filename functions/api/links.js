// functions/api/links.js

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
    const { results } = await env.DB.prepare("SELECT * FROM links ORDER BY id ASC").all();
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

  if (!(await checkAuth(request, env, true))) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { type, title, url, icon } = await request.json();

    if (!type || !title || !url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await env.DB.prepare(
      "INSERT INTO links (type, title, url, icon) VALUES (?, ?, ?, ?)"
    )
    .bind(type, title, url, icon || null)
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

  if (!(await checkAuth(request, env, true))) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { id, type, title, url, icon } = await request.json();

    if (!id || !type || !title || !url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await env.DB.prepare(
      "UPDATE links SET type = ?, title = ?, url = ?, icon = ? WHERE id = ?"
    )
    .bind(type, title, url, icon || null, id)
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

  if (!(await checkAuth(request, env, true))) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing link ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await env.DB.prepare("DELETE FROM links WHERE id = ?").bind(id).run();
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
