import { SchemaFactoryAlpha } from "@fluidframework/tree/alpha";
import { TreeViewConfiguration } from "fluid-framework";

/**
 * SharedTree schema for the vibe template.
 *
 * 👉 How to extend:
 * - Add new domain classes with `sf.object` below `AppMetadata`.
 * - Reference those classes from `App` to make them part of the tree.
 * - Update `createInitialAppState` so new nodes have reasonable defaults.
 * - Prefer `metadata.description` for fields so design tools and future LLMs
 *   can reason about the shape of your data.
 */
const sf = new SchemaFactoryAlpha("95f2e010-5c4a-4b3f-bf1f-1e5d3867c9c1");

/**
 * Top-level metadata describing the workspace session.
 * Keep these fields minimal and human-friendly—clients often surface them in headers.
 */
export class AppMetadata extends sf.object("AppMetadata", {
	title: sf.required(sf.string, {
		metadata: {
			description: "Primary title shown in the template header or navigation.",
		},
	}),
	tagline: sf.optional(sf.string, {
		metadata: {
			description: "Short description that sets the vibe for collaborators.",
		},
	}),
}) {}

/**
 * Root object for the application.
 *
 * 🪄 Add new collaborative data by declaring extra properties.
 * Example:
 * ```ts
 * export class Task extends sf.object("Task", { ... }) {}
 * export class App extends sf.object("App", {
 *   metadata: AppMetadata,
 *   tasks: sf.array([Task]),
 * }) {}
 * ```
 */
export class App extends sf.object("App", {
	metadata: AppMetadata,
}) {}

/**
 * Factory that prepares an initial value for the root node.
 *
 * Update this when you add new properties to `App` so freshly created containers
 * start with sensible defaults.
 */
export function createInitialAppState(): App {
	return new App({
		metadata: new AppMetadata({
			title: "New vibe session",
			tagline: "Sketch ideas, explore concepts, and ship together.",
		}),
	});
}

/**
 * Consumers obtain a typed view of the SharedTree by calling
 * `viewWith(appTreeConfiguration)` on the underlying DDS.
 */
export const appTreeConfiguration = new TreeViewConfiguration({ schema: App });
