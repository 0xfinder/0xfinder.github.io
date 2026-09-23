<script lang="ts">
	type Props = {
		currentHealth: number;
		maxHealth: number;
	};

	let { currentHealth, maxHealth }: Props = $props();
</script>

<div class="mini-health-bar player-stats-health">
	<div>
		<span class="mini-current-health">{currentHealth}/{maxHealth}</span>
		<div style="width: {(100 * currentHealth) / maxHealth}%"></div>
	</div>
</div>
