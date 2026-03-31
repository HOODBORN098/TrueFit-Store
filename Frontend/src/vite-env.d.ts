/// <reference types="vite/client" />

/**
 * Declare the custom environment variables used in this project.
 * All variables MUST be prefixed with VITE_ to be exposed to client-side code.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
