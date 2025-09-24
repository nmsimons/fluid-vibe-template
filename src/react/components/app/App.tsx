/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { JSX, useContext, useEffect, useState } from "react";
import { ConnectionState, IFluidContainer, TreeView } from "fluid-framework";
import { App } from "../../../schema/appSchema.js";
import "../../../output.css";
import "../../../styles/ios-minimal.css";
import type { SelectionManager } from "../../../presence/Interfaces/SelectionManager.js";
import type { UsersManager } from "../../../presence/Interfaces/UsersManager.js";
import type { DragManager } from "../../../presence/Interfaces/DragManager.js";
import type { DragAndRotatePackage } from "../../../presence/drag.js";
import type { ResizeManager, ResizePackage } from "../../../presence/Interfaces/ResizeManager.js";
import type { CursorManager } from "../../../presence/Interfaces/CursorManager.js";
import type { InkPresenceManager } from "../../../presence/Interfaces/InkManager.js";
import { TypedSelection } from "../../../presence/selection.js";
import { undoRedo } from "../../../undo/undo.js";
import { useTree } from "../../hooks/useTree.js";
import { PresenceContext } from "../../contexts/PresenceContext.js";
import { AuthContext } from "../../contexts/AuthContext.js";
import { signOutHelper, switchAccountHelper } from "../../../infra/auth.js";
import {
	Avatar,
	AvatarGroup,
	AvatarGroupItem,
	AvatarGroupPopover,
	AvatarGroupProps,
	partitionAvatarGroupItems,
} from "@fluentui/react-avatar";
import { Text } from "@fluentui/react-text";
import { ToolbarDivider } from "@fluentui/react-toolbar";
import { Tooltip } from "@fluentui/react-tooltip";
import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from "@fluentui/react-menu";
import { SignOut20Regular, PersonSwap20Regular } from "@fluentui/react-icons";
import { User } from "../../../presence/Interfaces/UsersManager.js";

interface ReactAppProps {
	tree: TreeView<typeof App>;
	itemSelection: SelectionManager<TypedSelection>;
	tableSelection: SelectionManager<TypedSelection>;
	users: UsersManager;
	container: IFluidContainer;
	undoRedo: undoRedo;
	drag: DragManager<DragAndRotatePackage | null>;
	resize: ResizeManager<ResizePackage | null>;
	cursor: CursorManager;
	ink?: InkPresenceManager;
}

export function ReactApp({
	tree,
	itemSelection,
	tableSelection,
	users,
	container,
	undoRedo,
	drag,
	resize,
	cursor,
	ink,
}: ReactAppProps): JSX.Element {
	useTree(tree.root, true);

	const sessionTitle = tree.root.metadata?.title ?? "Ready for vibe coding";
	const sessionTagline =
		tree.root.metadata?.tagline ??
		"This template wires up authentication, Fluid data, and real-time presence so you can focus on crafting your experience.";

	const [connectionState, setConnectionState] = useState(() =>
		formatConnectionState(container.connectionState)
	);
	const [saved, setSaved] = useState(!container.isDirty);

	useEffect(() => {
		const handleConnectionState = () =>
			setConnectionState(formatConnectionState(container.connectionState));
		const handleDirty = () => setSaved(false);
		const handleSaved = () => setSaved(true);

		container.on("connected", handleConnectionState);
		container.on("disconnected", handleConnectionState);
		container.on("dirty", handleDirty);
		container.on("saved", handleSaved);
		container.on("disposed", handleConnectionState);

		return () => {
			container.off("connected", handleConnectionState);
			container.off("disconnected", handleConnectionState);
			container.off("dirty", handleDirty);
			container.off("saved", handleSaved);
			container.off("disposed", handleConnectionState);
		};
	}, [container]);

	useEffect(() => () => undoRedo.dispose(), [undoRedo]);

		return (
			<PresenceContext.Provider
				value={{
					users,
					itemSelection,
					tableSelection,
					drag,
					resize,
					cursor,
					branch: false,
					ink,
				}}
			>
				<div className="flex min-h-screen flex-col bg-slate-50 text-neutral-900">
					<Header saved={saved} connectionState={connectionState} title={sessionTitle} />
					<main className="relative flex flex-1 justify-center overflow-hidden">
						<div
							className="pointer-events-none absolute left-1/2 top-[-10%] h-80 w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-r from-pink-200 via-purple-200 to-sky-200 opacity-60 blur-3xl"
							aria-hidden
						/>
						<div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16 md:px-10 lg:py-24">
							<div className="mx-auto max-w-2xl space-y-4 text-center">
								<Text weight="semibold" className="text-3xl md:text-4xl">
									{sessionTitle}
								</Text>
								<Text className="text-base text-neutral-600 md:text-lg">{sessionTagline}</Text>
							</div>
							<section className="grid gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-sm sm:grid-cols-2">
								<TemplateCallout
									title="Tree data"
									body="Use the `tree` prop provided to `ReactApp` to bind your own SharedTree views. Subscribe with the `useTree` hook to keep components in sync."
								/>
								<TemplateCallout
									title="Presence services"
									body="Access cursors, selections, ink, and user lists from `PresenceContext`. Add collaborative flourishes without re-implementing the basics."
								/>
								<TemplateCallout
									title="Auth & tokens"
									body="The `AuthContext` surfaces the MSAL instance so you can call Graph or other APIs. Customize the header or plug in additional account-aware UI."
								/>
								<TemplateCallout
									title="Schema playground"
									body="The root schema currently exposes only `metadata`. Add shared objects in `appSchema.ts`, update `createInitialAppState`, and wire them into this component to bring your ideas to life."
								/>
							</section>
						</div>
					</main>
				</div>
			</PresenceContext.Provider>
		);
}

function formatConnectionState(state: ConnectionState): string {
	switch (state) {
		case ConnectionState.Connected:
			return "connected";
		case ConnectionState.Disconnected:
			return "disconnected";
		case ConnectionState.EstablishingConnection:
			return "connecting";
		case ConnectionState.CatchingUp:
			return "syncing";
		default:
			return "unknown";
	}
}

interface TemplateCalloutProps {
	title: string;
	body: string;
}

function TemplateCallout({ title, body }: TemplateCalloutProps): JSX.Element {
	return (
		<div className="flex h-full flex-col justify-between space-y-2 rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm">
			<Text weight="semibold" className="text-sm uppercase tracking-wide text-neutral-500">
				{title}
			</Text>
			<Text className="text-base leading-relaxed text-neutral-700">{body}</Text>
		</div>
	);
}

export function Header(props: {
	saved: boolean;
	connectionState: string;
	title: string;
}): JSX.Element {
	const { saved, connectionState, title } = props;

	return (
		<div className="h-[48px] flex shrink-0 flex-row items-center justify-between bg-black text-base text-white z-[9999] w-full text-nowrap">
			<div className="flex items-center">
				<div className="flex ml-2 mr-8">
					<Text weight="bold">{title}</Text>
				</div>
			</div>
			<div className="flex flex-row items-center m-2">
				<SaveStatus saved={saved} />
				<HeaderDivider />
				<ConnectionStatus connectionState={connectionState} />
				<HeaderDivider />
				<UserCorner />
			</div>
		</div>
	);
}

export function SaveStatus(props: { saved: boolean }): JSX.Element {
	const { saved } = props;
	return (
		<div className="flex items-center">
			<Text>{saved ? "" : "not"}&nbsp;saved</Text>
		</div>
	);
}

export function ConnectionStatus(props: { connectionState: string }): JSX.Element {
	const { connectionState } = props;
	return (
		<div className="flex items-center">
			<Text>{connectionState}</Text>
		</div>
	);
}

export function UserCorner(): JSX.Element {
	return (
		<div className="flex flex-row items-center gap-4 mr-2">
			<Facepile />
			<CurrentUser />
		</div>
	);
}

export const HeaderDivider = (): JSX.Element => {
	return <ToolbarDivider />;
};

/**
 * CurrentUser component displays the current user's avatar with a context menu.
 * The context menu includes a sign-out option that uses MSAL to properly
 * log out the user and redirect them to the login page.
 */
export const CurrentUser = (): JSX.Element => {
	const users = useContext(PresenceContext).users;
	const currentUser = users.getMyself().value;
	const { msalInstance } = useContext(AuthContext);

	// Get the user's email from MSAL account
	const userEmail = msalInstance?.getActiveAccount()?.username || currentUser.name;

	const handleSignOut = async () => {
		if (msalInstance) {
			await signOutHelper(msalInstance);
		}
	};

	const handleSwitchAccount = async () => {
		if (msalInstance) {
			await switchAccountHelper(msalInstance);
		}
	};

	return (
		<Menu>
			<MenuTrigger disableButtonEnhancement>
				<Tooltip
					content={`${currentUser.name} (${userEmail}) - Click for options`}
					relationship="label"
				>
					<Avatar
						name={currentUser.name}
						image={currentUser.image ? { src: currentUser.image } : undefined}
						size={24}
						style={{ cursor: "pointer" }}
					/>
				</Tooltip>
			</MenuTrigger>
			<MenuPopover>
				<MenuList>
					<MenuItem icon={<PersonSwap20Regular />} onClick={handleSwitchAccount}>
						Switch account
					</MenuItem>
					<MenuItem icon={<SignOut20Regular />} onClick={handleSignOut}>
						Sign out
					</MenuItem>
				</MenuList>
			</MenuPopover>
		</Menu>
	);
};

export const Facepile = (props: Partial<AvatarGroupProps>) => {
	const users = useContext(PresenceContext).users;
	const [userRoster, setUserRoster] = useState(users.getConnectedUsers());

	useEffect(() => {
		// Check for changes to the user roster and update the avatar group if necessary
		const unsubscribe = users.events.on("remoteUpdated", () => {
			setUserRoster(users.getConnectedUsers());
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		// Update the user roster when users disconnect
		const unsubscribe = users.attendees.events.on("attendeeDisconnected", () => {
			setUserRoster(users.getConnectedUsers());
		});
		return unsubscribe;
	}, []);

	const { inlineItems, overflowItems } = partitionAvatarGroupItems<User>({
		items: userRoster,
		maxInlineItems: 3, // Maximum number of inline avatars before showing overflow
	});

	if (inlineItems.length === 0) {
		return null; // No users to display
	}

	return (
		<AvatarGroup size={24} {...props}>
			{inlineItems.map((user) => (
				<Tooltip
					key={String(user.client.attendeeId ?? user.value.name)}
					content={user.value.name}
					relationship={"label"}
				>
					<AvatarGroupItem
						name={user.value.name}
						image={user.value.image ? { src: user.value.image } : undefined}
						key={String(user.client.attendeeId ?? user.value.name)}
					/>
				</Tooltip>
			))}
			{overflowItems && (
				<AvatarGroupPopover>
					{overflowItems.map((user) => (
						<AvatarGroupItem
							name={user.value.name}
							image={user.value.image ? { src: user.value.image } : undefined}
							key={String(user.client.attendeeId ?? user.value.name)}
						/>
					))}
				</AvatarGroupPopover>
			)}
		</AvatarGroup>
	);
};
