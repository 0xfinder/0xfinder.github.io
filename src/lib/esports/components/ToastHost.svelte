<script lang="ts">
	import { dismissToast, toasts } from '../toasts.svelte';
</script>

{#snippet host(side: 'left' | 'right')}
	<div class="toast-host {side}">
		{#each toasts.filter((t) => t.side === side) as toast (toast.id)}
			<button
				type="button"
				class="toast-watcher"
				onclick={() => dismissToast(toast.id)}
			>
				{#if toast.image}
					<div class="toast-image">
						<img src={toast.image} alt="" />
					</div>
				{/if}
				<h4>{toast.message}</h4>
			</button>
		{/each}
	</div>
{/snippet}

{@render host('left')}
{@render host('right')}
