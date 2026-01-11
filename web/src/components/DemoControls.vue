<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isMockMode?: boolean
}>()

const emit = defineEmits<{
  spawn: []
  submitTask: [task: string]
  reset: []
}>()

const taskInput = ref('')
const isSpawning = ref(false)
const isSubmitting = ref(false)

// Demo helper state
const showDemoHelper = ref(true)

const handleSpawn = async () => {
  isSpawning.value = true
  emit('spawn')
  // Reset after animation
  setTimeout(() => { isSpawning.value = false }, 1000)
}

const handleSubmit = () => {
  if (!taskInput.value.trim()) return
  isSubmitting.value = true
  emit('submitTask', taskInput.value)
  setTimeout(() => { isSubmitting.value = false }, 1000)
}

const handleReset = () => {
  taskInput.value = ''
  emit('reset')
}

const dismissHelper = () => {
  showDemoHelper.value = false
}
</script>

<template>
  <div class="demo-controls">
    <!-- Demo Mode Helper (shown in mock mode) -->
    <div v-if="isMockMode && showDemoHelper" class="demo-helper">
      <div class="demo-helper-content">
        <span class="demo-badge">DEMO MODE</span>
        <div class="demo-tips">
          <p><strong>Quick Start:</strong></p>
          <ol>
            <li>Click <strong>Spawn Director</strong> to create an agent</li>
            <li>Type a task and click <strong>Submit Task</strong></li>
            <li>Watch coordination unfold in Messages</li>
            <li><strong>Kill</strong> an agent, then <strong>Restart</strong> to see checkpoint resume</li>
          </ol>
        </div>
        <button class="dismiss-btn" @click="dismissHelper">Got it</button>
      </div>
    </div>

    <div class="controls-row">
      <button
        class="btn btn-spawn"
        :disabled="isSpawning"
        @click="handleSpawn"
      >
        {{ isSpawning ? 'Spawning...' : 'Spawn Director' }}
      </button>

      <button
        class="btn btn-reset"
        @click="handleReset"
      >
        Reset Demo
      </button>
    </div>

    <div class="task-input-row">
      <input
        v-model="taskInput"
        type="text"
        placeholder="Enter task for Director..."
        class="task-input"
        @keyup.enter="handleSubmit"
      />
      <button
        class="btn btn-submit"
        :disabled="!taskInput.trim() || isSubmitting"
        @click="handleSubmit"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit Task' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.demo-controls {
  background: var(--ctp-base);
  border: 1px solid var(--ctp-surface0);
  border-radius: 8px;
  padding: 16px;
}

/* Demo Mode Helper */
.demo-helper {
  margin-bottom: 16px;
  padding: 14px;
  background: rgba(137, 180, 250, 0.08);
  border: 1px solid rgba(137, 180, 250, 0.25);
  border-radius: 8px;
  animation: fadeInUp 0.3s ease-out;
}

.demo-helper-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-badge {
  display: inline-block;
  padding: 4px 10px;
  background: var(--ctp-blue);
  color: var(--ctp-crust);
  font-size: 0.75em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px;
  width: fit-content;
}

.demo-tips {
  color: var(--ctp-subtext0);
  font-size: 0.9em;
  line-height: 1.5;
}

.demo-tips p {
  margin: 0 0 6px 0;
  color: var(--ctp-text);
}

.demo-tips ol {
  margin: 0;
  padding-left: 20px;
}

.demo-tips li {
  margin-bottom: 4px;
}

.demo-tips strong {
  color: var(--ctp-blue);
}

.dismiss-btn {
  align-self: flex-end;
  padding: 6px 14px;
  background: var(--ctp-surface0);
  color: var(--ctp-subtext0);
  border: none;
  border-radius: 4px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dismiss-btn:hover {
  background: var(--ctp-surface1);
  color: var(--ctp-text);
}

.controls-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.task-input-row {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spawn {
  background: var(--ctp-blue);
  color: var(--ctp-crust);
}

.btn-spawn:hover:not(:disabled) {
  background: #9fc5fb;
}

.btn-reset {
  background: var(--ctp-surface1);
  color: var(--ctp-text);
}

.btn-reset:hover:not(:disabled) {
  background: var(--ctp-surface2);
}

.btn-submit {
  background: var(--ctp-green);
  color: var(--ctp-crust);
}

.btn-submit:hover:not(:disabled) {
  background: #b8ebb3;
}

.task-input {
  flex: 1;
  padding: 10px 14px;
  background: var(--ctp-mantle);
  border: 1px solid var(--ctp-surface0);
  border-radius: 6px;
  color: var(--ctp-text);
  font-size: 0.95em;
  transition: border-color 0.15s ease;
}

.task-input::placeholder {
  color: var(--ctp-overlay0);
}

.task-input:focus {
  outline: none;
  border-color: var(--ctp-blue);
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-helper {
    animation: none;
  }
}
</style>
