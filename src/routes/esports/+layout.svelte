<script lang="ts">
	import '$lib/esports/css/esports.css';
	import '$lib/esports/css/overrides.css';
	import ToastHost from '$lib/esports/components/ToastHost.svelte';

	let { children } = $props();
</script>

<!-- Every ported selector is scoped under .esports so it cannot leak site-wide. -->
<div class="esports">
	{@render children()}
	<ToastHost />
</div>
