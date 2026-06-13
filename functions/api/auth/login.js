// functions/api/auth/login.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { password } = await request.json();
    if (!password) {
      return new Response(JSON.stringify({ error: 'Password is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get passwords from D1 settings
    const sitePassword = await env.DB.prepare("SELECT value FROM settings WHERE key = 'site_password'").first("value");
    const adminPassword = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_password'").first("value");

    if (password === adminPassword) {
      return new Response(JSON.stringify({ authenticated: true, role: 'admin' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (password === sitePassword) {
      return new Response(JSON.stringify({ authenticated: true, role: 'user' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ authenticated: false, error: 'Incorrect password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
