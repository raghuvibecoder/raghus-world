// functions/api/sync.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Verify Admin authorization
  const adminPassword = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_password'").first("value");
  const adminToken = request.headers.get('X-Admin-Token');
  
  if (adminToken !== adminPassword) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { buttons = [], links = [], notes = [], tasks = [] } = await request.json();

  try {
    // 1. Sync Notes
    await env.DB.prepare("DELETE FROM notes").run();
    for (const note of notes) {
      await env.DB.prepare("INSERT INTO notes (content, color) VALUES (?, ?)")
        .bind(note.content, note.color || '#fef08a')
        .run();
    }

    // 2. Sync Tasks
    await env.DB.prepare("DELETE FROM tasks").run();
    for (const task of tasks) {
      await env.DB.prepare("INSERT INTO tasks (text, completed) VALUES (?, ?)")
        .bind(task.text, task.completed ? 1 : 0)
        .run();
    }

    // 3. Sync Links (Google Sheets, Docs, Documents, Game)
    await env.DB.prepare("DELETE FROM links").run();
    for (const link of links) {
      await env.DB.prepare("INSERT INTO links (type, title, url, icon) VALUES (?, ?, ?, ?)")
        .bind(link.type, link.title, link.url, link.icon || null)
        .run();
    }

    // 4. Sync Buttons
    // Delete existing buttons
    await env.DB.prepare("DELETE FROM buttons").run();

    // Map template buttons for easy lookup
    const templateMap = {};
    for (const btn of buttons) {
      const key = `${btn.grade}_${btn.section || 'null'}_${btn.set_num}_${btn.lesson_name}`;
      templateMap[key] = btn;
    }

    // We need 2 sets of 7, 7 buttons (total 14 buttons) for each grade and section:
    // - Grade 2 (Section A, B)
    // - Grade 3 (Section A, B)
    // - Grade 4, 5, 6, 7, 8 (no section)
    const gradeConfigs = [
      { grade: '2', sections: ['A', 'B'] },
      { grade: '3', sections: ['A', 'B'] },
      { grade: '4', sections: [null] },
      { grade: '5', sections: [null] },
      { grade: '6', sections: [null] },
      { grade: '7', sections: [null] },
      { grade: '8', sections: [null] },
    ];

    // Collect all buttons to insert
    const insertPromises = [];
    
    for (const config of gradeConfigs) {
      for (const sect of config.sections) {
        // Find existing template buttons for this grade/section
        const matchingTemplates = buttons.filter(
          b => b.grade === config.grade && 
               (b.section === sect || (sect === null && !b.section))
        );

        // We need 14 buttons (Set 1: 7 buttons, Set 2: 7 buttons)
        for (let setNum = 1; setNum <= 2; setNum++) {
          const setTemplates = matchingTemplates.filter(b => b.set_num === setNum);
          
          for (let btnIdx = 1; btnIdx <= 7; btnIdx++) {
            let lessonName = "";
            let url = "https://google.com";

            // If template exists for this index, use it, otherwise generate a default one
            if (setTemplates[btnIdx - 1]) {
              lessonName = setTemplates[btnIdx - 1].lesson_name;
              url = setTemplates[btnIdx - 1].url;
            } else {
              const sectLabel = sect ? ` Sec ${sect}` : '';
              lessonName = `Grade ${config.grade}${sectLabel} - Lesson ${setNum}.${btnIdx}`;
              url = "https://wikipedia.org";
            }

            insertPromises.push(
              env.DB.prepare("INSERT INTO buttons (grade, section, set_num, lesson_name, url) VALUES (?, ?, ?, ?, ?)")
                .bind(config.grade, sect, setNum, lessonName, url)
                .run()
            );
          }
        }
      }
    }

    await Promise.all(insertPromises);

    return new Response(JSON.stringify({ success: true, message: 'Seeded successfully' }), {
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
