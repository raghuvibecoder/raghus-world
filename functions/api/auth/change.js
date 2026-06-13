// functions/api/auth/change.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { role, currentPassword, newPassword } = await request.json();
    if (!role || !currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const key = role === 'admin' ? 'admin_password' : 'site_password';
    
    // Verify current password
    const existingPassword = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first("value");
    
    if (currentPassword !== existingPassword) {
      return new Response(JSON.stringify({ error: 'Incorrect current password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update password
    await env.DB.prepare("UPDATE settings SET value = ? WHERE key = ?").bind(newPassword, key).run();

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
