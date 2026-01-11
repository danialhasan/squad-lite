<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'

export interface OutputLine {
  agentId: string
  stream: 'stdout' | 'stderr'
  content: string
  timestamp: string
}

const props = defineProps<{
  outputs: OutputLine[]
  selectedAgentId?: string | null
}>()

const outputRef = ref<HTMLElement | null>(null)

// Filter outputs by selected agent
const filteredOutputs = computed(() => {
  if (!props.selectedAgentId) return props.outputs
  return props.outputs.filter(o => o.agentId === props.selectedAgentId)
})

// Auto-scroll
watch(
  () => filteredOutputs.value.length,
  async () => {
    await nextTick()
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  }
)

// Truncate agent ID
const shortId = (id: string) => id.slice(0, 8)
</script>

<template>
  <div class="output-panel">
    <div ref="outputRef" class="panel-content">
      <div
        v-for="(line, idx) in filteredOutputs"
        :key="`${line.agentId}-${line.timestamp}-${idx}`"
        :class="['output-line', { 'is-stderr': line.stream === 'stderr' }]"
      >
        <span class="line-prefix">
          [{{ shortId(line.agentId) }}]
        </span>
        <span class="line-content">{{ line.content }}</span>
      </div>

      <div v-if="filteredOutputs.length === 0" class="empty-state">
        No output yet
      </div>
    </div>
  </div>
</template>

<style scoped>
.output-panel {
  background: var(--ctp-crust);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Monaco', 'Menlo', monospace;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
  font-size: 0.8em;
  line-height: 1.6;
  min-height: 0;
}

.output-line {
  padding: 3px 8px;
  color: var(--ctp-subtext0);
  word-break: break-all;
  border-radius: 3px;
}

.output-line.is-stderr {
  color: var(--ctp-red);
  background: rgba(243, 139, 168, 0.08);
}

.line-prefix {
  color: var(--ctp-overlay0);
  margin-right: 8px;
  font-weight: 500;
}

.line-content {
  white-space: pre-wrap;
}

.empty-state {
  text-align: center;
  color: var(--ctp-overlay0);
  padding: 32px;
  font-style: italic;
}
</style>
