import { onRequestPost as __api_auth_change_js_onRequestPost } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\auth\\change.js"
import { onRequestPost as __api_auth_login_js_onRequestPost } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\auth\\login.js"
import { onRequestDelete as __api_buttons_js_onRequestDelete } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\buttons.js"
import { onRequestGet as __api_buttons_js_onRequestGet } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\buttons.js"
import { onRequestPost as __api_buttons_js_onRequestPost } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\buttons.js"
import { onRequestPut as __api_buttons_js_onRequestPut } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\buttons.js"
import { onRequestDelete as __api_links_js_onRequestDelete } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\links.js"
import { onRequestGet as __api_links_js_onRequestGet } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\links.js"
import { onRequestPost as __api_links_js_onRequestPost } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\links.js"
import { onRequestPut as __api_links_js_onRequestPut } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\links.js"
import { onRequestDelete as __api_notes_js_onRequestDelete } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\notes.js"
import { onRequestGet as __api_notes_js_onRequestGet } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\notes.js"
import { onRequestPost as __api_notes_js_onRequestPost } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\notes.js"
import { onRequestPost as __api_sync_js_onRequestPost } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\sync.js"
import { onRequestDelete as __api_tasks_js_onRequestDelete } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\tasks.js"
import { onRequestGet as __api_tasks_js_onRequestGet } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\tasks.js"
import { onRequestPost as __api_tasks_js_onRequestPost } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\tasks.js"
import { onRequestPut as __api_tasks_js_onRequestPut } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\api\\tasks.js"
import { onRequest as ___middleware_js_onRequest } from "C:\\Users\\raghu\\.gemini\\antigravity\\scratch\\raghus-world\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/auth/change",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_change_js_onRequestPost],
    },
  {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/buttons",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_buttons_js_onRequestDelete],
    },
  {
      routePath: "/api/buttons",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_buttons_js_onRequestGet],
    },
  {
      routePath: "/api/buttons",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_buttons_js_onRequestPost],
    },
  {
      routePath: "/api/buttons",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_buttons_js_onRequestPut],
    },
  {
      routePath: "/api/links",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_links_js_onRequestDelete],
    },
  {
      routePath: "/api/links",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_links_js_onRequestGet],
    },
  {
      routePath: "/api/links",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_links_js_onRequestPost],
    },
  {
      routePath: "/api/links",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_links_js_onRequestPut],
    },
  {
      routePath: "/api/notes",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_notes_js_onRequestDelete],
    },
  {
      routePath: "/api/notes",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_notes_js_onRequestGet],
    },
  {
      routePath: "/api/notes",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_notes_js_onRequestPost],
    },
  {
      routePath: "/api/sync",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_sync_js_onRequestPost],
    },
  {
      routePath: "/api/tasks",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_tasks_js_onRequestDelete],
    },
  {
      routePath: "/api/tasks",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_tasks_js_onRequestGet],
    },
  {
      routePath: "/api/tasks",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_tasks_js_onRequestPost],
    },
  {
      routePath: "/api/tasks",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_tasks_js_onRequestPut],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]