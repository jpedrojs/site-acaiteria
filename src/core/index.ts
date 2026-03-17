/**
 * Core - Camada de arquitetura MVC
 *
 * Estrutura:
 * - dto: Data Transfer Objects
 * - repositories: Acesso a dados (Supabase)
 * - services: Lógica de negócio
 * - controllers: Hooks React que conectam services à View
 */

export * from "./dto";
export * from "./repositories";
export * from "./services";
export * from "./controllers";
