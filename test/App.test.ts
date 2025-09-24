/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { test, expect } from "@playwright/test";

test.describe("Vibe template smoke test", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "domcontentloaded" });
	});

	test("renders the collaborative scaffold", async ({ page }) => {
		await expect(page.getByRole("heading", { name: /Fluid Framework Demo/i })).toBeVisible();
		await expect(page.getByText(/Ready for vibe coding/i)).toBeVisible();
		await expect(page.getByText(/Tree data/i)).toBeVisible();
		await expect(page.getByText(/Presence services/i)).toBeVisible();
		await expect(page.getByText(/Auth & tokens/i)).toBeVisible();
	});
});
