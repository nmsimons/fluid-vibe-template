/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

// Import polyfills for iOS compatibility
import "./polyfills/crypto.js";
import "./polyfills/ios.js";

const azureEnvVars = [
	"AZURE_CLIENT_ID",
	"AZURE_REDIRECT_URI",
	"AZURE_TENANT_ID",
	"AZURE_FUNCTION_TOKEN_PROVIDER_URL",
	"AZURE_ORDERER",
] as const;

function hasAllAzureEnv(): boolean {
	return azureEnvVars.every((envKey) => Boolean(process.env[envKey]));
}

// Enable mobile debugging in development
if (process.env.NODE_ENV === "development") {
	import("eruda").then((eruda) => eruda.default.init());
}

async function start() {
	const requestedClient = process.env.FLUID_CLIENT;
	const missingAzureConfig = !hasAllAzureEnv();

	const client = requestedClient === "local" || missingAzureConfig ? "local" : "azure";

	if (client === "local" && requestedClient !== "local" && missingAzureConfig) {
		console.warn("Missing Azure configuration detected. Falling back to local Fluid client.");
	}

	switch (client) {
		case "local": {
			// Dynamically load local start to reduce initial bundle
			const { localStart } = await import("./start/localStart.js");
			await localStart();
			break;
		}
		default: {
			// Dynamically load Azure start to reduce initial bundle
			const { azureStart } = await import("./start/azureStart.js");
			await azureStart();
			break;
		}
	}
}

start();
