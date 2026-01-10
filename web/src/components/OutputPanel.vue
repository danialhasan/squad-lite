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
    <div class="panel-header">
      <h3>Output</h3>
      <span class="count">{{ filteredOutputs.length }} lines</span>
    </div>

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
  background: #11111b;
  border: 1px solid #313244;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'Monaco', 'Menlo', monospace;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #313244;
  background: #1e1e2e;
}

.panel-header h3 {
  margin: 0;
  font-size: 0.95em;
  color: #cdd6f4;
  font-family: inherit;
}

.count {
  color: #6c7086;
  font-size: 0.8em;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  font-size: 0.85em;
  line-height: 1.5;
}

.output-line {
  padding: 2px 8px;
  color: #a6adc8;
  word-break: break-all;
}

.output-line.is-stderr {
  color: #f38ba8;
  background: rgba(243, 139, 168, 0.1);
}

.line-prefix {
  color: #6c7086;
  margin-right: 8px;
}

.line-content {
  white-space: pre-wrap;
}

.empty-state {
  text-align: center;
  color: #6c7086;
  padding: 32px;
  font-style: italic;
}
</style>
