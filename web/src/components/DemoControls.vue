<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  spawn: []
  submitTask: [task: string]
  reset: []
}>()

const taskInput = ref('')
const isSpawning = ref(false)
const isSubmitting = ref(false)

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
</script>

<template>
  <div class="demo-controls">
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
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 8px;
  padding: 16px;
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
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spawn {
  background: #89b4fa;
  color: #1e1e2e;
}

.btn-reset {
  background: #45475a;
  color: #cdd6f4;
}

.btn-submit {
  background: #a6e3a1;
  color: #1e1e2e;
}

.task-input {
  flex: 1;
  padding: 10px 14px;
  background: #181825;
  border: 1px solid #313244;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 0.95em;
}

.task-input::placeholder {
  color: #6c7086;
}

.task-input:focus {
  outline: none;
  border-color: #89b4fa;
}
</style>
