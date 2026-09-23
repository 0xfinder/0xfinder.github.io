<script lang="ts">
	import { prefs, setPref, type PrefKey } from '../prefs.svelte';

	type Props = {
		prefKey: PrefKey;
		variant: string;
		onGlyph: string;
		offGlyph: string;
	};

	let { prefKey, variant, onGlyph, offGlyph }: Props = $props();

	const on = $derived(prefs[prefKey]);
	const toggle = () => setPref(prefKey, !on);
</script>

<div class="toggle-container">
	<div
		class="{variant} {on ? 'muted' : ''}"
		role="switch"
		aria-checked={on}
		aria-label={prefKey}
		tabindex="0"
		onclick={toggle}
		onkeydown={(event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				toggle();
			}
		}}
	>
		<div class="notch">{on ? onGlyph : offGlyph}</div>
	</div>
</div>
