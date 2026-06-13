// functions/api/buttons.js

// Authorization check helper
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

  const url = new URL(request.url);
  const grade = url.searchParams.get('grade');
  const section = url.searchParams.get('section'); // null or 'A' or 'B'

  try {
    let query = "SELECT * FROM buttons";
    let params = [];

    if (grade) {
      if (section && section !== 'null' && section !== 'undefined') {
        query += " WHERE grade = ? AND section = ?";
        params = [grade, section];
      } else {
        query += " WHERE grade = ? AND (section IS NULL OR section = '')";
        params = [grade];
      }
    }

    query += " ORDER BY set_num ASC, id ASC";

    const { results } = await env.DB.prepare(query).bind(...params).all();
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
    const { grade, section, set_num, lesson_name, url } = await request.json();

    if (!grade || !set_num || !lesson_name || !url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanSection = section && section !== 'null' ? section : null;

    const result = await env.DB.prepare(
      "INSERT INTO buttons (grade, section, set_num, lesson_name, url) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(grade, cleanSection, parseInt(set_num), lesson_name, url)
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
    const { id, grade, section, set_num, lesson_name, url } = await request.json();

    if (!id || !grade || !set_num || !lesson_name || !url) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanSection = section && section !== 'null' ? section : null;

    await env.DB.prepare(
      "UPDATE buttons SET grade = ?, section = ?, set_num = ?, lesson_name = ?, url = ? WHERE id = ?"
    )
    .bind(grade, cleanSection, parseInt(set_num), lesson_name, url, id)
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
    return new Response(JSON.stringify({ error: 'Missing button ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await env.DB.prepare("DELETE FROM buttons WHERE id = ?").bind(id).run();
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
