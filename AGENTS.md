## Product

This project is a hackathon prototype built in Paris. The demo deadline is 18:30 local time.

The app helps farmers understand and act on data about their parcels. It shows essential parcel information clearly and provides an AI assistant that can explain issues, summarize context, and suggest or trigger simple parcel actions.

Main demo data sources:
- Satellite imagery signals
- Sensors
- Drone observations
- Public documents
- Weather APIs

The prototype only needs one demo user and a small number of realistic data points. Prioritize a clear outcome that judges can understand quickly over production depth.

## Time Sensitivity

- Be explicit when a requested feature is too large for the remaining hackathon time.
- Prefer the smallest useful demoable implementation.
- Avoid infrastructure, auth, persistence, queues, background jobs, advanced provider integrations, and complex caching unless explicitly required.
- Mock provider data when real integration would threaten the deadline.

## Core Architecture Principle

Keep each layer responsible for one thing:
- Pages render routes and fetch initial server data.
- Components display UI and handle interaction.
- Hooks contain reusable client-side stateful logic.
- Client API wrappers call backend endpoints.
- API routes translate HTTP into clean service calls.
- Services contain business logic.
- DB modules contain database access or demo data access.
- Integrations contain third-party provider code.

Do not let UI components contain business workflows. Do not let route handlers contain database-heavy logic. Do not let database modules know about HTTP requests.

## Code Style

- **HTTP:** use appropriate HTTP status codes for success and error cases.
- **API responses:** `{ success: true, data }` on success, `{ error: string }` on error.
- **File naming:** kebab-case with file type/purpose, e.g. `parcel-card.tsx`, `use-assistant.ts`.
- **Naming:** keep identifiers concise and domain-first. Do not leak provider details into business-level abstractions unless the file is inside `lib/integrations/{provider}/`.
- **URLs:** no trailing slashes on internal URLs, paths, or links.
- **Language:** English only for the hackathon demo.
- **Forms:** use custom validation messages, not native browser error messages.
- **Imports:** use `@/` for internal imports and `import type` for type-only imports.

## Frontend Conventions

- Design desktop-first for the hackathon demo. The primary experience should be optimized for a laptop or projected desktop viewport, while remaining usable on mobile.
- Prefer Server Components by default.
- Use Client Components only for hooks, event handlers, browser APIs, or local interactive state.
- Server Components may read initial data through services or `lib/db/*`.
- Client Components must not call database modules directly. They should call backend routes through `lib/api/*` wrappers.
- Shared generic UI goes in `components/ui/*`.
- Domain-specific UI goes in `components/{feature}/*`.
- Use named exports for reusable components.
- Use default exports only for pages.
- Avoid `React.FC`; use direct function declarations.

## Backend Conventions

- API routes live at `app/api/[resource]/route.ts` or `app/api/[resource]/[id]/route.ts`.
- Route-specific validation belongs beside the route in `validation.ts` when it is more than trivial.
- Route handlers should only do request parsing, structural validation, service delegation, and HTTP responses.
- Services live in `lib/services/{feature}.ts` and contain business rules or multi-step workflows.
- DB modules live in `lib/db/{feature}.ts` and contain queries, demo data access, and row-to-domain mapping.
- Integrations live in `lib/integrations/{provider}/` with `client.ts` and, when needed, `service.ts`.

## Recommended Folder Structure

```txt
app/
  api/
    resource/
      route.ts
      validation.ts
components/
  ui/
  parcels/
  assistant/
hooks/
lib/
  api/
  db/
  services/
  integrations/
  utils/
types/
```

Skip unless needed: real auth, complex i18n, analytics, background workflows, admin dashboards, provider-heavy integrations.

## Security

- Do not expose secrets in client code.
- Validate all API inputs server-side.
- Return generic API errors only.
- Do not use `dangerouslySetInnerHTML`.
- Real auth is intentionally out of scope for this prototype; use a mocked demo user.

## Workflow

- Use pnpm.
- Run `pnpm tsc --noEmit` before pushing.
- For this hackathon, also run lint and build when time allows.
