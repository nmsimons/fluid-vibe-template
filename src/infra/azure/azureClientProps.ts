/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import type {
	AzureRemoteConnectionConfig,
	AzureClientProps,
	AzureLocalConnectionConfig,
	ITelemetryBaseLogger,
} from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "./azureTokenProvider.js";
import { AzureFunctionTokenProvider, azureUser, user } from "./azureTokenProvider.js";

const azureEnvVars = [
	"AZURE_CLIENT_ID",
	"AZURE_REDIRECT_URI",
	"AZURE_TENANT_ID",
	"AZURE_FUNCTION_TOKEN_PROVIDER_URL",
	"AZURE_ORDERER",
];

const requestedClient = process.env.FLUID_CLIENT;
const azureConfigAvailable = azureEnvVars.every((envKey) => Boolean(process.env[envKey]));
const useLocalClient = requestedClient === "local" || !azureConfigAvailable;

if (useLocalClient) {
	console.warn(`Configured to use local tinylicious.`);
}

const localConnectionConfig: AzureLocalConnectionConfig = {
	type: "local",
	tokenProvider: new InsecureTokenProvider("VALUE_NOT_USED", user),
	endpoint: "http://localhost:7070",
};

export function getClientProps(
	user?: typeof azureUser,
	logger?: ITelemetryBaseLogger
): AzureClientProps {
	const remoteConnectionConfig: AzureRemoteConnectionConfig = {
		type: "remote",
		tenantId: process.env.AZURE_TENANT_ID!,
		tokenProvider: new AzureFunctionTokenProvider(
			process.env.AZURE_FUNCTION_TOKEN_PROVIDER_URL!,
			user ?? azureUser
		),
		endpoint: process.env.AZURE_ORDERER!,
	};

	const connectionConfig: AzureRemoteConnectionConfig | AzureLocalConnectionConfig =
		!useLocalClient ? remoteConnectionConfig : localConnectionConfig;

	return {
		connection: connectionConfig,
		logger,
	};
}
