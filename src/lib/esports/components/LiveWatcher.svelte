<script lang="ts">
	import { prefs } from '../prefs.svelte';
	import { pushToast } from '../toasts.svelte';
	import type { GameMetadata, Team, WindowFrame, WindowParticipant } from '../types';

	type Props = {
		lastWindowFrame: WindowFrame;
		gameIndex: number;
		gameMetadata: GameMetadata;
		championsUrlWithPatchVersion: string;
		blueTeam: Team;
		redTeam: Team;
	};

	let {
		lastWindowFrame,
		gameIndex,
		gameMetadata,
		championsUrlWithPatchVersion,
		blueTeam,
		redTeam
	}: Props = $props();

	const AUDIO = {
		kill: '/esports/audio/champion_slain.ogg',
		towerBlue: '/esports/audio/blue_turret_destroyed.ogg',
		towerRed: '/esports/audio/red_turret_destroyed.ogg',
		dragonBlue: '/esports/audio/blue_dragon_slain.ogg',
		dragonRed: '/esports/audio/red_dragon_slain.ogg',
		baronBlue: '/esports/audio/blue_baron_slain.ogg',
		baronRed: '/esports/audio/red_baron_slain.ogg',
		inhibitorBlue: '/esports/audio/blue_inhibitor_destroyed.ogg',
		inhibitorRed: '/esports/audio/red_inhibitor_destroyed.ogg'
	} as const;

	type Snapshot = {
		gameIndex: number;
		inhibitors: { blue: number; red: number };
		barons: { blue: number; red: number };
		towers: { blue: number; red: number };
		dragons: { blue: number; red: number };
		participants: { blue: WindowParticipant[]; red: WindowParticipant[] };
	};

	const snapshot = (frame: WindowFrame, index: number): Snapshot => ({
		gameIndex: index,
		inhibitors: { blue: frame.blueTeam.inhibitors, red: frame.redTeam.inhibitors },
		barons: { blue: frame.blueTeam.barons, red: frame.redTeam.barons },
		towers: { blue: frame.blueTeam.towers, red: frame.redTeam.towers },
		dragons: { blue: frame.blueTeam.dragons.length, red: frame.redTeam.dragons.length },
		participants: { blue: frame.blueTeam.participants, red: frame.redTeam.participants }
	});

	// Teams are sometimes reported on the wrong side, so resolve the real blue/red.
	const swapTeams = $derived(blueTeam.id !== gameMetadata.blueTeamMetadata.esportsTeamId);
	const trueBlueTeam = $derived(swapTeams ? redTeam : blueTeam);
	const trueRedTeam = $derived(swapTeams ? blueTeam : redTeam);

	function championImage(side: 'blue' | 'red', participantId: number): string {
		const metadata =
			side === 'blue'
				? gameMetadata.blueTeamMetadata.participantMetadata
				: gameMetadata.redTeamMetadata.participantMetadata;
		const index = participantId - (side === 'blue' ? 1 : 6);
		return `${championsUrlWithPatchVersion}${metadata[index]?.championId}.png`;
	}

	function announce(before: Snapshot, after: Snapshot) {
		// Only one sound per batch so a teamfight does not stack effects.
		let soundSlotTaken = !prefs.sound;
		const queue: Array<() => void> = [];

		const push = (
			side: 'blue' | 'red',
			message: string,
			sound: string,
			image: string,
			diff?: number
		) => {
			const soundAllowed = !soundSlotTaken;
			soundSlotTaken = true;
			queue.push(() => {
				if (soundAllowed) {
					const audio = new Audio(sound);
					audio.load();
					audio.volume = 0.2;
					audio.play().catch(() => {});
				}
				pushToast({
					id: `${side}_${image}_${message}_${diff ?? ''}`,
					kind: side === 'blue' ? 'info' : 'error',
					message,
					image,
					side: side === 'blue' ? 'left' : 'right'
				});
			});
		};

		// A rising blue-side count means the blue team took a red objective.
		if (before.inhibitors.blue !== after.inhibitors.blue)
			push('blue', 'Destroyed an inhibitor', AUDIO.inhibitorRed, trueBlueTeam.image);
		if (before.inhibitors.red !== after.inhibitors.red)
			push('red', 'Destroyed an inhibitor', AUDIO.inhibitorBlue, trueRedTeam.image);
		if (before.barons.blue !== after.barons.blue)
			push('blue', 'Defeated the baron', AUDIO.baronBlue, trueBlueTeam.image);
		if (before.barons.red !== after.barons.red)
			push('red', 'Defeated the baron', AUDIO.baronRed, trueRedTeam.image);
		if (before.dragons.blue !== after.dragons.blue)
			push('blue', 'Defeated the dragon', AUDIO.dragonBlue, trueBlueTeam.image);
		if (before.dragons.red !== after.dragons.red)
			push('red', 'Defeated the dragon', AUDIO.dragonRed, trueRedTeam.image);
		if (before.towers.blue !== after.towers.blue)
			push('blue', 'Destroyed a turret', AUDIO.towerRed, trueBlueTeam.image);
		if (before.towers.red !== after.towers.red)
			push('red', 'Destroyed a turret', AUDIO.towerBlue, trueRedTeam.image);

		for (const side of ['blue', 'red'] as const) {
			const previous = before.participants[side];
			const current = after.participants[side];
			for (let i = 0; i < previous.length; i++) {
				if (previous[i].kills !== current[i]?.kills) {
					push(
						side,
						'Killed an enemy',
						AUDIO.kill,
						championImage(side, previous[i].participantId),
						(current[i]?.kills ?? 0) - previous[i].kills
					);
				}
			}
		}

		for (const fire of queue) fire();
	}

	// Held outside reactive state: this is the previous frame, not something to render.
	let previous: Snapshot | undefined;

	$effect(() => {
		const frame = lastWindowFrame;
		const index = gameIndex;
		const current = snapshot(frame, index);

		// Switching games re-baselines instead of reporting a wave of fake events.
		if (previous && previous.gameIndex === index) announce(previous, current);
		previous = current;
	});
</script>
