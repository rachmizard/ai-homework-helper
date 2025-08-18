import { Env } from "./env-config";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
